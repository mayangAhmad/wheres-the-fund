// @/app/api/campaigns/create/route.ts
import { NextResponse } from "next/server";
import { Contract, Log, LogDescription, parseUnits } from "ethers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CampaignFactoryABI from "@/lib/abi/CampaignFactory.json";
import { createKmsSigner } from "@/lib/kms-service";
import createClient from "@/lib/supabase/server";
import { CampaignFormData } from "@/lib/validation/campaignSchema";

const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);

type RequestBody = Omit<CampaignFormData, "photo"> & { image_url: string };

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

interface UserProfile {
  wallet_address: string;
  kms_key_id: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.user_metadata?.role !== "ngo") {
      return NextResponse.json({ error: "Only NGOs can create campaigns" }, { status: 403 });
    }

    const body: RequestBody = await req.json();

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("wallet_address, kms_key_id")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !userProfile) throw new Error("User profile not found or incomplete");

    const { wallet_address, kms_key_id } = userProfile;
    const signer = createKmsSigner(kms_key_id);
    const signerAddress = (await signer.getAddress()).toLowerCase();
    if (signerAddress !== wallet_address.toLowerCase()) {
      throw new Error("KMS key ID does not match stored wallet address");
    }

    const deadlineTimestamp = Math.floor(new Date(body.end_date).getTime() / 1000);
    const targetAmountWei = parseUnits(body.goal_amount.toString(), 18);

    const campaignFactory = new Contract(CONTRACT_ADDRESS, CampaignFactoryABI, signer);

    // On-chain nonce (source of truth)
    const expectedNonce: bigint = await campaignFactory.nonces(wallet_address);

    // Build typed data and sign
    const value = {
      title: body.title,
      targetAmount: targetAmountWei,
      deadline: deadlineTimestamp,
      nonce: Number(expectedNonce),
    };

    const signature = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

    // Send tx
    const tx = await campaignFactory.createCampaignWithSignature(
      body.title,
      targetAmountWei,
      deadlineTimestamp,
      expectedNonce, // bigint acceptable
      signature
    );

    const receipt = await tx.wait();

    // Decode event
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
    if (!newCampaignId) throw new Error("CampaignCreated event not found in transaction logs");

    // Persist campaign metadata
    const { error: dbError } = await supabaseAdmin.from("campaigns").insert({
      on_chain_id: newCampaignId,
      ngo_id: user.id,
      ngo_name: user.user_metadata?.name || user.email,
      wallet_address,
      tx_hash: receipt.hash,
      contract_address: CONTRACT_ADDRESS,
      created_at: new Date().toISOString(),
      title: body.title,
      description: body.description,
      category: body.category,
      image_url: body.image_url,
      goal_amount: body.goal_amount.toString(),
      end_date: body.end_date instanceof Date ? body.end_date.toISOString().split("T")[0] : body.end_date,
      milestones: body.milestones,
      background: body.background,
      problems: body.problems,
      solutions: body.solutions,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      campaign_address: body.campaign_address,
      pic1: body.pic1,
      pic2: body.pic2,
    });

    if (dbError) {
      console.error(`CRITICAL: On-chain campaign ${newCampaignId} created, but DB save failed: ${dbError.message}`);
      throw new Error(`Failed to save campaign metadata: ${dbError.message}`);
    }

    return NextResponse.json({ success: true, campaignId: newCampaignId, txHash: receipt.hash });
  } catch (error: unknown) {
    console.error("❌ Campaign creation error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
