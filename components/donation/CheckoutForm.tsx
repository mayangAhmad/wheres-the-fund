//components/donation/CheckoutForm
import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button"; 

export default function CheckoutForm({ amount, isAnonymous }: { amount: number, isAnonymous: boolean }) {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Where to go after payment succeeds
                return_url: `${window.location.origin}/donor/success-donation?anonymous=${isAnonymous}`,
            },
        });

        if (error) {
            setErrorMessage(error.message ?? "An unknown error occurred");
        }
        
        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-4">
                <p className="text-sm text-gray-500">Total Donation</p>
                <p className="text-2xl font-bold text-gray-900">RM {amount.toFixed(2)}</p>
            </div>

            {/* The Stripe UI */}
            <PaymentElement />

            {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {errorMessage}
                </div>
            )}

            <Button 
                onClick={handleSubmit}
                disabled={!stripe || isLoading} 
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-6"
            >
                {isLoading ? "Processing..." : `Pay RM ${amount}`}
            </Button>
        </form>
    )
}