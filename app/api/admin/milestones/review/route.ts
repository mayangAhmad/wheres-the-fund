import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import Stripe from "stripe";
import { Contract } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";

// Init Services
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

    const { milestoneId, campaignId, decision } = await req.json(); // decision: 'approve' | 'reject'

    // Fetch Data
    // We select 'ngo_id' explicitly to be safe, though '*' covers it
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

    // ==========================================
    // PATH A: REJECT PROOF
    // ==========================================
    if (decision === 'reject') {
        // Update DB
        await supabaseAdmin
            .from("milestones")
            .update({ status: "rejected" }) 
            .eq("id", milestoneId);

        // Notify NGO (FIX: Use ngo_id)
        if (campaign.ngo_id) {
            await supabaseAdmin.from("notifications").insert({
                user_id: campaign.ngo_id, // <--- FIXED
                message: `❌ ACTION REQUIRED: Proof for "${milestone.title}" was rejected. Please review and resubmit.`,
                is_read: false
            });
        }
        return NextResponse.json({ success: true, status: "rejected" });
    }

    // ==========================================
    // PATH B: APPROVE & PAY
    // ==========================================
    
    // 1. Calculate Payout (Release whatever is in the Escrow Bucket)
    const amountToRelease = Number(campaign.escrow_balance || 0);

    if (amountToRelease > 0 && campaign.ngo_profiles?.stripe_account_id) {
        console.log(`💸 Releasing RM ${amountToRelease} from Escrow...`);
        
        await stripe.transfers.create({
            amount: Math.round(amountToRelease * 100),
            currency: "myr",
            destination: campaign.ngo_profiles.stripe_account_id,
            description: `Milestone Release: ${milestone.title}`,
            metadata: { campaignId, milestoneId }
        });
    } else {
        console.log("⚠️ No funds in escrow to release (Direct transfers used).");
    }

     let onChainTxHash = null;

    // 2. Blockchain Sync
    if (campaign.on_chain_id) {
        console.log("🔗 Syncing to Blockchain...");
        const signer = createKmsSigner(ADMIN_KMS_ID);
        const contract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
        const tx = await contract.approveMilestone(campaign.on_chain_id);
        await tx.wait();
        onChainTxHash = tx.hash;
        console.log("✅ Blockchain Tx:", tx.hash);
    }

    // 3. Update Milestone Status
    await supabaseAdmin
        .from("milestones")
        .update({ 
            status: "approved", 
            approved_at: new Date().toISOString(),
            payout_tx_hash: onChainTxHash
        })
        .eq("id", milestoneId);

    // 4. Update Campaign (Unlock Next Phase & RESET ESCROW)
    const nextIndex = (campaign.current_milestone_index || 0) + 1;
    const currentReleased = Number(campaign.total_released || 0);
    
    await supabaseAdmin
        .from("campaigns")
        .update({
            current_milestone_index: nextIndex,
            total_released: currentReleased + amountToRelease,
            escrow_balance: 0 // Reset bucket
        })
        .eq("id", campaignId);

    // Activate next milestone if exists
    await supabaseAdmin
        .from("milestones")
        .update({ status: 'active' })
        .eq("campaign_id", campaignId)
        .eq("milestone_index", nextIndex);

    // 5. Notify NGO 
    if (campaign.ngo_id) {
        await supabaseAdmin.from("notifications").insert({
            user_id: campaign.ngo_id, 
            message: `✅ APPROVED: Funds (RM ${amountToRelease}) released for "${milestone.title}".`,
            is_read: false
        });
    }

    return NextResponse.json({ success: true, status: "approved", amount: amountToRelease });

  } catch (error: any) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}