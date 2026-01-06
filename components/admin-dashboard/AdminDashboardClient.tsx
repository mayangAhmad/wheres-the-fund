// components/admin-dashboard/AdminDashboardClient.tsx
"use client";

import { useState } from "react";
import { 
  CheckCircle, XCircle, ExternalLink, Box, 
  ShieldCheck, Loader2, FileText, Search, 
  ChevronRight, Info, X, ClipboardCheck, AlertTriangle, Clock
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboardClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [inspectingManifest, setInspectingManifest] = useState<any>(null);
  const [fetchingManifest, setFetchingManifest] = useState(false);
  
  // ⭐ NEW: Rejection modal state
  const [rejectingMilestone, setRejectingMilestone] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleVerifyPackage = async (cid: string) => {
    setFetchingManifest(true);
    try {
      const res = await fetch(`https://white-changing-swordfish-666.mypinata.cloud/ipfs/${cid}`);
      if (!res.ok) throw new Error("Could not reach IPFS gateway");
      const data = await res.json();
      setInspectingManifest(data);
    } catch (err) {
      toast.error("Failed to fetch manifest from IPFS");
    } finally {
      setFetchingManifest(false);
    }
  };

  const processReview = async (m: any, decision: 'approve' | 'reject', reason?: string) => {
    setLoadingId(m.id);
    try {
      const res = await fetch("/api/admin/milestones/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          milestoneId: m.id, 
          campaignId: m.campaign_id, 
          decision,
          rejectionReason: reason 
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Processing failed");
      }
      
      const result = await res.json();
      
      if (decision === 'approve') {
        toast.success(`✅ Approved! RM ${result.amountReleased?.toFixed(2) || 0} released to NGO`);
      } else {
        toast.success("Proof rejected - NGO notified");
      }
      
      setReviews(prev => prev.filter(item => item.id !== m.id));
      setRejectingMilestone(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
          <div className="bg-green-50 p-4 rounded-full mb-4">
            <ClipboardCheck className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500 max-w-xs text-center mt-2">
            There are no milestones currently pending review. 
          </p>
        </div>
      ) : (
        reviews.map((r) => {
          const escrowAmount = Number(r.campaigns?.escrow_balance) || 0;
          const milestoneTarget = Number(r.target_amount) || 0;
          const campaignCollected = Number(r.campaigns?.collected_amount) || 0;
          const pendingRelease = escrowAmount;
          
          // ⭐ Calculate time since submission
          const submittedAt = r.submission_date || r.proof_submitted_at;
          const timeSinceSubmission = submittedAt 
            ? formatDistanceToNow(new Date(submittedAt), { addSuffix: true })
            : 'Unknown';
          
          // ⭐ Check if submission is urgent (>3 days old)
          const isUrgent = submittedAt 
            ? new Date().getTime() - new Date(submittedAt).getTime() > 3 * 24 * 60 * 60 * 1000
            : false;

          return (
            <div 
              key={r.id} 
              className={`bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                isUrgent ? 'ring-2 ring-orange-200 border-orange-300' : ''
              }`}
            >
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                        {/* ⭐ Urgency Badge */}
                        {isUrgent && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200 animate-pulse">
                            <AlertTriangle size={12} /> Waiting {timeSinceSubmission}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        NGO: {r.campaigns?.ngo_name} • Phase {r.milestone_index + 1}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> Submitted {timeSinceSubmission}
                      </p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escrow Status</span>
                        <p className="text-xs text-orange-600 font-medium">
                          RM {escrowAmount.toLocaleString()} in Escrow
                        </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Progress Report</p>
                    <p className="italic text-sm text-gray-700">{r.proof_description || "No description provided"}</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="bg-blue-600 p-2 rounded-md">
                      <Box size={18} className="text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">IPFS Truth Anchor</p>
                      <p className="text-xs text-blue-600 font-mono truncate">{r.ipfs_cid}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleVerifyPackage(r.ipfs_cid)}
                      disabled={fetchingManifest}
                      className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
                    >
                      {fetchingManifest ? <Loader2 size={14} className="animate-spin" /> : "Verify Package"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Activity Photos</h4>
                    {r.proof_images && r.proof_images.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {r.proof_images.map((img: string, i: number) => (
                          <a key={i} href={img} target="_blank" className="relative aspect-square rounded border overflow-hidden bg-gray-200 hover:ring-2 ring-blue-400 transition-all">
                            <Image src={img} alt="proof" fill className="object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No photos provided</p>
                    )}
                  </div>

                  {r.proof_invoices && r.proof_invoices.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <FileText size={14} className="text-green-600" /> Financial Documents
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {r.proof_invoices.map((url: string, i: number) => (
                                <a 
                                    key={i} href={url} target="_blank" 
                                    className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:bg-green-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={14} className="text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700 truncate">invoice_{i+1}.pdf</span>
                                    </div>
                                    <ExternalLink size={12} className="text-gray-400 group-hover:text-green-600" />
                                </a>
                            ))}
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center space-y-4 border-l pl-8 bg-gray-50/30 p-4 rounded-r-xl">
                  <div className="text-center pb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Release Amount</p>
                    <p className="text-3xl font-black text-green-600">
                      RM {pendingRelease.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Target: RM {milestoneTarget.toLocaleString()} / Collected: RM {campaignCollected.toLocaleString()}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => processReview(r, 'approve')} 
                    disabled={!!loadingId}
                    className="bg-green-600 hover:bg-green-700 text-white h-14 font-bold shadow-lg"
                  >
                    {loadingId === r.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" /> Approve & Release
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setRejectingMilestone(r)}
                    disabled={!!loadingId}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject Proof
                  </Button>

                  <div className="pt-4 mt-4 border-t border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400">
                      Approval triggers blockchain tx and Stripe transfer instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* --- REJECTION MODAL --- */}
      <Dialog open={!!rejectingMilestone} onOpenChange={() => {
        setRejectingMilestone(null);
        setRejectionReason("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Milestone Proof</DialogTitle>
            <DialogDescription>
              Provide feedback to help the NGO improve their submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="e.g., Photos are unclear, missing invoices, insufficient documentation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
              <AlertTriangle size={16} className="text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                The NGO will be notified and can resubmit improved evidence. 
                Escrowed funds remain locked until approval.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingMilestone(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!rejectionReason.trim()) {
                  toast.error("Please provide a reason for rejection");
                  return;
                }
                processReview(rejectingMilestone, 'reject', rejectionReason);
              }}
              disabled={!rejectionReason.trim() || !!loadingId}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingId ? <Loader2 className="animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MANIFEST INSPECTOR MODAL --- */}
      <Dialog open={!!inspectingManifest} onOpenChange={() => setInspectingManifest(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="text-blue-600" />
                IPFS Manifest Verified
            </DialogTitle>
            <DialogDescription>
                Direct data fetch from decentralized storage. This package cannot be altered.
            </DialogDescription>
          </DialogHeader>

          {inspectingManifest && (
            <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <span className="text-gray-400 block uppercase font-bold tracking-tighter">Milestone ID</span>
                        <span className="font-mono text-gray-700 truncate block">{inspectingManifest.milestone_id}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block uppercase font-bold tracking-tighter">Timestamp</span>
                        <span className="text-gray-700 block">{new Date(inspectingManifest.created_at).toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900">Package Contents</h4>
                    <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {inspectingManifest.files?.map((file: any, idx: number) => (
                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    {file.file_type === 'invoice' ? (
                                      <FileText size={16} className="text-green-600" />
                                    ) : (
                                      <Search size={16} className="text-blue-600" />
                                    )}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">{file.filename || `Evidence_${idx + 1}`}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{file.cid.slice(0, 20)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">
                                      {file.file_type}
                                    </span>
                                    <a href={file.url} target="_blank" className="text-blue-600 hover:text-blue-800">
                                      <ChevronRight size={18}/>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        This manifest acts as the <strong>Truth Anchor</strong>. The CID stored in the database matches the content of this JSON, ensuring the NGO cannot alter evidence after submission.
                    </p>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}