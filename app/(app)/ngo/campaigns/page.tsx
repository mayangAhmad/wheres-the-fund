import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { supabaseAdmin } from "@/lib/supabase/admin";
import CampaignsList from "@/components/ngo-dashboard/CampaignList";
import { redirect } from "next/navigation";

// 1. Fetcher Function
async function getCampaigns(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select("id, title, status, collected_amount, created_at, tx_hash")
    .eq("ngo_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
  
  return data || [];
}

export default async function CampaignsPage() {
  // 2. Get User ID
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  // 3. Fetch Data (Parallel with loading UI)
  const campaigns = await getCampaigns(user.id);

  // 4. Render
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CampaignsList campaigns={campaigns} />
    </div>
  );
}