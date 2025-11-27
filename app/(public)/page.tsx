import createClient from "@/lib/supabase/server";
import HomeHero2 from "@/components/homepage/heroSection/HomeHero2";
import ImpactHighlights from "@/components/homepage/ImpactHighlights";

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch data ON THE SERVER (runs before HTML is sent to browser)
  const { data: disasterCampaigns } = await supabase
    .from("campaigns")
    .select("*")
    .ilike("category", "disaster")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main>
      <HomeHero2 campaigns={disasterCampaigns || []} />
      <ImpactHighlights />
    </main>
  );
}