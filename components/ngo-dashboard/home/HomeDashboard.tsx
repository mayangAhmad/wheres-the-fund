// components/ngo-dashboard/ngo-dashboard-content.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNgoUser } from "@/context/NgoUserContext";
import { DashboardSummaryCards } from "@/components/ngo-dashboard/home/DashboardSummaryCards";
import WalletDisplay from "./WalletDisplay";
import StripeConnectButton from "@/components/ngo-dashboard/StripeConnectButton";

// Define the shape of the stats
interface DashboardProps {
  initialStats: {
    totalFunds: number;
    activeCampaigns: number;
    donors: string;
    completionRate: string;
  }
}

export default function HomeDashboardContent({ initialStats }: DashboardProps) {
  const { user } = useNgoUser(); // Still use this for Name/Wallet
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("payment_setup") === "success") {
      toast.success("Bank account connected successfully!");
      // Clean up the URL
      router.replace("/ngo/dashboard");
    }
  }, [searchParams, router]);

  // Format the props for the cards
  const statsDisplay = {
    totalFunds: `RM ${initialStats.totalFunds.toLocaleString()}`,
    activeCampaigns: initialStats.activeCampaigns,
    donors: initialStats.donors,
    completionRate: initialStats.completionRate,
  };

  const hasStripeAccount = !!user.stripe_account_id;

  return (
    <main className="space-y-6 w-full max-w-352 mx-auto">
      <header className="p-6 ml-6 mr-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <section>
        <DashboardSummaryCards stats={statsDisplay} />
      </section>
    </main>
  );
}