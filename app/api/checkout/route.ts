import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, campaignId } = body; 

        // 0. Auth Check
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // 1. Get or Create Stripe Customer for Donor
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

        // 3. Get All Milestones
        const { data: milestones } = await supabaseAdmin
            .from("milestones")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("milestone_index", { ascending: true });

        if (!milestones || milestones.length === 0) {
            throw new Error("Campaign has no milestones set up.");
        }

        // 4. Traffic Light Logic
        const currentRaised = Number(campaign.collected_amount || 0);
        const currentIndices = campaign.current_milestone_index || 0;
        const currentMilestone = milestones.find(m => m.milestone_index === currentIndices);
        
        if (!currentMilestone) throw new Error("Current milestone index mismatch.");

        let cumulativeCap = 0;
        for (const m of milestones) {
            if (m.milestone_index <= currentIndices) {
                cumulativeCap += Number(m.target_amount);
            }
        }

        const donationAmount = Number(amount);
        const willExceedCap = (currentRaised + donationAmount) > cumulativeCap;
        const isMilestoneLocked = currentMilestone.status !== 'active';

        let transferData = null;
        let dashboardDescription = ""; 

        if (destAccountId && !willExceedCap && !isMilestoneLocked) {
            // GREEN LIGHT: Direct Transfer
            transferData = {
                destination: destAccountId, 
            };
            dashboardDescription = `Donation to: ${campaign.title}`;
        } else {
            // RED LIGHT: Escrow (Held in Platform)
            transferData = undefined; 
            dashboardDescription = `🔒 ESCROW: ${campaign.title} (Held in WheresTheFund)`;
        }

        // 5. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(donationAmount * 100),
            currency: 'myr',
            customer: stripeCustomerId,
            payment_method_types: ['card', 'fpx'],
            
            // --- UPDATED FIELD: USE SUFFIX INSTEAD ---
            description: dashboardDescription, 
            
            // Fix: statement_descriptor is deprecated for cards. Use suffix.
            // Result on Bank Statement: "YOUR_STRIPE_NAME * WheresTheFund"
            statement_descriptor_suffix: "WheresTheFund", 
            // -----------------------------------------

            metadata: {
                campaignId: campaignId,
                donorId: user.id, 
                donorEmail: user.email || "unknown", 
                milestoneIndex: currentIndices.toString(),
                escrowStatus: transferData ? "DIRECT_TRANSFER" : "HELD_IN_PLATFORM" 
            },
            
            transfer_data: transferData || undefined, 
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        console.error('PAYMENT ERROR:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}