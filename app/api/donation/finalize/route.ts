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
    let createDonationIds: string[] = [];

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
        const signer = createKmsSigner(kms_key_id);
        const campaignUUID = paymentIntent.metadata.campaignId;
        const totalAmount = paymentIntent.amount / 100;

        //FETCH MILESTONES & CALCULATE TOTALS
        const { data: milestones } = await supabaseAdmin
            .from("milestones")
            .select("*")
            .eq("campaign_id", campaignUUID)
            .order("milestone_index", { ascending: true });

        if (!milestones || milestones.length === 0) {
            throw new Error("No milestones found for this campaign.");
        }

        //fetch current donation to know current amount each milestones
        const { data: allDonations } = await supabaseAdmin
            .from("donations")
            .select("amount, milestone_index")
            .eq("campaign_id", campaignUUID);

        const totals: Record<number, number> = {};
        allDonations?.forEach((d) => {
            totals[d.milestone_index] = (totals[d.milestone_index] || 0) + d.amount;
        });

        //BLOCKCHAIN INTERFACE
        const campaignContract = new Contract(CONTRACT_ADDRESS, CampaignABI, signer);
        let currentNonce = Number(await campaignContract.nonces(wallet_address));

        const { data: campaignData } = await supabaseAdmin
            .from("campaigns")
            .select("on_chain_id")
            .eq("id", campaignUUID)
            .single()
        const onChainId = BigInt(campaignData?.on_chain_id);

        //SPLIT LOOP
        let remainingToAllocate = totalAmount;
        let txHashes: string[] = [];
        const lastMilestone = milestones[milestones.length - 1];

        //loop through milestones to fill them up
        for (const m of (milestones || [])) {
            if (remainingToAllocate <= 0) break;

            const currentRaised = totals[m.milestone_index] || 0;
            const spaceLeft = m.target_amount - currentRaised;
            const isLastOne = (m.milestone_index === lastMilestone.milestone_index); //compare if it is last milestone or not

            //if milestone full, skip (unless the last one dump everything)
            if (spaceLeft <= 0 && !isLastOne) continue;

            //decide how much goes to this milestone, take smaller of what we have OR space available, if last milestone, force to take everything
            let allocation = 0;
            if (isLastOne) {
                allocation = remainingToAllocate;
            } else {
                allocation = Math.min(remainingToAllocate, spaceLeft);
            }

            if (allocation > 0) {
                console.log(`Allocating RM ${allocation} to Milestone ${m.milestone_index}`);

                //INSERT TO DB
                const { data: donationRecord, error } = await supabaseAdmin
                    .from("donations")
                    .insert({
                        campaign_id: campaignUUID,
                        donor_id: user.id,
                        amount: allocation,
                        stripe_payment_id: paymentIntentId,
                        status: "Processing",
                        milestone_index: m.milestone_index
                    })
                    .select("id")
                    .single();

                if (error) throw new Error(error.message);
                createDonationIds.push(donationRecord.id);

                //SIGN EIP-712
                const amountWei = parseUnits(allocation.toFixed(2), 18);

                const value = {
                    onChainId: onChainId,
                    amount: amountWei,
                    paymentRef: `${paymentIntentId}_M${m.milestone_index}`,
                    nonce: currentNonce,
                };

                const signature = await signer.signTypedData(EIP712_DOMAIN, TYPES, value);

                //SEND TRANSACTION
                const tx = await campaignContract.donateWithSignature(
                    onChainId,
                    amountWei,
                    `${paymentIntentId}_M${m.milestone_index}`,
                    currentNonce,
                    signature
                );

                console.log(`Tx Sent for Milestone ${m.milestone_index}:`, tx.hash);
                txHashes.push(tx.hash);

                //UPDATE DB WITH HASH
                await supabaseAdmin
                    .from("donations")
                    .update({ on_chain_tx_hash: tx.hash, status: 'completed' })
                    .eq("id", donationRecord.id);

                //UPDATE LOOP VARIABLES
                remainingToAllocate -= allocation;
                currentNonce++;

                await tx.wait();

            }
        }

        //FINAL CLEANUP-update campaign global total
        const { data: currentCampaign } = await supabaseAdmin
            .from("campaigns")
            .select("collected_amount")
            .eq("id", campaignUUID)
            .single()

        const newTotal = (currentCampaign?.collected_amount || 0) + totalAmount;

        await supabaseAdmin
            .from("campaigns")
            .update({ collected_amount: newTotal })
            .eq("id", campaignUUID);

        return NextResponse.json({ success: true, txHashes });
    } catch (error: any) {
        console.error("Finalize error: ", error);

        //MARK ALL CREATED ROWS AS FAILED
        if (createDonationIds.length > 0) {
            await supabaseAdmin
                .from("donations")
                .update({ status: "Failed_OnChain", error_log: error.message })
                .in("id", createDonationIds);
        }
        return NextResponse.json({ error: error.message }, { status: 500 });

    }
}












