import createClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampaignListClient from "@/components/ngo-dashboard/my-campaigns/CampaignListClient";

export default async function NgoCampaignsPage() {
  // 👇 FIX: Add 'await' here
  const supabase = await createClient(); 

  // 1. LIGHTWEIGHT AUTH CHECK
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. FETCH DATA
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, status, created_at, goal_amount, collected_amount")
    .eq("ngo_id", user.id)
    .order("created_at", { ascending: false });

  // 3. RENDER CLIENT COMPONENT
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
          <p className="text-gray-500">Manage your fundraising efforts and milestones.</p>
        </div>
        <a 
          href="/ngo/campaigns/create" 
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
        >
          + Create New
        </a>
      </div>

      <CampaignListClient initialCampaigns={campaigns || []} />
    </div>
  );
}