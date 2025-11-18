'use client'

import Link from "next/link";
import HeroCampaignCarousel from "./HeroCampaignCarousel";
import { motion } from 'framer-motion'

export default function HomeHero2() {
  return (
    <>
      <section className="relative w-full min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col md:flex-row items-center justify-between overflow-hidden px-8 md:px-16 lg:px-24 py-12">
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:w-[50%] 2xl:ml-12 2xl:w-[45%] space-y-6 text-center md:text-left z-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl 2xl:text-6xl font-extrabold leading-tight md:leading-snug lg:leading-snug 2xl:leading-relaxed text-gray-900">
            <span className="block">Track Every Donation.</span>
            <span className="block text-blue-600">Trust Every Cause.</span>
          </h1>

          <p className="2xl:text-xl text-gray-600 text-base md:text-lg max-w-xl mx-auto md:mx-0">
            WheresTheFund helps donors see how their money is used with real-time
            milestone tracking and transparent blockchain verification.
            Finally, you don&apos;t have to doubt… just donate with us!
          </p>

          <Link
            href="/campaigns"
            className="self-center md:self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl mt-8"
          >
            Explore Campaigns
          </Link>
        </motion.div>

        {/* RIGHT SIDE - CAROUSEL */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="mt-12 md:mt-0 md:w-[50%] 2xl:w-[55%] flex justify-end"
        >
          <div className="w-full max-w-[768px]">
            <HeroCampaignCarousel />
          </div>
        </motion.div>

        {/* Decorative background shape */}
        <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-blue-200 rounded-full opacity-20 blur-3xl" />
      </section>

      {/* NGO STRIP SECTION */}
      <div className="bg-[#1c3448] border-t border-gray-200 py-6">
        <div className="max-w-[90rem] mx-auto flex flex-wrap justify-center items-center gap-8 px-6">
          <span className="text-gray-500 text-sm uppercase tracking-wide">
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
