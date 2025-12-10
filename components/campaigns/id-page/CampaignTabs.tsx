"use client";

import { useEffect, useState } from "react";
import OurStory from "./OurStory";
import MilestoneTabContent from "../milestones/MilestoneTabContent";
import { Milestone } from "../milestones/MilestoneCard";
import CircuitBoard from "../flow-of-funds/CircuitBoard";
import HistoryTable from "@/components/donor-dashboard/history/HistoryTable";
import createClient from '@/lib/supabase/client';


// Types
interface PicData {
  name: string;
  contact: string;
}

interface TabsProps {
  campaignId:string;
  description: string;
  background?: string;
  problem?: string | string[];
  solution?: string | string[];
  milestones?: Milestone[]; 
  contact?: {
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    pics?: PicData[];
  };
}



// Helper: String Normalizer
const normalizeStringArray = (input?: string | string[]): string[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(s => s.trim()).filter(Boolean);
  if (typeof input === "string" && input.startsWith("{")) {
    return input.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
  }
  return [input as string];
};

export default function CampaignTabs({ campaignId, description, background, problem, solution, milestones = [], contact }: TabsProps) {
  const tabs = ["Our Story", "Milestones", "Flow of Funds","Transaction Log"];
  const [active, setActive] = useState(tabs[0]);

  const [transaction, setTransaction] = useState<any[]>([]);
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  useEffect(() => {
    if (active === "Transaction Log" && transaction.length === 0) {
      const fetchTransactions = async () => {
        setLoadingTransaction(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("donations")
          .select(`
            *,  
            users (id, name) 
            
          `)
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransaction(data || []);
        }
        setLoadingTransaction(false);
      };

      fetchTransactions();
    }
  }, [active, campaignId, transaction.length]);

  return (
    <div className="mt-10">
      {/* Tabs Header */}
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

      {/* Tabs Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[300px]">
        {active === "Our Story" && (
          <OurStory
            background={background || description}
            problem={normalizeStringArray(problem)}
            solution={normalizeStringArray(solution)}
            email={contact?.email || undefined}
            phone={contact?.phone || undefined}
            location={contact?.location || undefined}
            pics={contact?.pics}
          />
        )}

        {active === "Milestones" && (
          <MilestoneTabContent milestones={milestones} />
        )}

        {active === "Transaction Log" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Public Ledger</h3>
            <HistoryTable donations={transaction} mode="campaign"/>
          </div>
        )}

        {active === "Flow of Funds" && (
          <CircuitBoard campaignId={campaignId}/>
        )}
      </div>
    </div>
  );
}