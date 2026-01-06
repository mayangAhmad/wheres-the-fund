// app/api/admin/milestones/review/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import Stripe from "stripe";
import { Contract, parseUnits } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const ADMIN_KMS_ID = process.env.ADMIN_KMS_KEY_ID!;

export async function POST(req: Request) {
  try {
    // 1. Admin Security Check
    const user = await getAuthenticatedUser();
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId, campaignId, decision, rejectionReason } = await req.json();

    // 2. Fetch Data
    const { data: campaign } = await supabaseAdmin
        .from("campaigns")
        .select("*, ngo_profiles(stripe_account_id, account_status)")
        .eq("id", campaignId)
        .single();

    const { data: milestone } = await supabaseAdmin
        .from("milestones")
        .select("*")
        .eq("id", milestoneId)
        .single();

    const { data: allMilestones } = await supabaseAdmin
        .from("milestones")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("milestone_index", { ascending: true });

    if (!campaign || !milestone || !allMilestones) throw new Error("Data missing");

    // --- PATH A: REJECTION ---
    if (decision === 'reject') {
        await supabaseAdmin.from("milestones").update({ 
            status: "pending_proof",
            auditor_remarks: rejectionReason || "Proof rejected - please resubmit"
        }).eq("id", milestoneId);

        if (campaign.ngo_id) {
            await supabaseAdmin.from("notifications").insert({
                user_id: campaign.ngo_id,
                message: `❌ Proof for "${milestone.title}" rejected. ${rejectionReason || 'Please review and resubmit.'}`,
                is_read: false
            });
        }
        return NextResponse.json({ success: true, status: "rejected" });
    }

    // --- PATH B: APPROVAL & RELEASE ---
    
    // Get escrow amount for THIS milestone only
    const { data: escrowedDonations } = await supabaseAdmin
        .from("donations")
        .select("amount")
        .eq("campaign_id", campaignId)
        .eq("milestone_index", milestone.milestone_index)
        .eq("held_in_escrow", true);

    const amountToRelease = escrowedDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    const proofCID = milestone.ipfs_cid || "No CID";

    // 3. Stripe Transfer (Release Escrow)
    if (amountToRelease > 0 && campaign.ngo_profiles?.stripe_account_id) {
        try {
            await stripe.transfers.create({
                amount: Math.round(amountToRelease * 100),
                currency: "myr",
                destination: campaign.ngo_profiles.stripe_account_id,
                description: `Escrow Release: M${milestone.milestone_index + 1} - ${milestone.title}`,
                metadata: {
                    campaignId: campaignId,
                    milestoneId: milestoneId,
                    proofCID: proofCID
                }
            });
        } catch (stripeError) {
            console.error("❌ Stripe transfer failed:", stripeError);
            throw new Error("Failed to transfer funds to NGO");
        }

        // Update donation records
        await supabaseAdmin
            .from("donations")
            .update({ 
                held_in_escrow: false, 
                status: 'completed' 
            })
            .eq("campaign_id", campaignId)
            .eq("milestone_index", milestone.milestone_index)
            .eq("held_in_escrow", true);
    }

    // 4. Update Campaign Balances
    const currentEscrow = Number(campaign.escrow_balance || 0);
    const currentReleased = Number(campaign.total_released || 0);

    await supabaseAdmin
        .from("campaigns")
        .update({
            total_released: currentReleased + amountToRelease,
            escrow_balance: Math.max(0, currentEscrow - amountToRelease)
        })
        .eq("id", campaignId);

    // 5. ⭐ BLOCKCHAIN SYNC - Record Escrow Release + Approve Milestone
    let onChainTxHash = null;
    if (campaign.on_chain_id) {
        try {
            const signer = createKmsSigner(ADMIN_KMS_ID);
            const contract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
            
            // ⭐ Step 1: Record escrow release on smart contract
            if (amountToRelease > 0) {
                const amountWei = parseUnits(amountToRelease.toFixed(2), 18);
                const releaseTx = await contract.recordEscrowRelease(
                    campaign.on_chain_id,
                    milestone.milestone_index,
                    amountWei
                );
                await releaseTx.wait(1);
                console.log("✅ Escrow release recorded on-chain:", releaseTx.hash);
            }
            
            // ⭐ Step 2: Approve milestone on smart contract
            const approveTx = await contract.approveMilestone(campaign.on_chain_id, proofCID);
            await approveTx.wait(1);
            onChainTxHash = approveTx.hash;
            console.log("✅ Milestone approved on-chain:", onChainTxHash);
            
        } catch (bcError) {
            console.error("🔗 Blockchain approval error:", bcError);
            // Don't throw - continue with database updates
        }
    }

    // 6. Update Milestone Status
    await supabaseAdmin.from("milestones").update({ 
        status: "approved", 
        approved_at: new Date().toISOString(),
        payout_tx_hash: onChainTxHash,
        auditor_remarks: "Approved"
    }).eq("id", milestoneId);

    // 7. Activate Next Milestone
    const nextMilestoneIndex = milestone.milestone_index + 1;
    const nextMilestone = allMilestones.find(m => m.milestone_index === nextMilestoneIndex);
    
    if (nextMilestone) {
        await supabaseAdmin.from("milestones")
            .update({ status: 'active' })
            .eq("id", nextMilestone.id);
    }

    // 8. Create Payout Record
    if (amountToRelease > 0) {
        await supabaseAdmin.from("payouts").insert({
            campaign_id: campaignId,
            milestone_id: milestoneId,
            amount: amountToRelease,
            blockchain_approval_tx_hash: onChainTxHash || 'pending',
            stripe_transfer_id: 'completed',
            processed_at: new Date().toISOString()
        });
    }

    // 9. NGO Notification
    if (campaign.ngo_id) {
        await supabaseAdmin.from("notifications").insert({
            user_id: campaign.ngo_id, 
            message: `✅ Milestone ${milestone.milestone_index + 1} "${milestone.title}" APPROVED! RM ${amountToRelease.toFixed(2)} released to your account.${nextMilestone ? ` Milestone ${nextMilestoneIndex + 1} is now active.` : ''}`,
            is_read: false
        });
    }

    return NextResponse.json({ 
        success: true, 
        amountReleased: amountToRelease,
        nextMilestoneActivated: !!nextMilestone,
        blockchainTxHash: onChainTxHash
    });

  } catch (error: any) {
    console.error("❌ Review Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}