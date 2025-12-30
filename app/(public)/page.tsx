
'use client'

import ImpactHighlights from "@/components/homepage/Content/ImpactHighlights";
import HomeHero2 from "@/components/homepage/heroSection/HomeHero2";



export default function HomePage() {
  return (
    <main>
     <HomeHero2 campaigns={[]} />
     <ImpactHighlights />
    </main>
  );
}

