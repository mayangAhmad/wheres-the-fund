'use client'

import Link from "next/link";
import Image from "next/image";
import HeroCampaignCarousel from "./HeroCampaignCarousel"; 
import { motion } from 'framer-motion'

interface HomeHero2Props {
  campaigns: any[];
}

export default function HomeHero2({ campaigns }: HomeHero2Props) {
  return (
    <>
      {/* LAYOUT UPDATE: 
        Changed 'lg:flex-row' to 'xl:flex-row'.
        This ensures iPad Pro (1024px) remains in 'flex-col' (stacked vertical layout).
        Only screens larger than 1280px will switch to side-by-side.
      */}
      <section className="relative w-full min-h-[80vh] flex flex-col xl:flex-row items-center justify-between overflow-hidden px-8 md:px-16 lg:px-24 py-12">
        
        {/* 1. BACKGROUND IMAGE */}
        <Image 
          src="https://tsdtxolyogjpmbtogfmr.supabase.co/storage/v1/object/public/asset/hero-image.jpg"
          alt="Charity Background"
          fill
          priority
          className="object-cover object-center z-0"
        />

        {/* 2. DARK OVERLAY */}
        <div className="absolute inset-0 z-0 bg-black/60" />

        {/* ---------------------------------------------------------- */}
        {/* CONTENT LAYER (z-10) */}
        {/* ---------------------------------------------------------- */}
        
        {/* LEFT SIDE (TEXT) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          // UPDATED BREAKPOINTS:
          // changed all 'lg:' to 'xl:'
          className="relative z-10 flex flex-col w-full xl:w-[45%] 2xl:w-[45%] space-y-8 text-center xl:text-left xl:mr-4 pb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-6xl font-extrabold leading-tight md:leading-snug lg:leading-snug 2xl:leading-relaxed text-white">
            <span className="block">Track Every Donation.</span>
            <span className="block text-blue-500">Trust Every Cause.</span>
          </h1>

          {/* UPDATED: mx-auto xl:mx-0 */}
          <p className="text-[clamp(1.125rem,2.5vw,1.5rem)] leading-relaxed tracking-wide text-gray-200 max-w-xl mx-auto xl:mx-0">
            WheresTheFund helps donors see how their money is used with real-time
            milestone tracking and transparent blockchain verification.
            Finally, you don&apos;t have to doubt… just donate with us!
          </p>

          <Link
            href="/campaigns"
            // UPDATED: self-center xl:self-start
            className="group relative overflow-hidden self-center xl:self-start bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 mt-8 border border-transparent hover:border-blue-400"
          >
            <span className="absolute inset-0 w-0 bg-orange-500 transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative z-10 tracking-wider xl:text-xl">Explore Campaigns</span>
          </Link>
        </motion.div>

        {/* RIGHT SIDE - CAROUSEL */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          // UPDATED BREAKPOINTS:
          // 1. xl:w-[50%] (Desktop only)
          // 2. xl:mt-0 (Remove margin only on Desktop)
          // 3. xl:justify-end (Align right only on Desktop)
          className="relative z-10 mt-12 xl:mt-0 w-full xl:w-[50%] 2xl:w-[55%] flex justify-center xl:justify-end"
        >
          {/* Allow full width on tablet to accommodate 3 cards comfortably */}
          <div className="w-full max-w-5xl"> 
             {/* DEBUG: Check if campaigns are received */}
<div className="text-white bg-red-500/50 p-4 rounded">
  <p>Total campaigns received: {campaigns?.length || 0}</p>
  <p>Filtered campaigns: {campaigns?.filter(c => {
    const category = (c.category || "").toLowerCase().trim();
    const allowedKeywords = ['disaster', 'hunger'];
    const isMatchCategory = allowedKeywords.some(kw => category.includes(kw));
    const status = (c.status || "").toLowerCase().trim();
    const isActive = status === 'ongoing' || status === 'active';
    return isMatchCategory && isActive;
  }).length || 0}</p>
  <details>
    <summary>Campaign details</summary>
    <pre className="text-xs">{JSON.stringify(campaigns?.slice(0, 3), null, 2)}</pre>
  </details>
</div>
          </div>
        </motion.div>
      </section>

      {/* NGO STRIP SECTION */}
      <div className="bg-[#1c3448] border-t border-gray-700 py-6">
        <div className="max-w-360 mx-auto flex flex-wrap justify-center items-center gap-8 px-6">
          <span className="text-gray-400 text-sm uppercase tracking-wide">
            Trusted by:
          </span>

          <div className="flex gap-8 flex-wrap justify-center">
            <span className="text-gray-300 font-semibold text-lg">Red Crescent</span>
            <span className="text-gray-300 font-semibold text-lg">UNICEF</span>
            <span className="text-gray-300 font-semibold text-lg">Mercy Malaysia</span>
            <span className="text-gray-300 font-semibold text-lg">World Vision</span>
            <span className="text-gray-300 font-semibold text-lg">Save the Children</span>
          </div>
        </div>
      </div>
    </>
  );
}