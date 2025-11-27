import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, campaignId } = body;

        let user = await getAuthenticatedUser();
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
                email: user.email,
                name: user.user_metadata?.name || "donor",
                metadata: {
                    userId: user.id,
                }
            });

            stripeCustomerId = customer.id;

            await supabaseAdmin
                .from("donor_profiles")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("user_id", user.id)
        }

        const { data: campaign } = await supabaseAdmin
            .from("campaigns")
            .select("ngo_id")
            .eq("id", campaignId)
            .single();

        if (!campaign) throw new Error("Campaign not found.");

        const { data: ngoProfile } = await supabaseAdmin
            .from("ngo_profiles")
            .select("stripe_account_id")
            .eq("ngo_id", campaign.ngo_id)
            .single()

        const destAccountId = ngoProfile?.stripe_account_id;

        if (!destAccountId) {
            return NextResponse.json(
                { error: "This NGO has not connected their bank account yet." },
                { status: 404 }
            );
        }

        //create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), //convert to cent
            currency: 'myr',
            customer: stripeCustomerId,
            payment_method_types: ['card', 'fpx'],
            metadata: {
                campaignId: campaignId,
            },

            transfer_data: {
                destination: destAccountId, //move money to NGO acc
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error('INTERNAL ERROR:', error);
        return NextResponse.json(
            { error: `Error creating payment intent: ${error.message}` },
            { status: 500 }
        );
    }
}