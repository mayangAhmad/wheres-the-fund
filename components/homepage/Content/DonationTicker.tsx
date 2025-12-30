"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Users, Heart, Wallet, FileCheck } from "lucide-react";

// --- COUNTER COMPONENT (Unchanged logic, just ensure it works) ---
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.floor(latest)
        ) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
}

interface DonationTickerProps {
  stats: {
    money: number;
    donors: number;
    campaigns: number;
    updates: number;
  }
}

export default function DonationTicker({ stats }: DonationTickerProps) {

  const statItems = [
    {
      label: "Total Donated",
      value: stats.money,
      suffix: "+",
      prefix: "RM",
      icon: <Wallet className="w-6 h-6" />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Donors Worldwide",
      value: stats.donors,
      suffix: "",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "Campaigns Funded",
      value: stats.campaigns, 
      suffix: "",
      icon: <Heart className="w-6 h-6" />,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100"
    },
    {
      label: "Verified Updates",
      value: stats.updates,
      suffix: "",
      icon: <FileCheck className="w-6 h-6" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
  ];

  return (
    <section className="py-20 bg-slate-50 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/*Card*/}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8 md:p-12">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 divide-x-0 md:divide-x divide-slate-100">
            
            {statItems.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center px-4 group">
                
                {/*Icon*/}
                <div className={`mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.border} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>

                {/* Number */}
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 font-mono tracking-tight">
                  {stat.prefix && <span className="text-2xl mr-1 text-slate-400 font-bold">{stat.prefix}</span>}
                  <Counter value={stat.value} suffix={stat.suffix} />
                </h3>

                {/* Label */}
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                  {stat.label}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}