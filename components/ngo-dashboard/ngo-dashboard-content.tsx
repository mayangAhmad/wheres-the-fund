// components/ngo-dashboard/ngo-dashboard-content.tsx
"use client"; // 👈 Critical: Must be a Client Component to use Context

import { useNgoUser } from "@/context/NgoUserContext";
import { DashboardSummaryCards } from "@/components/ngo-dashboard/DashboardSummaryCards";

export default function DashboardContent() {
 
  const { user } = useNgoUser();
  const activeCampaignsCount = user.campaigns.filter(c => c.status === 'Ongoing').length;
  
  // Summing up collected amounts (assuming you have this field)
  const totalFundsRaised = user.campaigns.reduce((sum, campaign) => {
    return sum + (Number(campaign.collected_amount) || 0);
  }, 0);

  const stats = {
    totalFunds: `RM ${totalFundsRaised.toLocaleString()}`, // Real calculation
    activeCampaigns: activeCampaignsCount, // Real calculation
    donors: "120,000+", // Hardcoded for now (unless you add a donor count query)
    completionRate: "87%",
  };

  return (
    <main>
      <header className="p-4 bg-white shadow-md rounded-xl mx-auto w-full max-w-[88rem] px-6">
        <h1 className="text-xl font-bold">Welcome back, {user.name}</h1>
        {/* Access the wallet directly from the user object */}
        <p className="text-sm text-gray-600">Wallet: {user.wallet_address || "Not Connected"}</p>
      </header>

      <section className="mt-6">
        <DashboardSummaryCards stats={stats} />
      </section>
    </main>
  );
}