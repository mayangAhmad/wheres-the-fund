//components/donation/DonationModal
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X, ArrowLeft } from "lucide-react";
import CheckoutForm from "./CheckoutForm"; // Your existing form
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const handleProceedToPayment = async () => {
    if (!amount || Number(amount) <= 0) return;
    
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
      
      // Save the secret (This triggers the view to switch to Stripe)
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error initializing payment:", error);
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
                onClick={() => setClientSecret("")} 
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Change Amount
              </button>
            )}
          </div>
        </DialogHeader>
        
        {!clientSecret ? (
          <div className="space-y-6 pt-4">
            {/* Preset Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {["5","10","20", "50", "100"].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-lg border font-medium transition-all ${
                    amount === val
                      ? "border-orange-600 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-300 text-gray-600"
                  }`}
                >
                  RM {val}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">RM</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 py-6 text-lg font-medium"
                placeholder="Enter amount"
              />
            </div>

            <Button 
              onClick={handleProceedToPayment} 
              disabled={!amount || isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg"
            >
              {isLoading ? "Preparing Secure Payment..." : "Proceed to Pay"}
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Elements 
                stripe={stripePromise} 
                options={{ 
                    clientSecret, 
                    appearance: { theme: 'stripe' } 
                }}
            >
              <CheckoutForm amount={Number(amount)} /> 
            </Elements>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}