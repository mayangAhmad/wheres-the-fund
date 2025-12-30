"use client";

import { useState } from "react";
import { 
  CheckCircle, XCircle, ExternalLink, Box, 
  ShieldCheck, Loader2, FileText, Search, 
  ChevronRight, Info, X, ClipboardCheck
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminDashboardClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [inspectingManifest, setInspectingManifest] = useState<any>(null);
  const [fetchingManifest, setFetchingManifest] = useState(false);

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

  const processReview = async (m: any, decision: 'approve' | 'reject') => {
    setLoadingId(m.id);
    try {
      const res = await fetch("/api/admin/milestones/review", {
        method: "POST",
        body: JSON.stringify({ milestoneId: m.id, campaignId: m.campaign_id, decision })
      });
      if (!res.ok) throw new Error("Processing failed");
      
      toast.success(decision === 'approve' ? "Funds Released!" : "Proof Rejected");
      setReviews(prev => prev.filter(item => item.id !== m.id));
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
          // 💡 DYNAMIC CALCULATION FOR SPILLOVER RELEASE
          // Logic: Pending Release is the Escrowed balance tied to this milestone cycle.
          const escrowAmount = Number(r.campaigns?.escrow_balance) || 0;
          const milestoneTarget = Number(r.target_amount) || 0;
          const campaignCollected = Number(r.campaigns?.collected_amount) || 0;

          // For your scenario: Donor paid 3k, Milestone Cap 2k. 
          // 2k was released immediately. 1k is in escrow.
          // pendingRelease should show 1,000.
          const pendingRelease = escrowAmount;

          return (
            <div key={r.id} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                      <p className="text-sm text-gray-500">NGO: {r.campaigns?.ngo_name}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escrow Logic</span>
                        <p className="text-xs text-orange-600 font-medium">
                          RM {escrowAmount.toLocaleString()} Spillover Held
                        </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border italic text-sm text-gray-700">
                    "{r.proof_description}"
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
                    <div className="grid grid-cols-4 gap-2">
                        {r.proof_images?.map((img: string, i: number) => (
                        <a key={i} href={img} target="_blank" className="relative aspect-square rounded border overflow-hidden bg-gray-200 hover:ring-2 ring-blue-400 transition-all">
                            <Image src={img} alt="proof" fill className="object-cover" />
                        </a>
                        ))}
                    </div>
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
                                        <span className="text-xs font-medium text-gray-700 truncate">invoice_release_{i+1}.pdf</span>
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
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Release Amount</p>
                    {/* ✅ CORRECTED: Now shows exactly the Escrowed Spillover (e.g., RM 1,000) */}
                    <p className="text-3xl font-black text-green-600">
                      RM {pendingRelease.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Milestone Cap: RM {milestoneTarget.toLocaleString()} / Total: RM {campaignCollected.toLocaleString()}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => processReview(r, 'approve')} 
                    disabled={!!loadingId}
                    className="bg-orange-600 hover:bg-orange-700 text-white h-14 font-bold shadow-lg"
                  >
                    {loadingId === r.id ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2 h-5 w-5" /> Approve & Payout</>}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => processReview(r, 'reject')}
                    disabled={!!loadingId}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject Proof
                  </Button>

                  <div className="pt-4 mt-4 border-t border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400">Approval triggers Quorum Smart Contract and Stripe Transfer instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* --- MANIFEST INSPECTOR MODAL --- */}
      <Dialog open={!!inspectingManifest} onOpenChange={() => setInspectingManifest(null)}>
        <DialogContent className="max-w-2xl">
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
                    <h4 className="text-sm font-bold text-gray-900">File Package Contents</h4>
                    <div className="border rounded-lg divide-y">
                        {inspectingManifest.files?.map((file: any, idx: number) => (
                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    {file.file_type === 'invoice' ? <FileText size={16} className="text-green-600" /> : <Search size={16} className="text-blue-600" />}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">{file.filename || `Evidence_${idx + 1}`}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{file.cid.slice(0, 20)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{file.file_type}</span>
                                    <a href={file.url} target="_blank" className="text-blue-600 hover:text-blue-800"><ChevronRight size={18}/></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        This manifest acts as the <strong>Truth Anchor</strong>. The CID stored in the database matches the content of this JSON file, ensuring the NGO cannot change evidence after submission.
                    </p>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}