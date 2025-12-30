// app/(app)/ngo/campaigns/[id]/page.tsx
import CampaignManagerClient from "@/components/ngo-dashboard/my-campaigns/manage/CampaignManagerClient";
import { getAuthenticatedUser, getSupabase } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";

export default async function CampaignManagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  const supabase = await getSupabase();

  if (!user) redirect("/auth/login");

  // 1. Await params (Required in newer Next.js versions)
  const { id } = await params; 

  // 2. Fetch campaign
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id) 
    .single();

  // 3. CRITICAL: Check for null BEFORE accessing campaign.ngo_id
  if (error || !campaign) {
    console.error("Fetch Error or Null Data:", error);
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Campaign not found</h1>
        <p className="text-gray-500">The ID {id} does not exist in our records.</p>
      </div>
    );
  }

  // 4. Now it's safe to log and check authorization
  console.log("Accessing campaign for NGO:", campaign.ngo_id);

  if (campaign.ngo_id !== user.id) {
    return <div className="p-10 text-center text-red-500">Unauthorized access</div>;
  }

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("campaign_id", id)  
    .order("milestone_index", { ascending: true });

  return (
    <CampaignManagerClient 
      campaign={campaign} 
      milestones={milestones || []} 
    />
  );
}
