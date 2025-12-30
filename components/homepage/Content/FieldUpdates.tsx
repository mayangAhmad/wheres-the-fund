"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Building2, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface FieldUpdateItem {
  id: string;
  title: string;
  description: string;
  proof_images: string[] | null;
  created_at: string;
  campaigns: {
    id: string;
    title: string;
    users: any;
  } | null;
}

export default function FieldUpdates({ data }: { data: FieldUpdateItem[] }) {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [data]);

  if (!data || data.length === 0) return null;

  const CARD_SIZE = 432;

  const slideLeft = () => {
    const current = x.get();
    const newPos = Math.min(current + CARD_SIZE, 0);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const slideRight = () => {
    const current = x.get();
    const newPos = Math.max(current - CARD_SIZE, -width);
    animate(x, newPos, { type: "spring", stiffness: 300, damping: 30 });
  };

  const getNgoName = (campaign: any) => {
    if (!campaign || !campaign.users) return "Verified NGO";
    if (Array.isArray(campaign.users)) return campaign.users[0]?.name || "Verified NGO";
    return campaign.users?.name || "Verified NGO";
  };

  const getImageUrl = (images: string[] | null): string => {
    if (images && images.length > 0) return images[0];
    return "";
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 3600;
    if (diff < 1) return "Just now";
    if (diff < 24) return Math.floor(diff) + "h ago";
    return Math.floor(diff / 24) + "d ago";
  };

  return (
    <section id="impact-updates" className="py-12 bg-slate-900 overflow-hidden relative border-y border-slate-800">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header + Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Recent Impact Updates
            </h2>
            <p className="text-slate-400 max-w-xl text-lg">
              Verified milestones delivered by our partner NGOs.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={slideLeft}
              className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={slideRight}
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 hover:bg-blue-500 hover:shadow-blue-500/20 transition-all active:scale-95"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <motion.div 
          ref={carousel} 
          className="cursor-grab active:cursor-grabbing"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width }} 
            style={{ x }} 
            className="flex gap-8"
          >
            {data.map((item, i) => (
              <motion.div 
                key={i} 
                className="group relative flex-col min-w-[300px] md:min-w-[400px]" 
              >
                <Link
                  href={`/campaigns/${item.campaigns?.id}?tab=milestone#milestone-${item.id}`}
                  className="block h-full"
                  draggable={false}>
                
                <div className="relative h-60 w-full rounded-2xl overflow-hidden mb-6 bg-slate-800 border border-slate-700/50 shadow-2xl">
                  
                  <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-orange-900/40 flex items-center gap-1.5 border border-orange-400">
                    <Clock size={12} className="text-white" /> {getTimeAgo(item.created_at)}
                  </div>

                  <Image 
                    src={getImageUrl(item.proof_images)} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                    draggable={false} 
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col pr-4">
                   
                   <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">
                      <Building2 size={12} />
                      {getNgoName(item.campaigns)}
                   </div>

                   <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 line-clamp-2 transition-colors h-14">
                      {item.title}
                   </h3>

                   <p className="text-slate-400 leading-relaxed text-sm line-clamp-3">
                      {item.description}
                   </p>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}