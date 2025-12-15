"use client";

import { useState, useEffect } from "react"; // 1. Import useEffect
import Link from "next/link"; 
import { 
  CheckCircle2, Lock, Clock, AlertCircle, 
  Users, TrendingUp, ArrowLeft, XCircle, Link as LinkIcon, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UpdateMilestoneModal from "./UpdateMilestoneModal";
import createClient from "@/lib/supabase/client"; // 2. Import Supabase Client

const CHAINLENS_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "http://localhost:8999"; 

interface Props {
  campaign: any;
  milestones: any[];
}

export default function CampaignManagerClient({ campaign, milestones: initialMilestones }: Props) {
  // 3. Store milestones in state so they can be updated dynamically
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  // 4. REALTIME SUBSCRIPTION
  useEffect(() => {
    // Listen for any UPDATE to the 'milestones' table for this specific campaign
    const channel = supabase
      .channel(`campaign-milestones-${campaign.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'milestones',
          filter: `campaign_id=eq.${campaign.id}`,
        },
        (payload) => {
          // When a change happens (e.g., status becomes 'pending_proof'), update the state
          const updatedMilestone = payload.new;
          
          setMilestones((prev) => 
            prev.map((ms) => 
              ms.id === updatedMilestone.id ? updatedMilestone : ms
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaign.id, supabase]);

  const openUpdateModal = (milestone: any) => {
    setSelectedMilestone(milestone);
    setIsModalOpen(true);
  };

  const percentFunded = Math.min(100, Math.round((Number(campaign.collected_amount) / Number(campaign.goal_amount)) * 100));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      
      {/* ... Header & Back Button (No Changes) ... */}
      <div className="mb-6">
        <Link href="/ngo/campaigns" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to All Campaigns
        </Link>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h2>
        <p className="text-gray-500">Campaign Management Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Milestones Column */}
        <div className="order-2 lg:order-1 lg:col-span-2">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900">Milestone Control</h3>
             {/* Use state 'milestones' here */}
             <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{milestones.length} Phases</span>
           </div>
           
           <div className="space-y-4">
             {/* Map over the STATE 'milestones', not the prop */}
             {milestones.map((ms, index) => {
               // ... (Keep all your existing status logic exactly the same) ...
               const isPendingProof = ms.status === 'pending_proof';
               const isRejected = ms.status === 'rejected';
               const isPendingReview = ms.status === 'pending_review';
               const isCompleted = ms.status === 'approved' || ms.status === 'completed';
               const isActivePhase = ms.status === 'active'; 
               const isLocked = ms.status === 'locked' || (!isActivePhase && !isPendingProof && !isRejected && !isPendingReview && !isCompleted);
               const canSubmitProof = isPendingProof || isRejected;

               return (
                 <div 
                   key={ms.id} 
                   className={`relative p-6 rounded-xl border-2 transition-all duration-500 ease-in-out ${ // Added animation
                     canSubmitProof ? 'border-orange-400 bg-white shadow-md scale-[1.01]' : 
                     isCompleted ? 'border-green-100 bg-green-50/30' :
                     isActivePhase ? 'border-blue-200 bg-white' : 
                     'border-gray-100 bg-gray-50'
                   }`}
                 >
                   {/* ... (Keep all the badge logic and content exactly the same) ... */}
                   
                   <div className="absolute top-4 right-4">
                      {isCompleted && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={12}/> Completed</span>}
                      {isActivePhase && <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12}/> Fundraising...</span>}
                      {isPendingReview && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12}/> Under Review</span>}
                      {isLocked && <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold"><Lock size={12}/> Locked</span>}
                      {isRejected && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12}/> Rejected</span>}
                      {isPendingProof && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-bold animate-pulse"><AlertCircle size={12}/> Cap Reached</span>}
                   </div>

                   <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Phase {index + 1}</h4>
                   <h3 className={`text-lg font-bold mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{ms.title}</h3>
                   <p className="text-sm text-gray-500 mb-6">{ms.description}</p>

                   {/* Alerts */}
                   {isPendingProof && (
                        <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 animate-in slide-in-from-left-2">
                            <p className="text-sm text-orange-700 font-bold">⚠️ Milestone Cap Reached!</p>
                            <p className="text-xs text-orange-600 mt-1">Donations are paused. Submit proof to unlock funds.</p>
                        </div>
                   )}
                   {isRejected && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 animate-in slide-in-from-left-2">
                            <p className="text-sm text-red-700 font-bold flex items-center gap-2">Proof Rejected</p>
                            <p className="text-xs text-red-600 mt-1">The admin requested changes. Please check details and resubmit.</p>
                        </div>
                   )}

                   {/* Blockchain Proof */}
                   {isCompleted && ms.payout_tx_hash && (
                     <div className="mt-4 pt-4 border-t border-green-200/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-green-700 font-medium flex items-center gap-2">
                                <CheckCircle2 size={14} /> Payout Verified on Blockchain
                            </span>
                            <a 
                                href={`${CHAINLENS_URL}/tx/${ms.payout_tx_hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                                <LinkIcon size={12} />
                                View in Chainlens
                            </a>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400 font-mono bg-white/50 p-1.5 rounded border border-green-100 truncate">
                            Tx: {ms.payout_tx_hash}
                        </div>
                     </div>
                   )}

                   {/* Action Buttons */}
                   {canSubmitProof && (
                       <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                          <div className="text-sm text-orange-700 font-medium animate-pulse">
                             {isRejected ? "Action: Resubmit Proof" : "Action: Submit Proof to Unlock Funds"}
                          </div>
                          <Button 
                            onClick={() => openUpdateModal(ms)}
                            variant={isRejected ? "destructive" : "default"}
                          >
                             {isRejected ? "Resubmit Proof" : "Submit Proof"}
                          </Button>
                       </div>
                   )}

                   {isActivePhase && (
                       <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                          <div className="text-sm text-gray-400">
                             Status: Collecting Donations
                          </div>
                          <Button disabled variant="outline" className="bg-gray-50 text-gray-400 border-gray-200">
                             <Lock size={14} className="mr-2" /> Proof Locked
                          </Button>
                       </div>
                   )}
                   
                   {isPendingReview && (
                     <div className="text-sm text-blue-600 font-medium pt-4 border-t border-blue-50 mt-4 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Waiting for auditor approval.
                     </div>
                   )}
                 </div>
               )
             })}
           </div>
        </div>

        {/* Stats Column (No Changes) */}
        <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
            {/* ... Keep existing Stats code ... */}
             <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                  <TrendingUp size={14} /> Financial Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-3xl font-bold text-gray-900">
                      RM {Number(campaign.collected_amount).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">Total Collected</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percentFunded}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="block text-lg font-semibold text-gray-900">RM {Number(campaign.goal_amount).toLocaleString()}</span>
                      <span className="text-xs text-gray-500">Target Goal</span>
                    </div>
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{percentFunded}%</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                    <Users size={14} /> Donor Insights
                 </h3>
                 <div className="flex items-center justify-between mb-4">
                    <div>
                       <span className="block text-3xl font-bold text-gray-900">{campaign.donations_count || 0}</span>
                       <span className="text-sm text-gray-500">Total Donors</span>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users size={20} /></div>
                 </div>
                 <div className="text-xs text-gray-400 border-t pt-3">
                    Last donation received {campaign.last_donation_at ? new Date(campaign.last_donation_at).toLocaleDateString() : '—'}
                 </div>
              </div>
        </div>
      </div>

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