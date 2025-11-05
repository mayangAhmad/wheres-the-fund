// app/user/setup-wallet/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { KMSClient, CreateKeyCommand } from "@aws-sdk/client-kms";
import { getAddressFromKms } from "@/lib/kms-service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const kms = new KMSClient({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    // 1️⃣ Create a new KMS key
    const key = await kms.send(
      new CreateKeyCommand({
        KeySpec: "ECC_SECG_P256K1",
        KeyUsage: "SIGN_VERIFY",
        Description: `Key for user ${userId}`,
      })
    );

    const kmsKeyId = key.KeyMetadata?.KeyId;
    if (!kmsKeyId)
      throw new Error("Failed to create KMS key: KeyId is undefined");

    // 2️⃣ Derive Ethereum address the same way the signer will
    const walletAddress = await getAddressFromKms(kmsKeyId);

    // 3️⃣ Save both to Supabase
    const { error: dbError } = await supabase
      .from("users")
      .update({ wallet_address: walletAddress, kms_key_id: kmsKeyId })
      .eq("id", userId);

    if (dbError) throw dbError;

    return NextResponse.json({ walletAddress, kmsKeyId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to set up wallet" },
      { status: 500 }
    );
  }
}
