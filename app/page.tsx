
'use client'

import CampaignSlider from "@/components/CampaignSlider";
import HomeHero2 from "@/components/HomeHero2";
import ImpactHighlights from "@/components/ImpactHighlights";


export default function HomePage() {
  return (
    <main>
     <HomeHero2 />
     <CampaignSlider />
     <ImpactHighlights />
    </main>
  );
}

