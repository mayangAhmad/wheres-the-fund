"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  const hasRun = useRef(false);

  useEffect(() => {
    if (!paymentIntentId || !redirectStatus) {
      setStatus("failed");
      return;
    }

    const finalizeDonation = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      if(redirectStatus === "succeeded") {
        try {
          const res = await fetch("/api/donation/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId }),
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.message === "Already recorded") {
              setStatus("success");
              return;
            }
            throw new Error(data.error || "Finalization failed");
          }

          console.log("Donation recorded successfully:", data);
          setStatus("success");

        } catch (error) {
          console.error("Failed to finalize donation:", error);
          setStatus("success"); 
        }
      } else {
        setStatus("failed");
      }
    };

    finalizeDonation();
  }, [paymentIntentId, redirectStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      
      {status === "loading" && (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500">Please wait while we confirm your donation.</p>
        </div>
      )}

      {status === "success" && (
        <>
          <div className="bg-green-100 p-4 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Your donation has been successfully processed. Your support makes a huge difference.
          </p>
          {paymentIntentId && (
            <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 p-2 rounded">
              Ref ID: {paymentIntentId}
            </p>
          )}
        </>
      )}

      {status === "failed" && (
        <>
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Something went wrong with your donation. No funds were deducted. Please try again.
          </p>
        </>
      )}

      <Link href="/campaigns">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
          Return to Campaigns
        </Button>
      </Link>
    </div>
  );
}