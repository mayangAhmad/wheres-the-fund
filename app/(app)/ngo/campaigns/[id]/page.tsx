import CampaignManagerClient from "@/components/ngo-dashboard/CampaignManagerClient";
import { getAuthenticatedUser, getSupabase } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";

  type Props = {
  params: Promise<{ id: string }>
}

export default async function CampaignManagePage({ params }: { params: { id: string } }) {

  const user = await getAuthenticatedUser();
  const supabase = await getSupabase();

  if (!user) redirect("/auth/login");

  const { id } = await params; 

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id) 
    .single();

    console.log(campaign.ngo_id)

if (!campaign || error) {
  return <div>Campaign not found</div>; 
}

if (campaign.ngo_id !== user.id) {
  return <div>Unauthorized access</div>;
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
