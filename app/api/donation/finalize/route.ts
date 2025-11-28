import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Contract, parseUnits } from "ethers";
import { createKmsSigner } from "@/lib/services/kms-service";
import CampaignABI from "@/lib/abi/CampaignFactory.json";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const CONTRACT_ADDRESS = process.env.CAMPAIGN_FACTORY_ADDRESS!;
const QUORUM_CHAIN_ID = parseInt(process.env.QUORUM_CHAIN_ID || "1337", 10);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    Donate: [
        { name: "onChainId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "paymentRef", type: "string" },
        { name: "nonce", type: "uint256" },
    ],
};

export async function POST(req: Request) {
    let donationDbId: string | null = null;

    try {
        const user = await getAuthenticatedUser();

        const { paymentIntentId } = await req.json();

        // 1. VERIFY WITH STRIPE (Source of Truth)
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        // 2. IDEMPOTENCY CHECK
        const { data: existingDonation } = await supabaseAdmin
            .from("donations")
            .select("id, status")
            .eq("stripe_payment_id", paymentIntentId)
            .single();

        if (existingDonation) {
            if (existingDonation.status === "completed") {
                return NextResponse.json({ message: "Already recorded" }, { status: 200 });
            }
        }

        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from("users")
            .select("wallet_address, kms_key_id")
            .eq("id", user.id)
            .single<UserProfile>();

        if (profileError || !userProfile) throw new Error("User profile not found");

        const { wallet_address, kms_key_id } = userProfile;

        // 3. PREPARE BLOCKCHAIN SIGNER
        const signer = createKmsSigner(kms_key_id);
        const signerAddress = (await signer.getAddress()).toLowerCase();

        if (signerAddress !== wallet_address.toLowerCase()) {
            throw new Error("Security Mismatch: KMS key does not match stored wallet address");
        }

        const campaignUUID = paymentIntent.metadata.campaignId;
        const amount = paymentIntent.amount / 100; // Convert cents to RM

        // 4. SAVE TO DB (State: Processing)
        const { data: draftDonation, error: insertError } = await supabaseAdmin
            .from("donations")
            .insert({
                campaign_id: campaignUUID,
                donor_id: user.id,
                amount: amount,
                stripe_payment_id: paymentIntentId,
                status: "Processing",
            })
            .select("id")
            .single();

        if (insertError || !draftDonation) throw new Error(`DB Insert Error: ${insertError?.message}`);
        donationDbId = draftDonation.id;

        // 5. EXECUTE BLOCKCHAIN TRANSACTION
        // Connect to the Contract

        const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
        const expectedNonce: bigint = await campaignContract.nonces(wallet_address);

        const { data } = await supabaseAdmin
            .from("campaigns")
            .select("on_chain_id")
            .eq("id", campaignUUID)
            .single();

        const amountWei = parseUnits(amount.toString(), 18);
        const onChainId = BigInt(data?.on_chain_id);

        const value = {
            onChainId: onChainId,
            amount: amountWei,
            paymentRef: paymentIntentId,
            nonce: Number(expectedNonce),
        };

        console.log("--- DEBUGGING EIP-712 VALUES ---");
        console.log("Campaign ID (Supabase):", campaignUUID);
        console.log("On-Chain ID (BigInt):", data?.on_chain_id); // Is this null?
        console.log("Amount (Wei):", amountWei);
        console.log("Wallet Address:", wallet_address);
        console.log("Expected Nonce:", expectedNonce); // Is this undefined?
        console.log("Payment Ref:", paymentIntentId);
        console.log("donation DBID: ", donationDbId);
        console.log("--------------------------------");

        const signature = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

        // Call: recordFiatDonation(uint256 campaignId, uint256 amount, string paymentRef)
        const tx = await campaignContract.donateWithSignature(
            onChainId,
            amountWei,
            paymentIntentId,
            expectedNonce,
            signature
        );

        console.log("Tx Sent:", tx.hash);

        // Update DB with Hash immediately (for tracking)
        await supabaseAdmin
            .from("donations")
            .update({ on_chain_tx_hash: tx.hash })
            .eq("id", donationDbId);

        // Wait for confirmation
        const receipt = await tx.wait();

        let isVerified = false;
        let recordedAmount = null;

        for (const log of receipt.logs) {
            try {
                // Attempt to decode the log using your ABI
                const parsedLog = campaignContract.interface.parseLog(log);

                // Check if this is the specific event we defined in Solidity
                if (parsedLog && parsedLog.name === "DonationRecorded") {

                    const onChainPaymentRef = parsedLog.args[3];
                    const onChainAmount = parsedLog.args[2];

                    // Compare it with what we sent
                    if (onChainPaymentRef === paymentIntentId) {
                        isVerified = true;
                        recordedAmount = onChainAmount.toString();
                        console.log("✅ VERIFIED: Data is on Blockchain!");
                        console.log(`   - Payment Ref: ${onChainPaymentRef}`);
                        console.log(`   - Amount (Wei): ${onChainAmount}`);
                    }
                }
            } catch (err) {
                // Ignore logs that don't match our ABI (like internal system logs)
            }
        }

        if (!isVerified) {
            throw new Error("Transaction mined, but 'DonationRecorded' event was missing or incorrect!");
        }

        await supabaseAdmin
            .from("donations")
            .update({ status: "completed" })
            .eq("id", donationDbId);

        const { data: currentCampaign } = await supabaseAdmin
            .from("campaigns")
            .select("collected_amount")
            .eq("id", campaignUUID)
            .single();

        const newTotal = (currentCampaign?.collected_amount || 0) + amount;

        await supabaseAdmin
            .from("campaigns")
            .update({ collected_amount: newTotal })
            .eq("id", campaignUUID);

        return NextResponse.json({ success: true, txHash: tx.hash });

    } catch (error: any) {
        console.error("Finalize Error:", error);

        // CLEANUP: Mark as Failed but KEEP the record (Money was taken!)
        if (donationDbId) {
            await supabaseAdmin
                .from("donations")
                .update({
                    status: "Failed_OnChain",
                    error_log: error.message
                })
                .eq("id", donationDbId);
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}