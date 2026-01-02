import createClient from "@/lib/supabase/server";
import HomeHero2 from "@/components/homepage/heroSection/HomeHero2";
import ImpactHighlights from "@/components/homepage/Content/ImpactHighlights";
import  HowItWorks  from "@/components/homepage/Content/HowItWorks";
import DonationTicker from "@/components/homepage/Content/DonationTicker";
import Moving, {MovingProps} from "@/components/homepage/heroSection/Moving";
import FieldUpdates, { FieldUpdateItem } from "@/components/homepage/Content/FieldUpdates";
import BlockchainTrust from "@/components/homepage/Content/BlockchainTrust";
import CallToAction from "@/components/homepage/Content/CallToAction";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: disasterCampaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(10);

  const {count: campaignCount} = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true});

  const {count: donorCount} = await supabase
    .from("donor_profiles")
    .select("*", { count: "exact", head: true });

  const { count: updatesCount } = await supabase
    .from("milestones")
    .select("*", {count: "exact", head: true})
    .eq("status", "approved");

  const {data: allAmount} = await supabase 
    .from("donations")
    .select("amount");

  const totalAmount = allAmount?.reduce((sum, row) => sum + row.amount, 0) || 0;

  const { data: rawDonations } = await supabase 
    .from("donations")
    .select(`amount, created_at, campaigns (title), donor_profiles (users (name)) `)
    .order("created_at", { ascending: true })
    .limit(10);

  const recentDonations = rawDonations as unknown as MovingProps[];

  const { data: rawUpdates} = await supabase
    .from("milestones")
    .select("id, title, description, proof_images, created_at, campaigns (id, title, users (name))")
    .not("proof_images", "is", null)
    .neq("proof_images", "[]")
    .order("created_at", {ascending: true})
    .limit(8);

  const LatestUpdates = rawUpdates as unknown as FieldUpdateItem[];

  return (
    <main>
      <HomeHero2 campaigns={disasterCampaigns || []} />
      <Moving data={recentDonations || []}/>
      <BlockchainTrust/>
      <FieldUpdates data={LatestUpdates || []}/>
      <ImpactHighlights />
      <HowItWorks/>
      <CallToAction/>
      <DonationTicker stats={{campaigns: campaignCount || 0, 
      money: totalAmount || 0, donors: donorCount || 0, updates: updatesCount || 0}}/>
      
    </main>
  );
}