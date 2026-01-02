import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, campaignId, isAnonymous } = body;

        // 0. Auth Check
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get or Create Stripe Customer
        let stripeCustomerId = null;
        const { data: userProfile } = await supabaseAdmin
            .from("donor_profiles")
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        if (userProfile?.stripe_customer_id) {
            stripeCustomerId = userProfile.stripe_customer_id;
        } else {
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                name: user.user_metadata?.name || "Donor",
                metadata: { userId: user.id }
            });
            stripeCustomerId = customer.id;
            await supabaseAdmin.from("donor_profiles").upsert({
                user_id: user.id,
                stripe_customer_id: stripeCustomerId
            });
        }

        // 2. Get Campaign & NGO Banking Details
        const { data: campaign } = await supabaseAdmin
            .from("campaigns")
            .select("*, ngo_profiles(stripe_account_id)")
            .eq("id", campaignId)
            .single();

        if (!campaign) throw new Error("Campaign not found.");
        const destAccountId = campaign.ngo_profiles?.stripe_account_id;

        // 3. Get Fixed 3 Milestones
        const { data: milestones } = await supabaseAdmin
            .from("milestones")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("milestone_index", { ascending: true });

        if (!milestones || milestones.length !== 3) throw new Error("Campaign must have exactly 3 milestones.");

        // 4. Spillover Calculation Logic
        const currentRaised = Number(campaign.collected_amount || 0);
        const currentIndex = campaign.current_milestone_index || 0;
        const currentMilestone = milestones.find(m => m.milestone_index === currentIndex);

        if (!currentMilestone) throw new Error("Current milestone index mismatch.");

        // Calculate the cumulative cap up to the current milestone
        let currentMilestoneCap = 0;
        for (let i = 0; i <= currentIndex; i++) {
            currentMilestoneCap += Number(milestones[i].target_amount);
        }

        const donationAmount = Number(amount);
        const isCurrentMilestoneOpen = currentMilestone.status === 'active';

        // Calculate split: Immediate Release vs Escrowed (Spillover)
        // Space left in the currently active phase
        const spaceInCurrentPhase = Math.max(0, currentMilestoneCap - currentRaised);

        // Direct amount is only what can fit in the currently active milestone
        const directAmount = isCurrentMilestoneOpen ? Math.min(donationAmount, spaceInCurrentPhase) : 0;

        // Everything else is escrowed (to be handled by the dynamic Webhook loop)
        const escrowAmount = Math.max(0, donationAmount - directAmount);

        // Define Transfer Data
        // Automatic transfer only if 100% of the donation is for the active milestone
        const canUseAutomaticTransfer = destAccountId && escrowAmount === 0 && isCurrentMilestoneOpen;

        // 5. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(donationAmount * 100),
            currency: 'myr',
            customer: stripeCustomerId,
            payment_method_types: ['card', 'fpx'],
            description: escrowAmount > 0
                ? `Partial Escrow: ${campaign.title}`
                : `Direct Donation: ${campaign.title}`,
            statement_descriptor_suffix: "WheresTheFund",

            metadata: {
                campaignId: campaignId,
                donorId: user.id,
                // We pass these amounts as hints for the Webhook to verify
                directAmount: directAmount.toString(),
                escrowAmount: escrowAmount.toString(),
                totalAmount: donationAmount.toString(),
                is_anonymous: isAnonymous ? "true" : "false"
            },
            transfer_data: canUseAutomaticTransfer ? { destination: destAccountId } : undefined,
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        console.error('PAYMENT ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}