import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Contract, parseUnits } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";
import { Resend } from 'resend';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const RESEND_KEY = process.env.RESEND_API_KEY;

const stripe = new Stripe(STRIPE_SECRET);
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Blockchain Types
const EIP712_DOMAIN = {
    name: "NGOPlatform",
    version: "1",
    chainId: QUORUM_CHAIN_ID,
    verifyingContract: CONTRACT_ADDRESS,
};

const TYPES = {
    Donate: [
        { name: "onChainId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "paymentRef", type: "string" },
        { name: "nonce", type: "uint256" },
    ],
};

export async function POST(req: Request) {
    console.log("🔔 Webhook hit! Starting process..."); 

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;
    let event: Stripe.Event;

    // 1. VERIFY SIGNATURE
    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error(`⚠️ Webhook signature failed:`, err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 2. HANDLE SUCCESSFUL PAYMENT
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentId = paymentIntent.id;
        
        const { campaignId, donorId, donorEmail } = paymentIntent.metadata;
        const amountRM = paymentIntent.amount / 100;

        if (!campaignId || !donorId) {
            console.error("❌ MISSING METADATA");
            return new NextResponse("Missing Metadata", { status: 400 });
        }

        console.log(`💰 Processing RM${amountRM} for Campaign ${campaignId}`);

        try {
            // A. IDEMPOTENCY CHECK
            const { data: existingDonation } = await supabaseAdmin
                .from("donations")
                .select("id, status")
                .eq("stripe_payment_id", paymentId)
                .single();

            if (existingDonation && existingDonation.status === "completed") {
                return new NextResponse("Already Processed", { status: 200 });
            }

            // B. FETCH USER KEY
            const { data: userProfile } = await supabaseAdmin
                .from("users")
                .select("wallet_address, kms_key_id")
                .eq("id", donorId)
                .single();

            if (!userProfile) throw new Error("User profile not found");

            // C. SAVE TO DB
            let donationDbId = existingDonation?.id;
            if (!donationDbId) {
                const { data: newDonation, error } = await supabaseAdmin
                    .from("donations")
                    .insert({
                        campaign_id: campaignId,
                        donor_id: donorId,
                        amount: amountRM,
                        stripe_payment_id: paymentId,
                        status: "Processing",
                    })
                    .select("id")
                    .single();
                
                if (error) throw new Error(`DB Insert Error: ${error.message}`);
                donationDbId = newDonation.id;
            }

            // D. BLOCKCHAIN TRANSACTION
            console.log("🔐 Signing with KMS...");
            const signer = createKmsSigner(userProfile.kms_key_id!);
            const signerAddress = await signer.getAddress();
            const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
            
            const { data: campaignData, error: campaignError } = await supabaseAdmin
                .from("campaigns")
                .select("on_chain_id, title, ngo_id") 
                .eq("id", campaignId)
                .single();
            
            if (campaignError || !campaignData) {
                throw new Error(`Campaign Fetch Failed: ${campaignError?.message || "Unknown"}`);
            }

            const expectedNonce = await campaignContract.nonces(signerAddress);
            const amountWei = parseUnits(amountRM.toString(), 18);
            const onChainId = BigInt(campaignData.on_chain_id);

            const value = {
                onChainId: onChainId,
                amount: amountWei,
                paymentRef: paymentId,
                nonce: Number(expectedNonce),
            };

            const sig = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);
            
            console.log("🔗 Sending to Blockchain...");
            const tx = await campaignContract.donateWithSignature(
                onChainId,
                amountWei,
                paymentId,
                expectedNonce,
                sig
            );

            console.log("✅ Tx Sent:", tx.hash);

            // Update Hash
            await supabaseAdmin
                .from("donations")
                .update({ on_chain_tx_hash: tx.hash })
                .eq("id", donationDbId);

            await tx.wait(); // Wait for mining

            // E. FINALIZE DB
            await supabaseAdmin
                .from("donations")
                .update({ status: "completed" })
                .eq("id", donationDbId);

            // F. UPDATE CAMPAIGN TOTALS & ESCROW LEDGER
            // ------------------------------------------------------------------
            const { data: currentCampaign } = await supabaseAdmin
                .from("campaigns")
                .select("collected_amount, escrow_balance, goal_amount, current_milestone_index, donations_count")
                .eq("id", campaignId)
                .single();

            const oldCollected = Number(currentCampaign?.collected_amount || 0);
            const oldEscrow = Number(currentCampaign?.escrow_balance || 0);
            const oldCount = Number(currentCampaign?.donations_count || 0); // Need this for math below

            // 1. Calculate new values
            const newCollected = oldCollected + amountRM;
            
            const isHeld = paymentIntent.metadata.escrowStatus === "HELD_IN_PLATFORM";
            const newEscrow = isHeld ? oldEscrow + amountRM : oldEscrow;

            const newCount = oldCount + 1; // Increment donor count
            const nowTime = new Date().toISOString(); // Set timestamp

            // 2. Perform Single Update
            await supabaseAdmin
                .from("campaigns")
                .update({ 
                    collected_amount: newCollected,
                    escrow_balance: newEscrow,
                    donations_count: newCount,
                    last_donation_at: nowTime
                })
                .eq("id", campaignId);
            // ------------------------------------------------------------------

            // G. TRAFFIC LIGHT CAP LOGIC
            const goal = Number(currentCampaign?.goal_amount || 0);
            const mIndex = currentCampaign?.current_milestone_index || 0;
            const cumulativeCaps = [goal * 0.20, goal * 0.60, goal * 1.00];
            const currentCap = cumulativeCaps[mIndex] || goal;

            if (newCollected >= currentCap) {
                console.log(`🚦 Cap Hit for Milestone ${mIndex}. Locking...`);
                await supabaseAdmin
                    .from("milestones")
                    .update({ status: 'pending_proof' })
                    .eq("campaign_id", campaignId)
                    .eq("milestone_index", mIndex);
            }

            // H. NOTIFICATIONS
            
            // 1. Email to Donor
            if (resend && donorEmail) {
                try {
                    await resend.emails.send({
                        from: 'onboarding@resend.dev',
                        to: donorEmail, 
                        subject: 'Donation Receipt',
                        html: `
                            <h1>Thank you!</h1>
                            <p>You donated <strong>RM${amountRM}</strong> to "${campaignData.title}".</p>
                            <p>Tx Hash: ${tx.hash}</p>
                        `
                    });
                    console.log("📧 Email sent to donor!");
                } catch (emailErr) {
                    console.error("⚠️ Email failed:", emailErr);
                }
            }

            // 2. In-App Notification (Updated to use ngo_id)
            if (campaignData.ngo_id) {
                await supabaseAdmin.from("notifications").insert({
                    user_id: campaignData.ngo_id, 
                    message: `New donation of RM${amountRM} received for ${campaignData.title}.`,
                    is_read: false
                });
                console.log("🔔 In-app notification inserted");
            }

            console.log("🎉 Process Complete!");

        } catch (error: any) {
            console.error("❌ Logic Failed:", error);
            if (paymentId) {
                await supabaseAdmin
                    .from("donations")
                    .update({ status: "Failed_Webhook", error_log: error.message })
                    .eq("stripe_payment_id", paymentId);
            }
            return new NextResponse(`Error: ${error.message}`, { status: 500 });
        }
    }

    return new NextResponse("Received", { status: 200 });
}