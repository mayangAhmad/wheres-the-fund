import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { formatDistanceToNow } from 'date-fns';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const campaignId = id;

    try {
        if (!campaignId) {
            return NextResponse.json({ error: "No Campaign ID provided" }, { status: 400 });
        }

        //fetch milestone
        const { data: milestoneDB, error: mError } = await supabaseAdmin
            .from('milestones')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('milestone_index', { ascending: true });

        if (mError) throw mError;

        //fetch last 8 donations
        const { data: recentDonations, error: dError } = await supabaseAdmin
            .from('donations')
            .select(`id, amount, created_at, milestone_index`)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
            .limit(8);

        if (dError) throw dError;

        //fetch all donations (total amount per milestone)
        const { data: allDonations } = await supabaseAdmin
            .from('donations')
            .select('amount, milestone_index')
            .eq('campaign_id', campaignId);

        //calculate total (sum of donation by milestone index)
        const totals: Record<number, number> = {};
        allDonations?.forEach((d) => {
            totals[d.milestone_index] = (totals[d.milestone_index] || 0) + d.amount;
        });

        const uiMilestones = milestoneDB.map((m) => ({

            id: m.id,
            name: m.title,
            targetAmount: m.target_amount,
            currentAmount: totals[m.milestone_index] || 0,
            status: m.status,
            _index: m.milestone_index
        }));

        const uiDonors = (recentDonations || []).map((d: any) => {
            //link donor to milestone, map the 8 donor to their mltns
            const linkedMilestone = uiMilestones.find(m => m._index === d.milestone_index)

            return {
                id: d.id,
                name: "Anonymous",
                amount: `RM ${d.amount}`,
                targetMilestoneId: linkedMilestone?.id || "", //id milestone for specific donation
                time: formatDistanceToNow(new Date(d.created_at), { addSuffix: true }).replace("about", ""),
            };
        });

        return NextResponse.json({ milestones: uiMilestones, donors: uiDonors });
    } catch (error: any) {
        console.log("API Error: ", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}