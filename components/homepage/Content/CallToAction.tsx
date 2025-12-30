"use client";

import { ArrowRight, Building2, Heart } from "lucide-react";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Grid Pattern Texture */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
          Ready to make a <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            real-world difference?
          </span>
        </h2>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Join thousands of donors and verified NGOs using blockchain to bring transparency back to charity. Every cent is tracked. Every impact is proven.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          
          {/* Donate */}
          <Link 
            href="/campaigns"
            className="group w-full sm:w-auto bg-orange-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Heart size={20} className="group-hover:text-pink-200 transition-colors" fill="currentColor" />
            Start Donating
          </Link>

          {/* NGO Partner */}
          <Link 
            href="/auth/register?role=ngo"
            className="group w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-full font-bold text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Building2 size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            I represent an NGO
          </Link>

        </div>

        {/* Trust Note */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Join 8,430+ donors trusting us today
        </div>

      </div>
    </section>
  );
}