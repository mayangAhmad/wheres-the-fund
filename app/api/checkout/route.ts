// app/api/checkout/route.ts
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
            .select("*, ngo_profiles(stripe_account_id, account_status)")
            .eq("id", campaignId)
            .single();

        if (!campaign) throw new Error("Campaign not found.");
        
        const destAccountId = campaign.ngo_profiles?.stripe_account_id;
        const ngoAccountStatus = (campaign.ngo_profiles as any)?.account_status;

        // ⭐ Check if NGO is blocked
        if (ngoAccountStatus === 'blocked') {
            return NextResponse.json({ 
                error: "This campaign is temporarily suspended. Donations are not being accepted." 
            }, { status: 403 });
        }

        // 3. Get Milestones
        const { data: milestones } = await supabaseAdmin
            .from("milestones")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("milestone_index", { ascending: true });

        if (!milestones || milestones.length !== 3) {
            throw new Error("Campaign must have exactly 3 milestones.");
        }

        // ⭐ Check if campaign is fully funded
        const totalGoal = milestones.reduce((sum, m) => sum + Number(m.target_amount), 0);
        const currentCollected = Number(campaign.collected_amount || 0);
        
        if (currentCollected >= totalGoal) {
            return NextResponse.json({ 
                error: "This campaign has reached its funding goal and is no longer accepting donations." 
            }, { status: 400 });
        }

        // 4. ⭐ CORRECTED: Calculate Direct vs Escrow (matches webhook logic)
        const donationAmount = Number(amount);
        let directAmount = 0;
        let escrowAmount = 0;
        let remainingToAllocate = donationAmount;
        let runningTotal = currentCollected;

        for (const m of milestones) {
            const milestoneTarget = Number(m.target_amount);

            if (runningTotal < milestoneTarget && remainingToAllocate > 0) {
                const roomInThisMilestone = milestoneTarget - runningTotal;
                const amountForThisMilestone = Math.min(remainingToAllocate, roomInThisMilestone);

                if (amountForThisMilestone > 0) {
                    // ⭐ Same logic as webhook
                    const isDirect = (m.status === 'active' || m.status === 'approved');
                    
                    if (isDirect) {
                        directAmount += amountForThisMilestone;
                    } else {
                        escrowAmount += amountForThisMilestone;
                    }

                    remainingToAllocate -= amountForThisMilestone;
                    runningTotal += amountForThisMilestone;
                }
            }
            
            if (remainingToAllocate <= 0) break;
        }

        // 5. ⭐ CORRECTED: Only use automatic transfer if 100% is direct
        const canUseAutomaticTransfer = destAccountId && escrowAmount === 0 && directAmount > 0;

        // 6. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(donationAmount * 100),
            currency: 'myr',
            customer: stripeCustomerId,
            payment_method_types: ['card', 'fpx'],
            description: escrowAmount > 0
                ? `${campaign.title} (RM ${directAmount.toFixed(2)} direct + RM ${escrowAmount.toFixed(2)} escrowed)`
                : `${campaign.title} - Direct Donation`,
            statement_descriptor_suffix: "WheresTheFund",

            metadata: {
                campaignId: campaignId,
                donorId: user.id,
                directAmount: directAmount.toFixed(2),
                escrowAmount: escrowAmount.toFixed(2),
                totalAmount: donationAmount.toFixed(2),
                is_anonymous: isAnonymous ? "true" : "false"
            },
            
            // ⭐ Only use automatic transfer if all money goes direct to NGO
            transfer_data: canUseAutomaticTransfer ? { destination: destAccountId } : undefined,
        });

        return NextResponse.json({ 
            clientSecret: paymentIntent.client_secret,
            // ⭐ Optional: Return breakdown for UI display
            breakdown: {
                total: donationAmount,
                direct: directAmount,
                escrow: escrowAmount
            }
        });

    } catch (error: any) {
        console.error('CHECKOUT ERROR:', error);
        return NextResponse.json({ 
            error: error.message || "Failed to process payment" 
        }, { status: 500 });
    }
}