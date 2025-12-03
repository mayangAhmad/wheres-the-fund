import { notFound } from "next/navigation";
import createClient from "@/lib/supabase/server";
import NgoProfileView from "@/components/verified-ngos/NgoProfileView";

// --- Types ---
export interface NgoProfileData {
  ngo_id: string;
  description: string | null;
  avatar_url: string | null;
  website_url: string | null;
  ssm_number: string;
  created_at: string;
  users: {
    name: string; 
    email: string;
  } | null;
}

// Updated to match what CampaignCard needs
export interface CampaignSimple {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  collected_amount: number;
  goal_amount: number;
  status: string;
  end_date: string | null; // <--- ADDED THIS
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NgoProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Profile Data
  const { data: ngoData, error } = await supabase
    .from("ngo_profiles")
    .select(`
      *,
      users (
        name, 
        email
      )
    `) 
    .eq("ngo_id", id)
    .maybeSingle();

  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  }

  if (!ngoData) {
    return notFound();
  }

  // 2. Fetch Active Campaigns
  const { data: campaignsData } = await supabase
    .from("campaigns")
    .select("id, title, image_url, category, collected_amount, goal_amount, status, end_date") // <--- ADDED end_date
    .eq("ngo_id", id)
    .eq("status", "Ongoing") 
    .limit(6);

  return (
    <NgoProfileView 
      profile={ngoData as unknown as NgoProfileData} 
      activeCampaigns={(campaignsData as CampaignSimple[]) || []} 
    />
  );
}