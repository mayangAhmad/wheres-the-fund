"use client";

import { ShieldCheck, Search, Link2, FileCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BlockchainTrust() {
  const features = [
    {
      icon: <Link2 className="text-emerald-500" size={24} />,
      title: "Permanent Record",
      desc: "Every contribution is securely recorded on a public ledger. This creates a permanent history of kindness that cannot be erased or altered."
    },
    {
      icon: <Search className="text-blue-500" size={24} />,
      title: "Follow the Journey",
      desc: "See exactly where your money goes. Track your funds from the moment they leave your wallet until they reach the people in need."
    },
    {
      icon: <FileCheck className="text-purple-500" size={24} />,
      title: "Impact Verified",
      desc: "We don't just send money; we ensure results. Funds are released in stages, only after the NGO proves they have completed the work."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden border-y border-slate-100">
      
      {/* Background*/}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -mr-40 -mt-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left*/}
          <div>
            
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Peace of mind is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                part of the process.
              </span>
            </h2>
            
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              We believe you deserve to know the true impact of your generosity. 
              By using secure blockchain technology, we remove the mystery from charity 
              and provide clear, undeniable proof that your help has arrived.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#impact-updates"
                className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  View Achievements
              </Link>

              <Link
                href="#how-it-works"
                className="px-6 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500"/> How it works
              </Link>
              
            </div>
          </div>

          {/* Right: The Features */}
          <div className="grid gap-6">
            {features.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-100 p-6 rounded-2xl flex gap-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                {/* Icon Box */}
                <div className="shrink-0 w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all">
                  {item.icon}
                </div>
                
                {/* Text */}
                <div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}