//components/donation/DonationModal
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X, ArrowLeft, AlertCircle } from "lucide-react";
import CheckoutForm from "./CheckoutForm"; // Your existing form
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { validateCampaignId, validateDonationAmount } from "@/lib/validation/donationValidation";

// Load Stripe outside the component to avoid re-loading it on renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface DonationModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ campaignId, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState("");
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            amount: Number(amount),
            campaignId: campaignId }), 
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
            {/* Error message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Preset Buttons */}
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

            {/* Custom Amount Input */}
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

            {/* Proceed Button */}
            <Button 
              onClick={handleProceedToPayment}
              disabled={isLoading || !amount}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Processing..." : `Proceed to Payment`}
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={Number(amount)} />
            </Elements>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}