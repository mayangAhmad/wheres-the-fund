// components/ngo-dashboard/my-campaigns/manage/CampaignManagerClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 
import { 
  CheckCircle2, Lock, Clock, AlertCircle, 
  Users, TrendingUp, ArrowLeft, XCircle, Link as LinkIcon, 
  Loader2, Box, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UpdateMilestoneModal from "./UpdateMilestoneModal";
import createClient from "@/lib/supabase/client";
import { formatDistanceToNow } from 'date-fns';

const BLOCKSCOUT_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "http://localhost:8999"; 

interface Props {
  campaign: any;
  milestones: any[];
}

export default function CampaignManagerClient({ campaign, milestones: initialMilestones }: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  // --- 1. REALTIME SUBSCRIPTION ---
  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  useEffect(() => {
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
          const updatedMilestone = payload.new;
          setMilestones((prev) => 
            prev.map((ms) => 
              ms.id === updatedMilestone.id ? { ...ms, ...updatedMilestone } : ms
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
      
      {/* Navigation */}
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
             <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{milestones.length} Phases</span>
           </div>
           
           <div className="space-y-4">
             {milestones.map((ms, index) => {
               // ⭐ UPDATED STATUS LOGIC
               const isLocked = ms.status === 'locked';
               const isActive = ms.status === 'active';
               const isPendingProof = ms.status === 'pending_proof';
               const isPendingReview = ms.status === 'pending_review';
               const isApproved = ms.status === 'approved';
               const isRejected = ms.status === 'rejected';
               const isFailedDeadline = ms.status === 'failed_deadline';
               
               const canSubmitProof = isPendingProof || isRejected;
               const isDeadlineClose = ms.proof_deadline && new Date(ms.proof_deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000);

               return (
                 <div 
                   key={ms.id} 
                   className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                     canSubmitProof ? (isDeadlineClose ? 'border-red-400 bg-red-50/30 shadow-md ring-2 ring-red-100' : 'border-orange-400 bg-white shadow-md') : 
                     isApproved ? 'border-green-100 bg-green-50/30' :
                     isActive ? 'border-blue-200 bg-white ring-2 ring-blue-50' :
                     isFailedDeadline ? 'border-red-300 bg-red-50/50 opacity-75' :
                     'border-gray-100 bg-gray-50 opacity-75'
                   }`}
                 >
                   {/* Status Badge Positioning */}
                   <div className="absolute top-4 right-4">
                      {isApproved && (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                          <CheckCircle2 size={12}/> Approved & Released
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold border border-blue-200">
                          <Clock size={12}/> Active - Collecting
                        </span>
                      )}
                      {isPendingReview && (
                        <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-bold border border-purple-200">
                          <Loader2 size={12} className="animate-spin"/> Under Review
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold border border-gray-200">
                          <Lock size={12}/> Locked
                        </span>
                      )}
                      {isRejected && (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                          <XCircle size={12}/> Proof Rejected
                        </span>
                      )}
                      {isPendingProof && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
                          isDeadlineClose 
                            ? 'text-red-700 bg-red-100 border-red-300 animate-pulse' 
                            : 'text-orange-600 bg-orange-50 border-orange-200'
                        }`}>
                          <AlertCircle size={12}/> {isDeadlineClose ? 'URGENT: Submit Now!' : 'Action Required'}
                        </span>
                      )}
                      {isFailedDeadline && (
                        <span className="flex items-center gap-1 text-red-900 bg-red-200 px-2 py-1 rounded-full text-xs font-bold border-2 border-red-400">
                          <XCircle size={12}/> Deadline Missed
                        </span>
                      )}
                   </div>

                   <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Phase {index + 1}</h4>
                   <h3 className={`text-lg font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{ms.title}</h3>
                   <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ms.description}</p>

                   {/* ⭐ DEADLINE DISPLAY */}
                   {isPendingProof && ms.proof_deadline && (
                     <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                       isDeadlineClose 
                         ? 'bg-red-50 border-red-500' 
                         : 'bg-orange-50 border-orange-500'
                     }`}>
                       <div className="flex items-center gap-2 mb-1">
                         <AlertTriangle size={16} className={isDeadlineClose ? 'text-red-600' : 'text-orange-600'} />
                         <p className={`text-xs font-bold ${isDeadlineClose ? 'text-red-800' : 'text-orange-700'}`}>
                           {isDeadlineClose ? 'CRITICAL: Less than 24 hours left!' : 'Proof Submission Deadline'}
                         </p>
                       </div>
                       <p className={`text-xs ${isDeadlineClose ? 'text-red-700' : 'text-orange-600'}`}>
                         Due: {new Date(ms.proof_deadline).toLocaleString()} ({formatDistanceToNow(new Date(ms.proof_deadline), { addSuffix: true })})
                       </p>
                       <p className="text-xs text-gray-600 mt-1">
                         ⚠️ Failure to submit will result in account suspension
                       </p>
                     </div>
                   )}

                   {/* Alert Messaging */}
                   {isPendingProof && !ms.proof_deadline && (
                        <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                            <p className="text-sm text-orange-700 font-bold italic">"Milestone target reached. Donations are now held in escrow. Please submit proof of work to release funds."</p>
                        </div>
                   )}
                   
                   {isRejected && ms.auditor_remarks && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <p className="text-sm text-red-700 font-bold">Admin Feedback:</p>
                            <p className="text-xs text-red-600 mt-1 italic">{ms.auditor_remarks}</p>
                            <p className="text-xs text-red-500 mt-2 font-semibold">Please address these issues and resubmit.</p>
                        </div>
                   )}

                   {/* ⭐ DEADLINE FAILED WARNING */}
                   {isFailedDeadline && (
                     <div className="mb-4 bg-red-100 border-2 border-red-400 p-4 rounded-lg">
                       <div className="flex items-center gap-2 mb-2">
                         <XCircle size={20} className="text-red-800" />
                         <p className="text-sm font-bold text-red-900">Account Suspended - Deadline Missed</p>
                       </div>
                       <p className="text-xs text-red-700">
                         You failed to submit proof within the 5-day deadline. Your account has been blocked. 
                         Please contact support to appeal.
                       </p>
                     </div>
                   )}

                   {/* IPFS Transparency */}
                   {(isPendingReview || isApproved) && ms.ipfs_cid && (
                     <div className="mb-4 p-3 bg-gray-100/50 rounded-lg border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Box size={14} className="text-gray-400" />
                           <span className="text-xs text-gray-500 font-medium">IPFS Proof CID</span>
                        </div>
                        <a 
                          href={`https://gateway.pinata.cloud/ipfs/${ms.ipfs_cid}`} 
                          target="_blank" 
                          className="text-[10px] font-mono text-blue-600 hover:underline bg-white px-2 py-1 rounded border shadow-sm"
                        >
                          {ms.ipfs_cid.slice(0, 15)}...
                        </a>
                     </div>
                   )}

                   {/* Blockchain Payout Verification */}
                   {isApproved && ms.payout_tx_hash && (
                     <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between">
                        <span className="text-xs text-green-700 font-bold flex items-center gap-1.5">
                            <LinkIcon size={12} /> Payout Verified On-Chain
                        </span>
                        <a 
                            href={`${BLOCKSCOUT_URL}/tx/${ms.payout_tx_hash}`} 
                            target="_blank" 
                            className="text-[10px] text-blue-600 font-mono hover:underline"
                        >
                            {ms.payout_tx_hash.slice(0, 8)}...{ms.payout_tx_hash.slice(-8)}
                        </a>
                     </div>
                   )}

                   {/* Dynamic Action Buttons */}
                   {canSubmitProof && !isFailedDeadline && (
                       <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-4">
                          <Button 
                            onClick={() => openUpdateModal(ms)}
                            className={`font-bold ${
                              isDeadlineClose 
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                                : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                          >
                             {isRejected ? "Resubmit Evidence" : isDeadlineClose ? "Submit NOW!" : "Upload Evidence"}
                          </Button>
                       </div>
                   )}

                   {isFailedDeadline && (
                     <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-4">
                       <Button 
                         disabled
                         className="bg-gray-400 cursor-not-allowed"
                       >
                         Submission Disabled
                       </Button>
                     </div>
                   )}
                 </div>
               )
             })}
           </div>
        </div>

        {/* Stats Column */}
        <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
             <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} /> Campaign Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-3xl font-bold text-gray-900">
                      RM {Number(campaign.collected_amount).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">Collected in MYR</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentFunded}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-gray-400">Target: RM {Number(campaign.goal_amount).toLocaleString()}</span>
                    <span className="text-sm font-black text-orange-600">{percentFunded}%</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Users size={14} /> Donor Activity
                 </h3>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-900">{campaign.donations_count || 0}</span>
                    <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center font-bold">#</div>
                 </div>
                 <p className="text-xs text-gray-400">Lifetime contributions to this campaign.</p>
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