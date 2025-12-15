// app/ngo/dashboard/page.tsx
import HomeDashboardContent from "@/components/ngo-dashboard/home/HomeDashboard";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { supabaseAdmin } from "@/lib/supabase/admin"; 

async function getDashboardStats(userId: string) {
  // 1. Fetch Campaigns AND their Milestones statuses
  const { data: campaignsData } = await supabaseAdmin
    .from("campaigns")
    .select(`
      id, title, status, collected_amount, goal_amount, current_milestone_index,
      milestones ( milestone_index, status )
    `)
    .eq("ngo_id", userId);

  const campaigns = campaignsData || [];
  const campaignIds = campaigns.map((c) => c.id);

  // 2. Fetch Real Donors (Count Unique User IDs)
  let uniqueDonorCount = 0;
  
  if (campaignIds.length > 0) {
    const { data: donations } = await supabaseAdmin
      .from("donations") 
      .select("donor_id")
      .in("campaign_id", campaignIds);

    // Use a Set to count unique donors
    const uniqueDonors = new Set(donations?.map((d) => d.donor_id));
    uniqueDonorCount = uniqueDonors.size;
  }

  // 3. Calculate Real Financials
  const totalFunds = campaigns.reduce((sum, c) => sum + (Number(c.collected_amount) || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + (Number(c.goal_amount) || 0), 0);
  
  const completionRateVal = totalGoal > 0 ? (totalFunds / totalGoal) * 100 : 0;
  const completionRateString = `${Math.round(completionRateVal)}%`;

  // 4. FILTER: Smart Logic for Actionable Items
  const actionableCampaigns = campaigns
    .filter(c => {
      // Must be currently running
      if (c.status !== 'Ongoing') return false;

      // Find the specific milestone currently active (or waiting)
      const currentMs = Array.isArray(c.milestones) 
        ? c.milestones.find((m: any) => m.milestone_index === c.current_milestone_index)
        : null;

      // Only show if the current milestone needs attention:
      // - pending_proof: Cap reached, donations paused, waiting for proof
      // - rejected: Admin rejected the proof, needs fix
      return currentMs?.status === 'pending_proof' || currentMs?.status === 'rejected';
    })
    .map(c => ({
      id: c.id,
      title: c.title,
      current_milestone: c.current_milestone_index || 0
    }));

  return {
    totalFunds: totalFunds,
    activeCampaigns: campaigns.filter(c => c.status === 'Ongoing').length, 
    donors: uniqueDonorCount.toLocaleString(),
    completionRate: completionRateString,
    actionableCampaigns: actionableCampaigns
  };
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const stats = await getDashboardStats(user.id);

  return <HomeDashboardContent initialStats={stats} />;
}