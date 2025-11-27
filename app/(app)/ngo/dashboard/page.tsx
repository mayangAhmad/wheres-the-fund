// app/ngo/dashboard/page.tsx
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Use Admin for direct DB access
import DashboardContent from "@/components/ngo-dashboard/DashboardContent";

// 1. Create a specific fetch for the dashboard
async function getDashboardStats(userId: string) {
  const { data } = await supabaseAdmin
    .from("campaigns")
    .select("id, status, collected_amount")
    .eq("ngo_id", userId); // Fetch all campaigns for this NGO

  const campaigns = data || [];

  return {
    totalFunds: campaigns.reduce((sum, c) => sum + (Number(c.collected_amount) || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'Ongoing').length,
    donors: "120,000+", // Mock or fetch real count
    completionRate: "87%" // Mock or calc
  };
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;


  // 2. This fetch happens in parallel with the UI rendering
  // The 'loading.tsx' skeleton will show while this runs!
  const stats = await getDashboardStats(user.id);

  // 3. Pass stats as props
  return <DashboardContent initialStats={stats} />;
}