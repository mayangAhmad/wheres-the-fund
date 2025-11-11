// app/ngo/dashboard/ngo-dashboard-content.tsx

import { DashboardSummaryCards } from "@/components/DashboardSummaryCards";


interface Campaign {
  id: string;
  title: string;
  created_at: string;
  signed: string
  tx_hash: string;
}

interface DashboardContentProps {
  user: {
    name: string;
    email: string;
    wallet: string;
    campaigns: Campaign[];
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const stats = {
    totalFunds: "RM 36,000",
    activeCampaigns: user.campaigns.length,
    donors: "120,000+",
    completionRate: "87%",
  };

  return (
    <main>
      <header className="p-4 bg-white shadow-md rounded-xl mx-auto w-[88rem] mr-6 ml-6">
        <h1 className="text-xl font-bold">Welcome back, {user.name}</h1>
        <p className="text-sm text-gray-600">Wallet: {user.wallet}</p>
      </header>

      <section className="mt-6">
        <DashboardSummaryCards stats={stats} />
      </section>
    </main>
  );
}
