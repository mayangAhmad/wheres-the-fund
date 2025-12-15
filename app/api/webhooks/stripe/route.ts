import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Contract, parseUnits } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(STRIPE_SECRET);

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
        let createDonationIds: string[] = []; // Track IDs for rollback

        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentId = paymentIntent.id;

        // Metadata contains what we need (passed during checkout creation)
        const { campaignId, donorId } = paymentIntent.metadata;
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
                .limit(1); // Check if ANY row exists for this payment

            // If we find any row that is completed, we stop.
            if (existingDonation && existingDonation.length > 0) {
                const isCompleted = existingDonation.some((d: any) => d.status === 'completed');
                if (isCompleted) {
                    console.log("⚠️ Already Processed. Skipping.");
                    return new NextResponse("Already Processed", { status: 200 });
                }
            }

            // B. FETCH USER KEY
            const { data: userProfile } = await supabaseAdmin
                .from("users")
                .select("wallet_address, kms_key_id")
                .eq("id", donorId)
                .single();

            if (!userProfile) throw new Error("User profile not found");

            // C. FETCH MILESTONES & CALCULATE TOTALS
            const { data: milestones } = await supabaseAdmin
                .from("milestones")
                .select("*")
                .eq("campaign_id", campaignId)
                .order("milestone_index", { ascending: true });

            const { data: allDonations } = await supabaseAdmin
                .from("donations")
                .select("amount, milestone_index")
                .eq("campaign_id", campaignId);

            const totals: Record<number, number> = {};
            allDonations?.forEach((d) => {
                totals[d.milestone_index] = (totals[d.milestone_index] || 0) + d.amount;
            });

            // D. PREPARE BLOCKCHAIN
            console.log("🔐 Signing with KMS...");
            const signer = createKmsSigner(userProfile.kms_key_id!);
            const signerAddress = await signer.getAddress();
            const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);

            // Get Nonce ONCE
            let currentNonce = Number(await campaignContract.nonces(signerAddress));

            const { data: campaignData } = await supabaseAdmin
                .from("campaigns")
                .select("on_chain_id")
                .eq("id", campaignId)
                .single();
            const onChainId = BigInt(campaignData?.on_chain_id);

            // E. THE SPLIT LOOP (Exact same logic as your manual API)
            let remainingToAllocate = amountRM;
            let txHashes: string[] = [];

            for (const m of (milestones || [])) {
                if (remainingToAllocate <= 0) break;

                const currentRaised = totals[m.milestone_index] || 0;
                const spaceLeft = m.target_amount - currentRaised;

                // If it's the last milestone, dump everything here
                const isLastOne = (m.milestone_index === milestones![milestones!.length - 1].milestone_index);

                if (spaceLeft <= 0 && !isLastOne) continue;

                let allocation = 0;
                if (isLastOne) {
                    allocation = remainingToAllocate;
                } else {
                    allocation = Math.min(remainingToAllocate, spaceLeft);
                }

                if (allocation > 0) {
                    console.log(`>>> Allocating RM ${allocation} to Milestone ${m.milestone_index}`);

                    // 1. INSERT TO DB
                    const { data: donationRecord, error } = await supabaseAdmin
                        .from("donations")
                        .insert({
                            campaign_id: campaignId,
                            donor_id: donorId,
                            amount: allocation,
                            stripe_payment_id: paymentId,
                            status: "Processing",
                            milestone_index: m.milestone_index
                        })
                        .select("id")
                        .single();

                    if (error) throw new Error(`DB Insert Error: ${error.message}`);
                    createDonationIds.push(donationRecord.id);

                    // 2. SIGN EIP-712
                    const amountWei = parseUnits(allocation.toFixed(2), 18);

                    const value = {
                        onChainId: onChainId,
                        amount: amountWei,
                        paymentRef: `${paymentId}_M${m.milestone_index}`, // Unique Ref
                        nonce: currentNonce,
                    };

                    const sig = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

                    // 3. SEND TRANSACTION
                    console.log("🔗 Sending to Blockchain...");
                    const tx = await campaignContract.donateWithSignature(
                        onChainId,
                        amountWei,
                        `${paymentId}_M${m.milestone_index}`,
                        currentNonce,
                        sig
                    );

                    console.log("✅ Tx Sent:", tx.hash);
                    txHashes.push(tx.hash);

                    // 4. UPDATE DB
                    await supabaseAdmin
                        .from("donations")
                        .update({ on_chain_tx_hash: tx.hash, status: "completed" })
                        .eq("id", donationRecord.id);

                    const newTotalForMilestone = currentRaised + allocation;

                    // If we reached or exceeded the target
                    if (newTotalForMilestone >= m.target_amount) {
                        console.log(`🔒 Milestone ${m.milestone_index} capped! Updating status to pending_proof...`);
                        
                        await supabaseAdmin
                            .from("milestones")
                            .update({ status: "pending_proof" }) 
                            .eq("id", m.id);
                    }

                    // 5. UPDATE LOOP
                    remainingToAllocate -= allocation;
                    currentNonce++;
                    await tx.wait(); // Wait for mining to be safe
                }
            }

            // F. UPDATE CAMPAIGN TOTALS
            const { data: currentCampaign } = await supabaseAdmin
                .from("campaigns")
                .select("collected_amount, donations_count")
                .eq("id", campaignId)
                .single();

            const newTotal = (currentCampaign?.collected_amount || 0) + amountRM;
            const newCount = (currentCampaign?.donations_count || 0) + 1;
            
            // Capture the current time in ISO format
            const now = new Date().toISOString(); 

            await supabaseAdmin
                .from("campaigns")
                .update({ 
                    collected_amount: newTotal,
                    donations_count: newCount,
                    last_donation_at: now // <--- Update timestamp here
                })
                .eq("id", campaignId);

            console.log("🎉 Webhook Process Complete!");

        } catch (error: any) {
            console.error("❌ Logic Failed:", error);

            // Cleanup failed rows
            if (createDonationIds.length > 0) {
                await supabaseAdmin
                    .from("donations")
                    .update({ status: "Failed_Webhook", error_log: error.message })
                    .in("id", createDonationIds);
            }
            return new NextResponse(`Error: ${error.message}`, { status: 500 });
        }
    }

    return new NextResponse("Received", { status: 200 });
}