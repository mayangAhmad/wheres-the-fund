// app/donor/dashboard/dashboard-content.tsx
"use client";

import DonorImpactCircuit from "@/components/campaigns/flow-of-funds/DonorImpactCircuit";
import { User } from "@supabase/supabase-js";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Donor Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      {/* Your dashboard content */}
      <DonorImpactCircuit donorId={user.id}/>
    </div>
  );
}