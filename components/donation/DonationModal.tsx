"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Check, Shield, ArrowLeft, AlertCircle } from "lucide-react";
import CheckoutForm from "./CheckoutForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { validateCampaignId, validateDonationAmount } from "@/lib/validation/donationValidation";
import createClient from "@/lib/supabase/client"; 

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface DonationModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ campaignId, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceedToPayment = async () => {
    setError(null);

    const campaignValidation = validateCampaignId(campaignId);
    if (!campaignValidation.valid) {
      setError(campaignValidation.error ?? null);
      return;
    }

    const amountValidation = validateDonationAmount(amount);
    if (!amountValidation.valid) {
      setError(amountValidation.error ?? null);
      return;
    }
    
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Fetch campaign to check status and deadline
      const { data: campaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("status, end_date")
        .eq("id", campaignId)
        .single();

      if (fetchError || !campaign) {
        throw new Error("Unable to verify campaign status. Please try again.");
      }

      // 2. ONLY Block if campaign is strictly ended/closed
      const isPastDeadline = new Date() > new Date(campaign.end_date);
      if (campaign.status !== 'Ongoing' || isPastDeadline) {
        setError("This campaign has ended and is no longer accepting donations.");
        setIsLoading(false);
        return;
      }

      // Note: "Hard Cap" checks (collected vs goal) have been removed to allow overfunding.

      const donationAmount = Number(amount);

      // 3. Proceed to Stripe Checkout API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            amount: donationAmount,
            campaignId: campaignId ,
            isAnonymous: isAnonymous
        }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }
      
      setClientSecret(data.clientSecret);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Payment initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Make a Donation</DialogTitle>
            
            {clientSecret && (
              <button 
                onClick={() => {
                  setClientSecret("");
                  setError(null);
                }} 
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Change Amount
              </button>
            )}
          </div>
        </DialogHeader>
        
        {!clientSecret ? (
          <div className="space-y-6 pt-4">
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {["5", "10", "20", "50", "100"].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setAmount(val);
                    setError(null);
                  }}
                  className={`py-2 rounded-lg border font-medium transition-all ${
                    amount === val
                      ? "border-orange-600 bg-orange-50 text-orange-700"
                      : "border-gray-300 hover:border-orange-300"
                  }`}
                >
                  RM {val}
                </button>
              ))}
            </div>

            <Input
              type="number"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              min="1"
              className="text-center"
            />
            <div 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                   isAnonymous ? "bg-blue-50 border-blue-200" : "border-gray-200"
                }`}
                onClick={() => setIsAnonymous(!isAnonymous)}
             >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                   isAnonymous ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                }`}>
                   {isAnonymous && <Check size={14} className="text-white" />}
                </div>
                <div className="text-sm">
                   <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Shield size={14} className="text-blue-600"/> Donate Anonymously
                   </span>
                   <p className="text-xs text-gray-500">Hide my name from the public list.</p>
                </div>
             </div>

            <Button 
              onClick={handleProceedToPayment}
              disabled={isLoading || !amount}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Checking Status..." : `Proceed to Payment`}
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={Number(amount)} isAnonymous={isAnonymous} />
            </Elements>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}