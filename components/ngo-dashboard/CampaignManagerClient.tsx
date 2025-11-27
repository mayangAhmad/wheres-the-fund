"use client";

import { useState } from "react";
import Link from "next/link"; // Import Link for back navigation
import { 
  CheckCircle2, Lock, Clock, AlertCircle, ArrowUpRight, 
  Users, TrendingUp, ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UpdateMilestoneModal from "./modals/UpdateMilestoneModal";

interface Props {
  campaign: any;
  milestones: any[];
}

export default function CampaignManagerClient({ campaign, milestones }: Props) {
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openUpdateModal = (milestone: any) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  // Calculate Progress %
  const percentFunded = Math.min(100, Math.round((Number(campaign.collected_amount) / Number(campaign.goal_amount)) * 100));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      
      {/* 1. Back Button */}
      <div className="mb-6">
        <Link 
          href="/ngo/campaigns" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to All Campaigns
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h2>
        <p className="text-gray-500">Campaign Management Dashboard</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN (Milestones) 
            Mobile: Order 2 (Bottom)
            Desktop: Order 1 (Left), Spans 2 cols
        */}
        <div className="order-2 lg:order-1 lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900">Milestone Control</h3>
             <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{milestones.length} Phases</span>
           </div>
           
           <div className="space-y-4">
             {milestones.map((ms, index) => {
               const isActive = ms.status === 'active';
               const isLocked = ms.status === 'locked';
               const isCompleted = ms.status === 'approved';
               const isPending = ms.status === 'pending_review';

               return (
                 <div 
                   key={ms.id} 
                   className={`relative p-6 rounded-xl border-2 transition-all ${
                     isActive ? 'border-blue-500 bg-white shadow-md' : 'border-gray-100 bg-gray-50'
                   }`}
                 >
                   {/* Status Badge */}
                   <div className="absolute top-4 right-4">
                      {isCompleted && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={12}/> Completed</span>}
                      {isActive && <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12}/> Active Phase</span>}
                      {isPending && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold"><AlertCircle size={12}/> Under Review</span>}
                      {isLocked && <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold"><Lock size={12}/> Locked</span>}
                   </div>

                   <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Phase {index + 1}</h4>
                   <h3 className={`text-lg font-bold mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{ms.title}</h3>
                   <p className="text-sm text-gray-500 mb-6">{ms.description}</p>

                   {/* Action Button */}
                   {isActive && (
                     <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-blue-700 font-medium">
                          Action Required: Submit proof.
                        </div>
                        <Button 
                          onClick={() => openUpdateModal(ms)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Update Progress <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                     </div>
                   )}
                   
                   {isPending && (
                     <div className="text-sm text-orange-600 font-medium pt-4 border-t border-orange-100">
                        Submitted on {new Date(ms.submission_date).toLocaleDateString()}. Waiting for auditor.
                     </div>
                   )}
                 </div>
               )
             })}
           </div>
        </div>

        {/* RIGHT COLUMN (Stats) 
            Mobile: Order 1 (Top)
            Desktop: Order 2 (Right), Spans 1 col
        */}
        <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
          
          {/* CARD 1: Financial Overview */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider flex items-center gap-2">
              <TrendingUp size={14} /> Financial Overview
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-3xl font-bold text-gray-900">
                  RM {Number(campaign.collected_amount).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">Collected</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${percentFunded}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="block text-lg font-semibold text-gray-900">
                    RM {Number(campaign.goal_amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">Target Goal</span>
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  {percentFunded}%
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: Donor Stats */}
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                <Users size={14} /> Donor Insights
             </h3>
             
             <div className="flex items-center justify-between mb-4">
                <div>
                   <span className="block text-3xl font-bold text-gray-900">
                     {campaign.donations_count || 0} 
                   </span>
                   <span className="text-sm text-gray-500">Total Donors</span>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                   <Users size={20} />
                </div>
             </div>
             
             <div className="text-xs text-gray-400 border-t pt-3">
                Last donation received {campaign.last_donation_at ? new Date(campaign.last_donation_at).toLocaleDateString() : '—'}
             </div>
          </div>

        </div>
      </div>

      {/* Render Modal */}
      {selectedMilestone && (
        <UpdateMilestoneModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          milestone={selectedMilestone}
          campaignId={campaign.id}
        />
      )}
    </div>
  );
}