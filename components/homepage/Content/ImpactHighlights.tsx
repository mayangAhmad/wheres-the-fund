"use client";

import { ShieldCheck, Wallet, Users, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ImpactHighlights() {
  const highlights = [
    {
      title: "Strictly Vetted NGOs",
      description: "Every organization undergoes a strict 3-step verification process before they can raise a single cent.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />, 
    },
    {
      title: "Seamless Fiat Donation",
      description: "We accept FPX, Cards, and E-wallets, instantly converting them to secure tokens on the backend.",
      icon: <Wallet className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Direct-to-Beneficiary",
      description: "Smart contracts ensure funds are locked until proof of work is submitted, minimizing waste.",
      icon: <Users className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "Real-Time Alerts",
      description: "No more wondering. Get instant notifications when your funds move and milestones are completed.",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-100 relative overflow-hidden">

      {/* Background*/}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -mr-40 -mt-20 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 1. NEW HEADER BADGE */}
        <motion.div
          initial={{opacity: 0, x: 20}}
          whileInView={{opacity: 1, x: 0}}
          transition={{duration: 0.5, delay: 0.3}}
          viewport={{margin: "-50px"}}
          className="text-center mb-12">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                 Why We Are Different
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Built for Trust. Optimized for Speed.
            </h2>
        </motion.div>

        {/* 2. LAYOUT  */}
        <motion.div 
          initial={{opacity: 0, x: -20}}
          whileInView={{opacity: 1, x: 0}}
          transition={{duration: 0.5, delay: 0.2}}
          viewport={{margin: "-100px"}}
          className="bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 md:p-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y md:divide-y-0 lg:divide-x divide-slate-200">
            
            {highlights.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center px-4 pt-8 md:pt-0 first:pt-0 lg:pt-0">
                
                {/* Icon Circle */}
                <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                    {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {item.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-500 leading-relaxed text-sm max-w-[240px] mx-auto">
                    {item.description}
                </p>
                </div>
            ))}
            
            </div>
        </motion.div>

      </div>
    </section>
  );
}