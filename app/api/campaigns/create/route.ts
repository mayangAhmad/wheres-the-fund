// app/api/campaigns/create/route.ts
import { NextResponse } from "next/server";
import { Contract, Log } from "ethers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import createClient from "@/lib/supabase/server";
import CampaignFactoryABI from "@/lib/abi/CampaignFactory.json";
import { createKmsSigner } from "@/lib/kms-service";

// --- ENVIRONMENT CONFIG ---
const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;

// --- TYPE DEFINITIONS ---
interface UserProfile {
  wallet_address: string;
  kms_key_id: string;
}

export async function POST(req: Request) {
  try {
    // === 1️⃣ AUTHENTICATE USER ===
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // === 2️⃣ VALIDATE INPUT ===
    const { title } = await req.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Invalid campaign title" }, { status: 400 });
    }

    // === 3️⃣ FETCH USER'S WALLET & KMS KEY ===
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("wallet_address, kms_key_id")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !userProfile) {
      throw new Error("User profile not found or incomplete");
    }

    const { wallet_address, kms_key_id } = userProfile;

    // === 4️⃣ CREATE SIGNER (AWS KMS) ===
    const signer = createKmsSigner(kms_key_id);
    const signerAddress = (await signer.getAddress()).toLowerCase();

    if (signerAddress !== wallet_address.toLowerCase()) {
      throw new Error("KMS key ID does not match stored wallet address");
    }

    // === 5️⃣ INTERACT WITH SMART CONTRACT ===
    const campaignFactory = new Contract(CONTRACT_ADDRESS, CampaignFactoryABI, signer);

    console.log(`🟢 Creating campaign: "${title}" from ${wallet_address}`);
    const tx = await campaignFactory.createCampaign(title);
    const receipt = await tx.wait();

    // === 6️⃣ EXTRACT EVENT FROM RECEIPT ===
    const logs: Log[] = (receipt?.logs as Log[]) || [];
    const eventSignature = "CampaignCreated(uint256,address,string,uint256)";
    const eventFragment = campaignFactory.interface.getEvent(eventSignature);

    const eventLog = logs.find(log => log.topics[0] === eventFragment?.topicHash);
    if (!eventLog) {
      throw new Error("CampaignCreated event not found in transaction receipt");
    }

    const decodedEvent = campaignFactory.interface.decodeEventLog(
      eventFragment!,
      eventLog.data,
      eventLog.topics
    );

    const newCampaignId = decodedEvent[0].toString();

    // === 7️⃣ SAVE TO SUPABASE ===
    const { error: dbError } = await supabaseAdmin.from("campaigns").insert({
      created_at: new Date().toISOString(),
      on_chain_id: newCampaignId,
        ngo_id: user.id,
        ngo_name: user.user_metadata?.name,
        wallet_address,
        title,
        tx_hash: receipt.hash,
        contract_address: CONTRACT_ADDRESS,
    });

    if (dbError) {
      throw new Error(`Failed to save campaign to database: ${dbError.message}`);
    }

    // === ✅ SUCCESS RESPONSE ===
    return NextResponse.json({
      success: true,
      campaignId: newCampaignId,
      txHash: receipt.hash,
    });

  } catch (error: unknown) {
    console.error("❌ Campaign creation error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
