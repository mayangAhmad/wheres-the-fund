"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button
import { ArrowRight } from "lucide-react";

interface CampaignSummary {
  id: string;
  title: string;
  status: string;
  goal_amount: number;
  collected_amount: number;
}

export default function CampaignListClient({ initialCampaigns }: { initialCampaigns: CampaignSummary[] }) {
  // We accept data as props. No useEffect needed!
  
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">Campaign Title</th>
            <th className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">Progress</th>
            <th className="px-6 py-4 font-semibold text-gray-700 text-right whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {initialCampaigns.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{c.title}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  c.status === 'Ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {c.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">
                RM {c.collected_amount.toLocaleString()} / RM {c.goal_amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Link href={`/ngo/campaigns/${c.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 group">
                    Manage <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {initialCampaigns.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          You haven't created any campaigns yet.
        </div>
      )}
    </div>
  );
}