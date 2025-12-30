// app/api/admin/milestones/review/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import Stripe from "stripe";
import { Contract } from "ethers";
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

    const { milestoneId, campaignId, decision } = await req.json();

    // 2. Fetch Campaign (including summary columns) and Milestone
    const { data: campaign } = await supabaseAdmin
        .from("campaigns")
        .select("*, ngo_profiles(stripe_account_id)")
        .eq("id", campaignId)
        .single();

    const { data: milestone } = await supabaseAdmin
        .from("milestones")
        .select("*")
        .eq("id", milestoneId)
        .single();

    if (!campaign || !milestone) throw new Error("Data missing");

    // --- PATH A: REJECTION ---
    if (decision === 'reject') {
        await supabaseAdmin.from("milestones").update({ status: "rejected" }).eq("id", milestoneId);
        if (campaign.ngo_id) {
            await supabaseAdmin.from("notifications").insert({
                user_id: campaign.ngo_id,
                message: `❌ ACTION REQUIRED: Proof for "${milestone.title}" was rejected.`,
            });
        }
        return NextResponse.json({ success: true, status: "rejected" });
    }

    // --- PATH B: APPROVAL & RELEASE ---
    
const { data: escrowedDonations } = await supabaseAdmin
    .from("donations")
    .select("amount")
    .eq("campaign_id", campaignId)
    .lte("milestone_index", milestone.milestone_index + 1) // Catch current index AND the overflow
    .eq("held_in_escrow", true);

    const amountToRelease = escrowedDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    const proofCID = milestone.ipfs_cid || "No CID";


// 4. Physical Stripe Transfer
if (amountToRelease > 0 && campaign.ngo_profiles?.stripe_account_id) {
    await stripe.transfers.create({
        amount: Math.round(amountToRelease * 100),
        currency: "myr",
        destination: campaign.ngo_profiles.stripe_account_id,
        description: `Escrow Release: ${milestone.title} (Proof: ${proofCID})`,
    });

    // ✅ UPDATE: This specifically targets the RM 600 at Index 1
    // even though we are currently "approving" Milestone 1.
    await supabaseAdmin
        .from("donations")
        .update({ 
            held_in_escrow: false, 
            status: 'completed' 
        })
        .eq("campaign_id", campaignId)
        .lte("milestone_index", milestone.milestone_index + 1)
        .eq("held_in_escrow", true); // Only update rows that were actually locked
}

    // 5. Update Campaign Summary Columns
    // 💡 Logic: Subtract released amount from escrow and add to total_released
    const currentEscrow = Number(campaign.escrow_balance || 0);
    const currentReleased = Number(campaign.total_released || 0);
    const nextMilestoneIndex = milestone.milestone_index + 1;

    await supabaseAdmin
        .from("campaigns")
        .update({
            total_released: currentReleased + amountToRelease, // 📈 Increase released
            escrow_balance: Math.max(0, currentEscrow - amountToRelease), // 📉 Decrease escrow
            current_milestone_index: nextMilestoneIndex // Sync with contract
        })
        .eq("id", campaignId);

    // 6. Blockchain Sync
    let onChainTxHash = null;
    if (campaign.on_chain_id) {
        const signer = createKmsSigner(ADMIN_KMS_ID);
        const contract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
        // Increments currentMilestone in contract and records CID
        const tx = await contract.approveMilestone(campaign.on_chain_id, proofCID);
        await tx.wait();
        onChainTxHash = tx.hash;
    }

    // 7. Milestone State Updates
    await supabaseAdmin.from("milestones").update({ 
        status: "approved", 
        approved_at: new Date().toISOString(),
        payout_tx_hash: onChainTxHash
    }).eq("id", milestoneId);

    // Unlock next milestone if it exists
    await supabaseAdmin.from("milestones")
        .update({ status: 'active' })
        .eq("campaign_id", campaignId)
        .eq("milestone_index", nextMilestoneIndex);

    // 8. NGO Notification
    if (campaign.ngo_id) {
        await supabaseAdmin.from("notifications").insert({
            user_id: campaign.ngo_id, 
            message: `✅ APPROVED: RM ${amountToRelease} released for "${milestone.title}". Milestone ${nextMilestoneIndex + 1} is now active.`,
        });
    }

    return NextResponse.json({ 
        success: true, 
        amountReleased: amountToRelease, 
        nextIndex: nextMilestoneIndex 
    });

  } catch (error: any) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}