"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import MilestoneCard from "./MilestoneCard";
import { Milestone } from "@/types/ngo";

interface Props {
  milestones?: Milestone[];
}

export default function MilestoneTabContent({ milestones = [] }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); 

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (milestones.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 text-gray-400">
            <Flag size={20} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Milestones Found</h3>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h3 className="text-xl font-bold text-gray-900 mb-8">Project Roadmap & Evidence</h3>
      
      <div className="space-y-6 relative">
        {/* Vertical Connector Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 hidden md:block" />

        {milestones.map((ms, index) => (
          <div 
            key={ms.id} 
            id={`milestone-${ms.id}`}  
            className="scroll-mt-32 relative" 
          >
            <MilestoneCard 
              milestone={ms}
              index={index}
              isOpen={expandedIndex === index}
              onToggle={() => toggleAccordion(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}