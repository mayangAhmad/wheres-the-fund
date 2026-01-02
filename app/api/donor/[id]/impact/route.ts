import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const donorId = id;

    if (!donorId) {
        return NextResponse.json({ error: "No Donor ID provided" }, { status: 400 })
    }

    try {
        const { data: userDonations, error: userError } = await supabaseAdmin
            .from('donations')
            .select(`
                amount,
                milestone_index,
                campaign_id,
                campaigns (id, title)`)
            .eq('donor_id', donorId)
            .eq("status", "completed");

        if (userError) throw userError;

        //extract campaign ID user donated without duplicated
        const campaignIds = [... new Set(userDonations.map((d) => d.campaign_id))];

        if (campaignIds.length === 0) {
            return NextResponse.json({ campaigns: [], milestones: [] });
        }

        //fetch milestone for these campaigns
        const { data: milestoneDB, error: mError } = await supabaseAdmin
            .from('milestones')
            .select('*')
            .in('campaign_id', campaignIds)
            .order('milestone_index', { ascending: true });

        if (mError) throw mError;

        //ALL DONATIONS 
        const { data: allDonations, error: globalError } = await supabaseAdmin
            .from('donations')
            .select('amount, milestone_index, campaign_id')
            .in('campaign_id', campaignIds);

        if (globalError) throw globalError;

        //group donation by campaign with no duplication
        const campaignMap = new Map();

        userDonations.forEach((d: any) => {

            const campaignData = Array.isArray(d.campaigns) ? d.campaigns[0] : d.campaigns;
            if (!campaignMap.has(d.campaign_id)) {
                campaignMap.set(d.campaign_id, {
                    id: d.campaign_id,
                    name: campaignData.title,
                    totalDonated: 0
                });
            }
            const camp = campaignMap.get(d.campaign_id);
            camp.totalDonated += d.amount;
        });

        //MILESTONES
        const uiMilestones = milestoneDB.map((m) => {
            //global total (progress bar)
            const globalTotal = allDonations
                .filter((d) => d.campaign_id === m.campaign_id && d.milestone_index === m.milestone_index)
                .reduce((sum, d) => sum + d.amount, 0);

            //user contribution
            const myContribution = userDonations
                .filter((d: any) => d.campaign_id === m.campaign_id && d.milestone_index === m.milestone_index)
                .reduce((sum: number, d: any) => sum + d.amount, 0);

            //visual status
            let status = m.status;
            if (m.status !== 'locked' && globalTotal >= m.target_amount) {
                status = 'completed';
            }

            return {
                id: m.id,
                campaignId: m.campaign_id,
                name: m.title,
                targetAmount: m.target_amount,
                currentAmount: globalTotal,
                status: status,
                userContribution: myContribution
            };


        });

        return NextResponse.json({
            campaigns: Array.from(campaignMap.values()),
            milestones: uiMilestones
        });

    } catch (error: any) {
        console.log("Impact API Error: ", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}