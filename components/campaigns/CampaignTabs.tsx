"use client";

import { useState } from "react";
import OurStory from "./OurStory";
import { Flag } from "lucide-react";

interface PicData {
  name: string;
  contact: string;
}

interface TabsProps {
  description: string;
  background?: string;
  problem?: string | string[];
  solution?: string | string[];
  milestones?: string | string[];
  contact?: {
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    pics?: PicData[];
  };
}

// Helper to ensure we always work with an array and remove blanks
const normalize = (input?: string | string[]): string[] => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map(s => s.trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    // Handle Postgres array string like "{foo,bar}"
    if (input.startsWith("{") && input.endsWith("}")) {
      return input
        .slice(1, -1)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [input].map(s => s.trim()).filter(Boolean);
  }

  return [];
};

export default function CampaignTabs({ description, background, problem, solution, milestones, contact }: TabsProps) {
  const tabs = ["Our Story", "Milestones", "Transaction Log"];
  const [active, setActive] = useState(tabs[0]);

  const renderContent = () => {
    switch (active) {
      case "Our Story":
        return (
          <OurStory
            background={background || description}
            problem={normalize(problem)}
            solution={normalize(solution)}
            email={contact?.email || undefined}
            phone={contact?.phone || undefined}
            location={contact?.location || undefined}
            pics={contact?.pics}
          />
        );
      
      case "Milestones":
        const milestoneList = normalize(milestones);

        if (milestoneList.length === 0) {
          return (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 text-gray-400">
                 <Flag size={20} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Milestones Set</h3>
              <p className="text-gray-500 mt-1">This campaign hasn't defined specific milestones yet.</p>
            </div>
          );
        }

        return (
          <div className="w-full max-w-5xl mx-auto py-8 overflow-x-auto">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-12">Campaign Roadmap</h3>
            
            <div className="flex w-full items-start justify-between relative min-w-[600px]"> 
              {milestoneList.map((title, index) => {
                const stepNumber = index + 1;
                const isFirst = index === 0;
                const isLast = index === milestoneList.length - 1;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center relative group">
                    <div className="flex w-full items-center absolute top-5 left-0 right-0 -z-10">
                      <div className={`h-1 flex-1 ${isFirst ? 'bg-transparent' : 'bg-orange-100'}`}></div>
                      <div className={`h-1 flex-1 ${isLast ? 'bg-transparent' : 'bg-orange-100'}`}></div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white border-2 border-orange-500 text-orange-600 font-bold flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                      {stepNumber}
                    </div>

                    <div className="mt-4 px-2 text-center max-w-[150px]">
                      <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
                        {title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "Transaction Log":
        return (
          <div className="p-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">On-Chain Activity</h3>
            <p className="text-gray-500 mt-1">Live blockchain data integration in progress.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-10">
      <div className="flex flex-wrap justify-center border-b border-gray-200 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-8 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
              active === tab
                ? "border-orange-500 text-orange-600 bg-orange-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[300px]">
        {renderContent()}
      </div>
    </div>
  );
}
