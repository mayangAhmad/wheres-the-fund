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
const ADMIN_KMS_ID = process.env.ADMIN_KMS_KEY_ID!;

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
    milestoneStatus: string;
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

            if (existing?.some(d => d.status === 'completed' || d.status === 'escrowed_awaiting_proof')) {
                return new NextResponse("Already Processed", { status: 200 });
            }

            // 2. FETCH DATA
            const [userProfileRes, milestonesRes, campaignRes] = await Promise.all([
                supabaseAdmin.from("users").select("wallet_address, kms_key_id").eq("id", donorId).single(),
                supabaseAdmin.from("milestones").select("*").eq("campaign_id", campaignId).order("milestone_index", { ascending: true }),
                supabaseAdmin.from("campaigns")
                    .select(`*, ngo_profiles!inner (stripe_account_id, account_status)`)
                    .eq("id", campaignId)
                    .single()
            ]);

            if (!userProfileRes.data || !campaignRes.data) throw new Error("Required data not found");

            const milestones = milestonesRes.data || [];
            const userProfile = userProfileRes.data;
            const currentCampaign = campaignRes.data;
            const ngoStripeId = (currentCampaign.ngo_profiles as any)?.stripe_account_id;
            const ngoAccountStatus = (currentCampaign.ngo_profiles as any)?.account_status;

            // ⭐ CHECK: Is NGO account blocked?
            if (ngoAccountStatus === 'blocked') {
                return new NextResponse("Campaign NGO is blocked - donations disabled", { status: 403 });
            }

            // ⭐ CHECK: Is final milestone (M3) fully funded?
            const finalMilestone = milestones[milestones.length - 1];
            const totalGoal = Number(finalMilestone?.target_amount || 0);
            const currentCollected = Number(currentCampaign.collected_amount || 0);
            
            if (currentCollected >= totalGoal) {
                return new NextResponse("Campaign fully funded - donations closed", { status: 400 });
            }

            // 3. 💡 ALLOCATION LOGIC
            const allocations: Allocation[] = [];
            let remainingToAllocate = amountRM;
            let runningTotal = currentCollected;

            for (const m of milestones) {
                const milestoneTarget = Number(m.target_amount);

                if (runningTotal < milestoneTarget) {
                    const roomInThisMilestone = milestoneTarget - runningTotal;
                    const amountForThisMilestone = Math.min(remainingToAllocate, roomInThisMilestone);

                    if (amountForThisMilestone > 0) {
                        // ⭐ Escrow logic based on milestone status
                        const isDirect = (m.status === 'active' || m.status === 'approved');

                        allocations.push({
                            index: m.milestone_index,
                            amount: amountForThisMilestone,
                            id: m.id,
                            isEscrow: !isDirect,
                            milestoneStatus: m.status
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
                    // ⭐ Direct transfer to NGO
                    directRMForCampaign += a.amount;
                    if (ngoStripeId) {
                        try {
                            await stripe.transfers.create({
                                amount: Math.round(a.amount * 100),
                                currency: 'myr',
                                destination: ngoStripeId,
                                description: `Direct: ${currentCampaign.title} - M${a.index + 1}`,
                                metadata: { 
                                    paymentIntentId: paymentId,
                                    campaignId: campaignId,
                                    milestoneIndex: a.index.toString()
                                }
                            });
                        } catch (err) { 
                            console.error("❌ Stripe Transfer Failed:", err);
                        }
                    }
                } else {
                    // ⭐ Hold in escrow
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

            // 5. UPDATE CAMPAIGN
            const newTotalCollected = currentCollected + amountRM;

            await supabaseAdmin.from("campaigns").update({
                collected_amount: newTotalCollected,
                total_released: (currentCampaign.total_released || 0) + directRMForCampaign,
                escrow_balance: (currentCampaign.escrow_balance || 0) + escrowRMForCampaign,
                donations_count: (currentCampaign.donations_count || 0) + 1,
                last_donation_at: new Date().toISOString()
            }).eq("id", campaignId);

            // 6. ⭐ CHECK IF ANY MILESTONE JUST REACHED TARGET
            for (const m of milestones) {
                const milestoneReached = newTotalCollected >= Number(m.target_amount);
                const previouslyActive = m.status === 'active';
                
                if (milestoneReached && previouslyActive) {
                    const deadlineDate = new Date();
                    deadlineDate.setDate(deadlineDate.getDate() + 5);

                    await supabaseAdmin.from("milestones").update({ 
                        status: 'pending_proof',
                        proof_deadline: deadlineDate.toISOString()
                    }).eq("id", m.id);

                    if (currentCampaign.ngo_id) {
                        await supabaseAdmin.from("notifications").insert({
                            user_id: currentCampaign.ngo_id,
                            message: `🎯 Milestone ${m.milestone_index + 1} "${m.title}" fully funded! Upload proof within 5 days or account will be blocked.`,
                            is_read: false,
                            created_at: new Date().toISOString()
                        });
                    }
                }
            }

            // Notify NGO of new donation
            if (currentCampaign.ngo_id) {
                await supabaseAdmin.from("notifications").insert({
                    user_id: currentCampaign.ngo_id,
                    message: `🎉 New Donation: RM ${amountRM} for "${currentCampaign.title}". ${escrowRMForCampaign > 0 ? `RM ${escrowRMForCampaign.toFixed(2)} held in escrow.` : ''}`,
                    is_read: false,
                    created_at: new Date().toISOString()
                });
            }

            // 7. ⭐ BLOCKCHAIN SYNC - Record Donation + Update Balances
            const syncBlockchain = async () => {
                try {
                    const signer = createKmsSigner(userProfile.kms_key_id!);
                    const adminSigner = createKmsSigner(ADMIN_KMS_ID);
                    const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
                    const adminContract = new Contract(CONTRACT_ADDRESS, CampaignABI, adminSigner);
                    const onChainId = BigInt(currentCampaign.on_chain_id);
                    let currentNonce = Number(await campaignContract.nonces(await signer.getAddress()));

                    // Record each donation on-chain
                    for (const alloc of allocations) {
                        const amountWei = parseUnits(alloc.amount.toFixed(2), 18);
                        const paymentRef = `${paymentId}_M${alloc.index}`;
                        const value = { onChainId, amount: amountWei, paymentRef, nonce: currentNonce };

                        const sig = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);
                        const tx = await campaignContract.donateWithSignature(onChainId, amountWei, paymentRef, currentNonce, sig);

                        await supabaseAdmin.from("donations")
                            .update({
                                on_chain_tx_hash: tx.hash,
                                status: alloc.isEscrow ? "escrowed_awaiting_proof" : "completed"
                            })
                            .match({ stripe_payment_id: paymentId, milestone_index: alloc.index });

                        currentNonce++;
                        await tx.wait(1);
                    }

                    // ⭐ NEW: Update campaign balances on smart contract
                    if (directRMForCampaign > 0 || escrowRMForCampaign > 0) {
                        const directWei = parseUnits(directRMForCampaign.toFixed(2), 18);
                        const escrowWei = parseUnits(escrowRMForCampaign.toFixed(2), 18);
                        
                        const updateTx = await adminContract.updateCampaignBalances(
                            onChainId,
                            directWei,
                            escrowWei
                        );
                        await updateTx.wait(1);
                        console.log("✅ Smart contract balances updated:", updateTx.hash);
                    }

                } catch (bcError) { 
                    console.error("🔗 Blockchain Sync Error:", bcError);
                }
            };

            syncBlockchain();

            // Notify Donor
            await supabaseAdmin.from("notifications").insert({
                user_id: donorId,
                message: `✅ Donation successful! RM${amountRM} to "${currentCampaign.title}". ${escrowRMForCampaign > 0 ? `RM ${escrowRMForCampaign.toFixed(2)} held in escrow pending proof.` : ''}`,
                is_read: false,
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