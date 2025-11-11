// app/api/campaigns/create/route.ts
import { NextResponse } from "next/server";
import { Contract, Log } from "ethers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CampaignFactoryABI from "@/lib/abi/CampaignFactory.json";
import { createKmsSigner } from "@/lib/kms-service";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { incrementUserNonce } from "@/lib/user/incrementUserNonce";

const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;

//ADD: EIP-712 Domain and Types
const EIP712_DOMAIN = {
  name: "NGOPlatform",
  version: "1",
  chainId: parseInt(process.env.QUORUM_CHAIN_ID || "1337"), // Quorum typically uses 1337
  verifyingContract: CONTRACT_ADDRESS,
};


const TYPES = {
  CreateCampaign: [
    { name: "title", type: "string" },
    { name: "ngo", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
};

interface UserProfile {
  wallet_address: string;
  kms_key_id: string;
  nonce: number;
}

export async function POST(req: Request) {
  try {
    //AUTHENTICATE USER
     const user = await getAuthenticatedUser();

    // === 2️⃣ VALIDATE INPUT ===
    const { title } = await req.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Invalid campaign title" }, { status: 400 });
    }

    // === 3️⃣ FETCH USER'S WALLET & KMS KEY ===
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("wallet_address, kms_key_id, nonce")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !userProfile) {
      throw new Error("User profile not found or incomplete");
    }

    // Increment nonce in Supabase
    const nonce = userProfile.nonce ?? 0;
    incrementUserNonce(user.id, nonce);
    
    const { wallet_address, kms_key_id } = userProfile;

    // === 4️⃣ CREATE SIGNER (AWS KMS) ===
    const signer = createKmsSigner(kms_key_id);
    const signerAddress = (await signer.getAddress()).toLowerCase();

    if (signerAddress !== wallet_address.toLowerCase()) {
      throw new Error("KMS key ID does not match stored wallet address");
    }

    // === 🆕 5️⃣ PREPARE EIP-712 SIGNATURE ===
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const value = {
      title: title,
      ngo: wallet_address,
      deadline: deadline,
      nonce,
    };

    console.log(`🟢 Creating EIP-712 signature for campaign: "${title}"`);
    
    // Sign the EIP-712 structured data
    const signature = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

    // === 🆕 6️⃣ INTERACT WITH SMART CONTRACT USING EIP-712 ===
    const campaignFactory = new Contract(CONTRACT_ADDRESS, CampaignFactoryABI, signer);

    console.log(`📤 Submitting signed transaction for campaign creation...`);
    
    // 🆕 CALL THE NEW EIP-712 FUNCTION (not the old one)
    const tx = await campaignFactory.createCampaignWithSignature(
      title,
      deadline,
      nonce,
      signature
    );
    
    const receipt = await tx.wait();

    // === 7️⃣ EXTRACT EVENT FROM RECEIPT ===
    const logs = (receipt?.logs || []) as Log[];
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

    // === 8️⃣ SAVE TO SUPABASE ===
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
    console.log(`✅ Campaign created with EIP-712! ID: ${newCampaignId}`);
    
    return NextResponse.json({
      success: true,
      campaignId: newCampaignId,
      txHash: receipt.hash,
      signedWithEIP712: true, // 🆕 Let frontend know we used EIP-712
    });

  } catch (error: unknown) {
    console.error("❌ EIP-712 Campaign creation error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}