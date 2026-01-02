"use client";

import { Search, Wallet, LineChart, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Find a Verified Cause",
      description: "Browse our live feed of vetted NGOs and urgent disaster relief campaigns.",
      icon: <Search className="w-8 h-8 text-blue-600" />,
    },
    {
      id: "02",
      title: "Donate via Blockchain",
      description: "Send funds instantly and securely using FPX, Card, or Crypto. No hidden fees.",
      icon: <Wallet className="w-8 h-8 text-emerald-500" />,
    },
    {
      id: "03",
      title: "Track the Impact",
      description: "Watch the public ledger update as your money reaches the people in need.",
      icon: <LineChart className="w-8 h-8 text-purple-500" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-100 relative overflow-hidden">
      
     {/* Background*/}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -mr-40 -mt-20"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.3}}
          className="text-center mb-20">
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            Start making a measurable difference in three simple steps, backed by the security of the blockchain.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] border-t-2 border-dashed border-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.5, delay: 0.3}}

              className="flex flex-col items-center text-center group relative">
              
              {/* Step Icon Container */}
              <div className="relative w-32 h-32 mb-8">
                {/* Background Blob */}
                <div className="absolute inset-0 bg-slate-50 rounded-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                
                {/* Main Box */}
                <div className="absolute inset-0 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                  {step.icon}
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-3 -right-3 bg-slate-900 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full border-4 border-white shadow-md">
                  {step.id}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto text-sm md:text-base">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}