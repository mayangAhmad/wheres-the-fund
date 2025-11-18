import { NextResponse } from "next/server";
import { Contract, Log, LogDescription } from "ethers"; 
import { supabaseAdmin } from "@/lib/supabase/admin";
import CampaignFactoryABI from "@/lib/abi/CampaignFactory.json";
import createClient from "@/lib/supabase/server";
import { CampaignFormData } from "@/lib/validation/campaignSchema";
import { createKmsSigner } from "@/lib/services/kms-service";

const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);

type RequestBody = Omit<CampaignFormData, "photo"> & { image_url: string };

interface UserProfile {
  wallet_address: string;
  kms_key_id: string;
  name?: string;
}

const EIP712_DOMAIN = {
  name: "NGOPlatform",
  version: "1",
  chainId: QUORUM_CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const TYPES = {
  CreateCampaign: [
    { name: "title", type: "string" },
    { name: "targetAmount", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

export async function POST(req: Request) {
  let campaignDbId: string | null = null;

  try {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.user_metadata?.role !== "ngo") {
      return NextResponse.json({ error: "Only NGOs can create campaigns" }, { status: 403 });
    }

    const body: RequestBody = await req.json();

    // 2. Get Wallet Profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("wallet_address, kms_key_id, name")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !userProfile) throw new Error("User profile not found");

    const { wallet_address, kms_key_id, name: ngoName } = userProfile;

    // 3. Verify KMS ownership (Security)
    // Uses createKmsSigner from lib/kms-service.ts
    const signer = createKmsSigner(kms_key_id); 
    const signerAddress = (await signer.getAddress()).toLowerCase();
    
    if (signerAddress !== wallet_address.toLowerCase()) {
      throw new Error("Security Mismatch: KMS key does not match stored wallet address");
    }


    const endDateStr = body.end_date instanceof Date 
      ? body.end_date.toISOString().split("T")[0] 
      : body.end_date; 
      
    const dateObj = new Date(endDateStr);
    dateObj.setHours(23, 59, 59, 999); 
    const deadlineTimestamp = Math.floor(dateObj.getTime() / 1000);

    const targetAmountInt = BigInt(Math.floor(Number(body.goal_amount)));

    const { data: draftCampaign, error: insertError } = await supabaseAdmin
      .from("campaigns")
      .insert({
        ngo_id: user.id,
        ngo_name: ngoName || user.user_metadata?.name || "Anonymous NGO",
        wallet_address,
        title: body.title,
        description: body.description,
        category: body.category,
        image_url: body.image_url,
        goal_amount: body.goal_amount.toString(),
        end_date: endDateStr,
        milestones: body.milestones,
        background: body.background,
        problems: body.problems,
        solutions: body.solutions,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        campaign_address: body.campaign_address,
        pic1: body.pic1,
        pic2: body.pic2,
        status: "Creating", // Pending flag
      })
      .select("id")
      .single();

    if (insertError || !draftCampaign) throw new Error(`DB Draft Failed: ${insertError?.message}`);
    campaignDbId = draftCampaign.id;

    // 6. Execute Chain Transaction
    const campaignFactory = new Contract(CONTRACT_ADDRESS, CampaignFactoryABI, signer);
    const expectedNonce: bigint = await campaignFactory.nonces(wallet_address);

    const value = {
      title: body.title,
      targetAmount: targetAmountInt,
      deadline: deadlineTimestamp,
      nonce: Number(expectedNonce),
    };

    // Sign (EIP-712)
    const signature = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

    // Send
    const tx = await campaignFactory.createCampaignWithSignature(
      body.title,
      targetAmountInt,
      deadlineTimestamp,
      expectedNonce,
      signature
    );

    // Update DB with Hash immediately
    await supabaseAdmin
      .from("campaigns")
      .update({ tx_hash: tx.hash })
      .eq("id", campaignDbId);

    const receipt = await tx.wait();

    // 7. Decode Logs
    let newCampaignId: string | null = null;
    for (const log of receipt.logs as Log[]) {
      try {
        const parsed: LogDescription | null = campaignFactory.interface.parseLog(log);
        if (parsed && parsed.name === "CampaignCreated") {
          newCampaignId = parsed.args[0].toString();
          break;
        }
      } catch { /* ignore */ }
    }

    if (!newCampaignId) throw new Error("CampaignCreated event not found");

    // 8. Finalize: Update DB with ID and Status
    await supabaseAdmin
      .from("campaigns")
      .update({
        on_chain_id: newCampaignId,
        status: "Ongoing",
        contract_address: CONTRACT_ADDRESS
      })
      .eq("id", campaignDbId);

    return NextResponse.json({ 
      success: true, 
      campaignId: newCampaignId, 
      dbId: campaignDbId, 
      txHash: receipt.hash 
    });

  } catch (error: unknown) {
    console.error("❌ Campaign creation error:", error);
    
    // Cleanup: Mark as failed so it doesn't look like a "Draft" forever
    if (campaignDbId) {
        await supabaseAdmin.from("campaigns").update({ status: "Failed" }).eq("id", campaignDbId);
    }

    return NextResponse.json({ 
      error: (error as Error).message || "Internal server error" 
    }, { status: 500 });
  }
}