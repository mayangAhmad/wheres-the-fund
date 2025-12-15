"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignAction {
  id: string;
  title: string;
  current_milestone: number;
}

export function ActionRequiredCard({ campaigns }: { campaigns: CampaignAction[] }) {
  // If no active campaigns, show a "Good Job" empty state
  if (campaigns.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">All caught up!</h3>
          <p className="text-sm text-gray-500">No pending actions for your campaigns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-orange-600" size={20} />
        <h3 className="font-bold text-gray-900">Action Required</h3>
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
          {campaigns.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 truncate pr-2">{campaign.title}</h4>
              <p className="text-xs text-gray-500">
                Phase {campaign.current_milestone + 1} Pending
              </p>
            </div>
            
            <Link href={`/ngo/campaigns/${campaign.id}`}>
              <Button size="sm" variant="outline" className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-800">
                Update
              </Button>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link href="/ngo/campaigns" className="flex items-center text-xs text-gray-500 hover:text-orange-600 font-medium transition-colors">
          View all campaigns <ArrowRight size={12} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}