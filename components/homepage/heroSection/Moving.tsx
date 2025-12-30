"use client";

import { motion } from "framer-motion";
import { User, Heart } from "lucide-react";

export interface MovingProps {
    amount: number;
    created_at: string;
    campaigns: { title: string } | null;
    donor_profiles: {
        users: { name: string } | null;
      } | null;
    }
        

export default function Moving({data} : {data: MovingProps[]}) {

  const getTime = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);

    let interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  if (!data || data.length === 0) return null;
  return (
    <section className="bg-gray-900 border-y border-gray-800 py-5 relative z-10">
      
      <div className="max-w-7xl mx-auto flex relative overflow-hidden">
    
        <div className="absolute left-0 top-0 bottom-0 bg-gray-900 z-20 pr-6 hidden md:flex items-center shadow-[15px_0_30px_rgba(17,24,39,1)]">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            LIVE
          </div>
          <div className="h-4 w-px bg-gray-700 ml-4"></div>
        </div>

        <div className="flex w-full mask-[linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] md:mask-none">
          <motion.div
            className="flex gap-16 px-4"
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 40, 
            }}
          >
            {/* Repeated List */}
            {[...data, ...data].map((donation, i) => {
              
              const donorName = donation.donor_profiles?.users?.name || "Anonymous";
              const campaignTitle = donation.campaigns?.title || "General Fund";
              const timeAgo = getTime(donation.created_at);

              return (
                <div key={i} className="flex items-center gap-3 shrink-0">
                  
                  {/* User Icon */}
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white border border-white">
                    <User size={14} />
                  </div>

                  {/* Text Info */}
                  <div className="text-sm">
                    <p className="text-gray-300 font-medium whitespace-nowrap">
                      {donorName}<span className="text-gray-500 mx-1">donated</span> 
                      <span className="text-emerald-400 font-bold font-mono">RM {donation.amount}</span>
                    </p>
                    <p className="text-[10px] text-gray-300 flex items-center gap-1 tracking-wide">
                      to {campaignTitle} • {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}