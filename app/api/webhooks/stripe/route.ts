import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Contract, parseUnits } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";

const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(STRIPE_SECRET);

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

interface Allocation {
    index: number;
    amount: number;
    id?: string;
    isEscrow: boolean;
}

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentId = paymentIntent.id;

        const { campaignId, donorId, is_anonymous } = paymentIntent.metadata;
        const amountRM = paymentIntent.amount / 100;
        const isAnonymousBool = is_anonymous === "true";

        if (!campaignId || !donorId) return new NextResponse("Missing Metadata", { status: 400 });

        try {
            // 1. IDEMPOTENCY CHECK
            const { data: existing } = await supabaseAdmin
                .from("donations")
                .select("status")
                .eq("stripe_payment_id", paymentId);

            if (existing?.some(d => d.status === 'completed')) {
                return new NextResponse("Already Processed", { status: 200 });
            }

            // 2. FETCH DATA
            const [userProfileRes, milestonesRes, campaignRes] = await Promise.all([
                supabaseAdmin.from("users").select("wallet_address, kms_key_id").eq("id", donorId).single(),
                supabaseAdmin.from("milestones").select("*").eq("campaign_id", campaignId).order("milestone_index", { ascending: true }),
                supabaseAdmin.from("campaigns")
                    .select(`*, ngo_profiles!inner (stripe_account_id)`)
                    .eq("id", campaignId)
                    .single()
            ]);

            if (!userProfileRes.data || !campaignRes.data) throw new Error("Required data not found");

            const milestones = milestonesRes.data || [];
            const userProfile = userProfileRes.data;
            const currentCampaign = campaignRes.data;
            const ngoStripeId = (currentCampaign.ngo_profiles as any)?.stripe_account_id;

            // 3. 💡 DYNAMIC ALLOCATION & SPILLOVER LOGIC (M1 -> M2 -> M3)
            const allocations: Allocation[] = [];
            let remainingToAllocate = amountRM;
            let runningTotal = Number(currentCampaign.collected_amount || 0);

            for (const m of milestones) {
                const milestoneTarget = Number(m.target_amount);

                if (runningTotal < milestoneTarget) {
                    const roomInThisMilestone = milestoneTarget - runningTotal;
                    const amountForThisMilestone = Math.min(remainingToAllocate, roomInThisMilestone);

                    if (amountForThisMilestone > 0) {
                        allocations.push({
                            index: m.milestone_index,
                            amount: amountForThisMilestone,
                            id: m.id,
                            // It's escrowed if it's NOT the current index being funded (e.g., Spillover to M3)
                            isEscrow: m.milestone_index > currentCampaign.current_milestone_index
                        });

                        remainingToAllocate -= amountForThisMilestone;
                        runningTotal += amountForThisMilestone;
                    }
                }
                if (remainingToAllocate <= 0) break;
            }

            // 4. EXECUTE TRANSFERS & DB INSERTS
            let directRMForCampaign = 0;
            let escrowRMForCampaign = 0;

            for (const a of allocations) {
                if (!a.isEscrow) {
                    directRMForCampaign += a.amount;
                    if (ngoStripeId) {
                        try {
                            await stripe.transfers.create({
                                amount: Math.round(a.amount * 100),
                                currency: 'myr',
                                destination: ngoStripeId,
                                description: `Release for ${currentCampaign.title} - M${a.index + 1}`,
                                metadata: { paymentIntentId: paymentId }
                            });
                        } catch (err) { console.error("❌ Stripe Transfer Failed:", err); }
                    }
                } else {
                    escrowRMForCampaign += a.amount;
                }

                await supabaseAdmin.from("donations").insert({
                    campaign_id: campaignId,
                    donor_id: donorId,
                    amount: a.amount,
                    stripe_payment_id: paymentId,
                    milestone_index: a.index,
                    milestone_id: a.id,
                    held_in_escrow: a.isEscrow,
                    status: a.isEscrow ? "escrowed_awaiting_proof" : "pending_blockchain_sync",
                    is_anonymous: isAnonymousBool
                });
            }

            // 5. UPDATE CAMPAIGN & MILESTONE STATUS
            const newTotalCollected = (currentCampaign.collected_amount || 0) + amountRM;

            // Find the highest milestone index that is now fully funded
            const lastFundedMilestone = [...milestones]
                .reverse()
                .find(m => newTotalCollected >= Number(m.target_amount));

            const newIndex = lastFundedMilestone
                ? Math.max(currentCampaign.current_milestone_index, lastFundedMilestone.milestone_index)
                : currentCampaign.current_milestone_index;

            await supabaseAdmin.from("campaigns").update({
                collected_amount: newTotalCollected,
                total_released: (currentCampaign.total_released || 0) + directRMForCampaign,
                escrow_balance: (currentCampaign.escrow_balance || 0) + escrowRMForCampaign,
                current_milestone_index: newIndex,
                donations_count: (currentCampaign.donations_count || 0) + 1,
                last_donation_at: new Date().toISOString()
            }).eq("id", campaignId);

            // Update milestones and Notify NGO
            for (const m of milestones) {
                // If the milestone is now fully funded and was previously active
                if (newTotalCollected >= Number(m.target_amount) && m.status === 'active') {
                    await supabaseAdmin.from("milestones").update({ status: 'pending_proof' }).eq("id", m.id);

                    if (currentCampaign.ngo_id) {
                        await supabaseAdmin.from("notifications").insert({
                            user_id: currentCampaign.ngo_id,
                            message: `🎯 GOAL REACHED: Phase ${m.milestone_index + 1} ("${m.title}") is fully funded! Upload proof now to release escrow.`,
                            is_read: false,
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }

            // Standard Donation Receipt Notification for NGO
            if (currentCampaign.ngo_id) {
                await supabaseAdmin.from("notifications").insert({
                    user_id: currentCampaign.ngo_id,
                    message: `🎉 New Donation: RM ${amountRM} received for "${currentCampaign.title}".`,
                    is_read: false,
                    created_at: new Date().toISOString()
                });
            }

            // 6. BLOCKCHAIN SYNC
            const syncBlockchain = async () => {
                try {
                    const signer = createKmsSigner(userProfile.kms_key_id!);
                    const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
                    const onChainId = BigInt(currentCampaign.on_chain_id);
                    let currentNonce = Number(await campaignContract.nonces(await signer.getAddress()));

                    for (const alloc of allocations) {
                        const amountWei = parseUnits(alloc.amount.toFixed(2), 18);
                        const paymentRef = `${paymentId}_M${alloc.index}`;
                        const value = { onChainId, amount: amountWei, paymentRef, nonce: currentNonce };

                        const sig = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);
                        const tx = await campaignContract.donateWithSignature(onChainId, amountWei, paymentRef, currentNonce, sig);

                        await supabaseAdmin.from("donations")
                            .update({
                                on_chain_tx_hash: tx.hash,
                                status: (alloc.index <= newIndex && !alloc.isEscrow) ? "completed" : "escrowed_awaiting_proof"
                            })
                            .match({ stripe_payment_id: paymentId, milestone_index: alloc.index });

                        currentNonce++;
                        await tx.wait(1);
                    }
                } catch (bcError) { console.error("🔗 Blockchain Sync Error:", bcError); }
            };

            syncBlockchain();

            // Notify Donor
            await supabaseAdmin.from("notifications").insert({
                user_id: donorId,
                message: `Your donation of RM${amountRM} to "${currentCampaign.title}" was successful!`,
                created_at: new Date().toISOString()
            });

            return new NextResponse("Processed", { status: 200 });

        } catch (error: any) {
            console.error("❌ Webhook Logic Failed:", error);
            return new NextResponse(`Error: ${error.message}`, { status: 500 });
        }
    }

    return new NextResponse("Received", { status: 200 });
}