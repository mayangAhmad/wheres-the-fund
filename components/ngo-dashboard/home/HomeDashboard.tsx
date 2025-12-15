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
    // 1. FIX: Add 'px-6' here. This ensures EVERYTHING is aligned.
    <main className="space-y-6 w-full max-w-7xl mx-auto px-6 pb-8">
      
      {/* Header: Removed 'ml-6 mr-6' so it respects the parent's px-6 */}
      <header className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is what is happening with your campaigns today.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto items-start md:items-end">
          <div className="flex items-center justify-between md:justify-start gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 w-full md:w-auto min-w-0 overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 shrink-0">
              Wallet
            </span>
            <div className="truncate">
              <WalletDisplay address={user.wallet_address} />
            </div>
          </div>
          <StripeConnectButton isConnected={hasStripeAccount} />
        </div>
      </header>

      {/* Checklist: Removed the wrapper <div> with px-6 */}
      <SetupChecklist campaignCount={initialStats.activeCampaigns} />

      {/* Main Content Area: Removed 'px-6' from this wrapper */}
      <div className="space-y-6 w-full">
        
        {/* 1. Summary Cards */}
        <div>
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