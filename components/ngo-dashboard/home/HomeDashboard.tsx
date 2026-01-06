"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNgoUser } from "@/context/NgoUserContext";
import { DashboardSummaryCards } from "@/components/ngo-dashboard/home/DashboardSummaryCards";
import WalletDisplay from "./WalletDisplay";
import StripeConnectButton from "@/components/ngo-dashboard/StripeConnectButton";
import SetupChecklist from "./SetupChecklist";
import { ActionRequiredCard } from "@/components/ngo-dashboard/home/ActionRequiredCard";

interface DashboardProps {
  initialStats: {
    totalFunds: number;
    activeCampaigns: number;
    donors: string;
    completionRate: string;
    actionableCampaigns: any[]; 
  }
}

export default function HomeDashboardContent({ initialStats }: DashboardProps) {
  const { user } = useNgoUser(); 
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("payment_setup") === "success") {
      toast.success("Bank account connected successfully!");
      router.replace("/ngo/dashboard");
    }
  }, [searchParams, router]);

  const statsDisplay = {
    totalFunds: `RM ${initialStats.totalFunds.toLocaleString()}`,
    activeCampaigns: initialStats.activeCampaigns,
    donors: initialStats.donors,
    completionRate: initialStats.completionRate,
  };

  const hasStripeAccount = !!user.stripe_account_id;

  return (
    // FIX 1: Reduced padding to 'px-4' on mobile, 'px-6' on larger screens
    // FIX 2: Added 'overflow-x-hidden' to prevent horizontal scroll issues on the main page
    <main className="space-y-4 md:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-8 overflow-x-hidden">
      
      {/* Header */}
      {/* FIX 3: Reduced internal padding 'p-4' for mobile */}
      <header className="p-4 sm:p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        
        {/* Title Section - Added min-w-0 to allow text wrapping */}
        <div className="min-w-0 w-full md:w-auto">
          {/* FIX 4: 'text-xl' on mobile, 'break-words' to prevent long names from breaking layout */}
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 break-words">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is what is happening with your campaigns today.
          </p>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col gap-3 w-full md:w-auto items-start md:items-end">
          
          {/* Wallet Box */}
          {/* FIX 5: This container now spans full width on mobile, auto on desktop */}
          <div className="flex items-center justify-between md:justify-start gap-3 bg-gray-50 px-3 py-2 sm:px-4 rounded-lg border border-gray-200 w-full md:w-auto min-w-0 max-w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 shrink-0">
              Wallet
            </span>
            {/* FIX 6: 'flex-1' and 'min-w-0' ensures the wallet address truncates properly inside */}
            <div className="truncate flex-1 min-w-0 text-right md:text-left">
              <WalletDisplay address={user.wallet_address} />
            </div>
          </div>
          
          {/* Stripe Button - ensure it takes full width on mobile if needed */}
          <div className="w-full md:w-auto">
            <StripeConnectButton isConnected={hasStripeAccount} />
          </div>
        </div>
      </header>

      {/* Checklist */}
      <div className="w-full">
         <SetupChecklist campaignCount={initialStats.activeCampaigns} />
      </div>

      {/* Main Content Area */}
      <div className="space-y-4 md:space-y-6 w-full">
        
        {/* 1. Summary Cards */}
        <div className="w-full">
          <DashboardSummaryCards stats={statsDisplay} />
        </div>

        {/* 2. Notification / Action Panel */}
        <div className="w-full">
          <ActionRequiredCard campaigns={initialStats.actionableCampaigns} />
        </div>

      </div>
    </main>
  );
}