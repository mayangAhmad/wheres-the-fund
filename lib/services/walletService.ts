import { KMSClient, CreateKeyCommand } from "@aws-sdk/client-kms";
import { getAddressFromKms } from "@/lib/services/kms-service";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Initialize AWS Client
const kms = new KMSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createWalletForUser(userId: string) {
  // 1. Idempotency Check: Don't create a new KMS key if they already have one.
  // This saves money and prevents "orphaned" keys in AWS.
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("wallet_address, kms_key_id")
    .eq("id", userId)
    .single();

  if (existingUser?.wallet_address && existingUser?.kms_key_id) {
    console.log(`User ${userId} already has a wallet: ${existingUser.wallet_address}`);
    return { 
      walletAddress: existingUser.wallet_address, 
      kmsKeyId: existingUser.kms_key_id 
    };
  }

  try {
    console.log(`Creating KMS key for user ${userId}...`);

    // 2. Create Key in AWS KMS
    const command = new CreateKeyCommand({
      KeySpec: "ECC_SECG_P256K1", // Standard for Ethereum
      KeyUsage: "SIGN_VERIFY",
      Description: `WheresTheFund Wallet for User ${userId}`,
      // Tags are useful for cost allocation in AWS
      Tags: [{ TagKey: "Project", TagValue: "WheresTheFund" }] 
    });

    const keyResponse = await kms.send(command);
    const kmsKeyId = keyResponse.KeyMetadata?.KeyId;

    if (!kmsKeyId) {
      throw new Error("AWS KMS failed to return a KeyId");
    }

    // 3. Derive Ethereum Address from the KMS Public Key
    const walletAddress = await getAddressFromKms(kmsKeyId);

    // 4. Save to Supabase (using Admin client to bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ 
        wallet_address: walletAddress, 
        kms_key_id: kmsKeyId 
      })
      .eq("id", userId);

    if (updateError) {
      // CRITICAL: If DB save fails, we should ideally schedule the KMS key for deletion
      // to avoid clutter, but for now, we just throw.
      throw new Error(`Failed to link wallet to user: ${updateError.message}`);
    }

    return { walletAddress, kmsKeyId };

  } catch (error: any) {
    console.error("Wallet creation failed:", error);
    throw new Error(error.message || "Wallet creation failed");
  }
}