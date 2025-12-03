//app/stripe/connect/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser();

        const { data: profile } = await supabaseAdmin
            .from("ngo_profiles")
            .select("stripe_account_id")
            .eq("ngo_id", user.id)
            .single();

        let accountId = profile?.stripe_account_id;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "standard", // 'express' is best for platforms
                country: "MY",   // Malaysia
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            await supabaseAdmin
                .from("ngo_profiles")
                .update({ stripe_account_id: accountId })
                .eq("ngo_id", user.id);
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${baseUrl}/ngo-stripe/connect-refresh`, // If they click cancel/reload
            return_url: `${baseUrl}/ngo/dashboard?payment_setup=success`, // When they finish
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) {
        console.error("Stripe Connect Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}