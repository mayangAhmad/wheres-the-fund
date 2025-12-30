import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminCampaignsClient from "@/components/admin-dashboard/AdminCampaignsClient";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const { data: campaigns, error } = await supabaseAdmin
    .from("campaigns")
    .select(`
      id,
      title,
      ngo_name,
      status,
      collected_amount,
      goal_amount,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Campaigns Error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaign Management</h1>
        <p className="text-sm text-gray-500">Monitor and manage all fundraising initiatives across the platform.</p>
      </div>
      
      <AdminCampaignsClient initialCampaigns={campaigns || []} />
    </div>
  );
}