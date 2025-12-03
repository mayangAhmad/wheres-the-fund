"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  // If Stripe didn't say "succeeded", something went wrong.
  if (redirectStatus !== "succeeded") {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-red-100 p-4 rounded-full mb-6">
          <Info className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Incomplete</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The payment status is not confirmed. Please check your bank statement or try again.
        </p>
        <Link href="/campaigns">
          <Button variant="outline" className="px-8 py-6 text-lg">
            Return to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  // PASSIVE SUCCESS STATE (Webhook handles the rest)
  return (
    <div className="flex flex-col items-center">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
      
      <p className="text-gray-600 mb-4 max-w-md">
        Your donation was successful! We have received your payment.
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left max-w-md w-full">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          Processing on Blockchain...
        </h3>
        <p className="text-sm text-blue-800/80">
          Our automated system is currently securing your funds in the Smart Contract Escrow. 
          You will receive an email receipt and a blockchain confirmation link shortly.
        </p>
      </div>

      <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 p-2 rounded">
        Ref ID: {paymentIntentId}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/donor/history" className="w-full">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg">
            View My History
          </Button>
        </Link>
        
        <Link href="/" className="w-full">
          <Button variant="ghost" className="w-full text-gray-500">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-orange-600" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}