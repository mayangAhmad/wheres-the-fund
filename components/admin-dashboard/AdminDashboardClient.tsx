"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 
import Image from "next/image";
import type { AdminDashboardClientProps, MilestoneReview } from "@/types/dashboard";


export default function AdminDashboardClient({ initialReviews }: AdminDashboardClientProps) {
  const [reviews, setReviews] = useState<MilestoneReview[]>(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDecision = async (milestone: MilestoneReview, decision: 'approve' | 'reject') => {
    const action = decision === 'approve' ? "Release funds" : "Reject proof";
    if (!confirm(`${action}?`)) return;

    setProcessingId(milestone.id);
    const toastId = toast.loading("Processing...");

    try {
        const res = await fetch("/api/admin/milestones/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                milestoneId: milestone.id, 
                campaignId: milestone.campaign_id,
                decision: decision 
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        toast.dismiss(toastId);
        toast.success(decision === 'approve' ? "Funds Released!" : "Proof Rejected");
        
        // Remove item from UI instantly
        setReviews(prev => prev.filter(r => r.id !== milestone.id));

    } catch (error) {
        toast.dismiss(toastId);
        const message = error instanceof Error ? error.message : "An error occurred";
        toast.error(message);
    }
}


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <p className="text-gray-500">Review proofs and authorize payouts.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm font-medium">
                Pending Reviews: <span className="text-orange-600 font-bold ml-1">{reviews.length}</span>
            </div>
        </div>
      
        <div className="space-y-6">
            {reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">No milestones pending review.</p>
                </div>
            ) : (
                reviews.map((r) => {
                    const pendingAmount = Number(r.campaigns?.escrow_balance || 0);

                    return (
                        <div key={r.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-orange-50/50 border-b px-6 py-3 flex justify-between items-center">
                                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle size={14} /> Reviewing Phase {r.milestone_index + 1}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: {r.id.slice(0,8)}</span>
                            </div>

                            <div className="p-6 flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{r.title}</h3>
                                        <p className="text-sm text-gray-500">Campaign: <span className="font-semibold text-gray-700">{r.campaigns?.title}</span></p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Submitted Proof</h4>
                                        <p className="text-sm text-gray-800 italic mb-4">"{r.proof_description}"</p>
                                        
                                        {/* Images */}
                                        {r.proof_images && r.proof_images.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2">
                                                {r.proof_images.map((img: string, i: number) => (
                                                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block relative aspect-square border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                                                        <Image src={img} alt="proof" fill className="object-cover" />
                                                        <ExternalLink className="absolute bottom-1 right-1 text-white drop-shadow-md" size={12} />
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-red-500 flex items-center gap-1">
                                                <XCircle size={12} /> No images provided.
                                            </div>
                                        )}
                                        
                                        {/* Invoices */}
                                         {r.proof_invoices && r.proof_invoices.length > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Documents</h4>
                                                 <div className="flex flex-col gap-1">
                                                    {r.proof_invoices.map((pdf: string, i: number) => (
                                                        <a key={i} href={pdf} target="_blank" className="text-sm text-blue-600 underline flex items-center gap-1 hover:text-blue-800">
                                                            <ExternalLink size={12} /> View Invoice {i+1}
                                                        </a>
                                                    ))}
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:w-72 flex flex-col justify-center border-l lg:pl-8 border-gray-100">
                                    <div className="mb-6">
                                        <div className="text-xs text-gray-500 uppercase font-semibold">Funds in Escrow</div>
                                        <div className="text-3xl font-bold text-green-600 tracking-tight">
                                            RM {pendingAmount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Will be transferred to {r.campaigns?.ngo_name}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Button 
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 shadow-sm"
                                            onClick={() => handleDecision(r, 'approve')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === r.id ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                            ) : (
                                                <><CheckCircle className="mr-2 h-4 w-4" /> Approve & Pay</>
                                            )}
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" size="sm" 
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => handleDecision(r, 'reject')}
                                            disabled={!!processingId}
                                        >
                                            Reject (Request Changes)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}