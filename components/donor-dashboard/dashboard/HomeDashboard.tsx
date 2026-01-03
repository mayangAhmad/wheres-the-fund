// app/donor/dashboard/dashboard-content.tsx
"use client";

import DonorImpactCircuit from "@/components/campaigns/flow-of-funds/DonorImpactCircuit";
import { Profile } from "./Profile";
import NotificationClient from "@/components/ngo-dashboard/notifications/NotificationClient";
import { BaseUser, Notification } from "@/types/ngo";

interface DonorStats {
    amount: number;
    campaign_id: string;
}

interface DashboardContentProps {
  profile: BaseUser;
  notifications: Notification[];
  stats: DonorStats[] | null;
}
  
export default function HomeDashboard({ profile, notifications, stats }: DashboardContentProps) {

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Welcome, {profile.name}! </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-full">
          <Profile profile={profile} stats={stats}/>
        </div>

        <div className="lg:col-span-1 h-full">
          <NotificationClient
            initialNotifications={notifications || []}
            userId={profile.id}
            mode="widget" />
        </div>
      </div>

      <div className="w-full">
          <DonorImpactCircuit donorId={profile.id}/>
      </div>

    </div>
  );
}