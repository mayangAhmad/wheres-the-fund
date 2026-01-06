"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  CheckCircle2, Lock, Clock, AlertCircle, ChevronDown, 
  Camera, FileText, TrendingUp, Target, Download, ShieldCheck,
  ExternalLink, XCircle
} from "lucide-react";
import { Milestone } from "@/types/ngo";
import AuditManifestModal from "./AuditManifestModal";
import { formatDistanceToNow } from 'date-fns';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function MilestoneCard({ milestone: ms, index, isOpen, onToggle }: MilestoneCardProps) {
  const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "http://localhost:8999";
  
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // ⭐ UPDATED STATUS LOGIC
  const isLocked = ms.status === 'locked';
  const isActive = ms.status === 'active';
  const isPendingProof = ms.status === 'pending_proof';
  const isPendingReview = ms.status === 'pending_review';
  const isApproved = ms.status === 'approved';
  const isRejected = ms.status === 'rejected';
  const isFailedDeadline = ms.status === 'failed_deadline';

  const showProofContent = isApproved || isPendingReview; 

  // ⭐ UPDATED DYNAMIC STYLES
  let statusColor = "bg-gray-100 text-gray-500 border-gray-200";
  let StatusIcon = Lock;
  let statusLabel = "Locked";

  if (isApproved) {
    statusColor = "bg-green-100 text-green-700 border-green-200";
    StatusIcon = CheckCircle2;
    statusLabel = "Approved & Released"; 
  } else if (isActive) {
    statusColor = "bg-blue-100 text-blue-700 border-blue-200";
    StatusIcon = Clock;
    statusLabel = "Active - Collecting";
  } else if (isPendingProof) {
    statusColor = "bg-orange-50 text-orange-600 border-orange-200";
    StatusIcon = AlertCircle;
    statusLabel = "Awaiting NGO Proof";
  } else if (isPendingReview) {
    statusColor = "bg-purple-100 text-purple-700 border-purple-200"; 
    StatusIcon = Clock;
    statusLabel = "Under Admin Review";
  } else if (isRejected) {
    statusColor = "bg-red-100 text-red-700 border-red-200";
    StatusIcon = XCircle;
    statusLabel = "Proof Rejected";
  } else if (isFailedDeadline) {
    statusColor = "bg-red-200 text-red-900 border-red-300";
    StatusIcon = XCircle;
    statusLabel = "Deadline Missed";
  }

  return (
    <>
      <div className="relative pl-0 md:pl-16 group">
        
        {/* Timeline Dot */}
        <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 hidden md:block transition-colors duration-300 ${
            isApproved ? 'bg-green-500' : 
            isActive ? 'bg-blue-500 animate-pulse' : 
            isPendingProof || isPendingReview ? 'bg-orange-500' :
            isRejected || isFailedDeadline ? 'bg-red-500' :
            'bg-gray-300'
        }`} />

        {/* The Card */}
        <div className={`border rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300 ${
            isOpen ? 'ring-2 ring-orange-100 shadow-md scale-[1.01]' : 'hover:shadow-md'
          }`}
        >
          {/* HEADER (Clickable) */}
          <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Phase {index + 1}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 ${statusColor}`}>
                    <StatusIcon size={10} /> {statusLabel}
                </span>
              </div>
              <h4 className={`text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                {ms.title}
              </h4>
              
              {/* ⭐ Show deadline if pending proof */}
              {isPendingProof && ms.proof_deadline && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Deadline: {formatDistanceToNow(new Date(ms.proof_deadline), { addSuffix: true })}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Allocation</span>
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-sm font-bold text-gray-900">{ms.funds_allocated_percent}%</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm font-bold text-orange-600">{formatCurrency(ms.target_amount)}</span>
                    </div>
                </div>
                <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* EXPANDED BODY */}
          <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-8">
                  
                  {/* ⭐ DEADLINE WARNING (if pending proof and close to deadline) */}
                  {isPendingProof && ms.proof_deadline && (
                    <div className={`p-4 rounded-lg border ${
                      new Date(ms.proof_deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000) 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertCircle className={new Date(ms.proof_deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-red-600' : 'text-orange-600'} size={20} />
                        <div>
                          <p className="font-semibold text-sm">Proof Submission Required</p>
                          <p className="text-xs text-gray-600">
                            NGO must submit proof by {new Date(ms.proof_deadline).toLocaleDateString()} or account will be blocked
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⭐ REJECTION NOTICE */}
                  {isRejected && ms.auditor_remarks && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-semibold text-sm text-red-900">Proof Rejected</p>
                          <p className="text-xs text-red-700 mt-1">{ms.auditor_remarks}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⭐ DEADLINE FAILED NOTICE */}
                  {isFailedDeadline && (
                    <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                      <div className="flex items-start gap-3">
                        <XCircle className="text-red-800 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-bold text-sm text-red-900">Deadline Missed - Account Blocked</p>
                          <p className="text-xs text-red-800 mt-1">
                            NGO failed to submit proof within 5-day deadline. Campaign is suspended.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IPFS Audit Proof */}
                  {ms.ipfs_cid && (isPendingReview || isApproved) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <ShieldCheck className="text-green-600 w-5 h-5 shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Decentralized Audit Proof</p>
                        <p className="text-xs text-green-700 font-mono truncate">{ms.ipfs_cid}</p>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAuditModalOpen(true);
                        }}
                        className="text-[10px] bg-[#182F44] text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all font-bold whitespace-nowrap shadow-sm active:scale-95"
                      >
                        Verify Audit Manifest
                      </button>
                    </div>
                  )}

                  {/* A. Planned Objectives */}
                  <div>
                      <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                          <Target size={14} /> Planned Objectives
                      </h5>
                      <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 border rounded-lg">
                          {ms.description}
                      </p>
                  </div>

                  {/* B. Progress Report */}
                  <div>
                      <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                          <TrendingUp size={14} className={isLocked ? "text-gray-400" : "text-blue-500"}/> Progress Report
                      </h5>
                      
                      {isLocked ? (
                        <div className="text-xs text-gray-400 italic pl-1 flex items-center gap-2">
                            <Lock size={12} /> This phase is locked. Awaiting previous milestone completion.
                        </div>
                      ) : showProofContent && ms.proof_description ? (
                        <div className="relative">
                          <p className="text-blue-900 text-sm leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 animate-in fade-in">
                              {ms.proof_description}
                          </p>
                        </div>
                      ) : isPendingReview ? (
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-center gap-3">
                           <div className="bg-purple-100 p-2 rounded-full">
                              <Clock className="text-purple-600 w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-purple-800">Under Review</p>
                              <p className="text-xs text-purple-600">Proof submitted - awaiting admin approval</p>
                           </div>
                        </div>
                      ) : isPendingProof ? (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-center gap-3">
                           <div className="bg-orange-100 p-2 rounded-full">
                              <AlertCircle className="text-orange-600 w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-orange-800">Awaiting Proof Submission</p>
                              <p className="text-xs text-orange-600">NGO needs to upload evidence of completed work</p>
                           </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic pl-1">
                          No update provided yet.
                        </div>
                      )}
                  </div>

                  {/* C. Gallery */}
                  <div>
                      <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                          <Camera size={14} className="text-orange-500"/> Activity Gallery
                      </h5>
                      
                      {showProofContent && ms.proof_images && ms.proof_images.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {ms.proof_images.map((img, i) => (
                                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm group/img cursor-pointer hover:ring-2 ring-orange-200 transition-all">
                                      <Image src={img} alt={`Proof ${i}`} fill className="object-cover group-hover/img:scale-105 transition-transform duration-500" />
                                  </div>
                              ))}
                          </div>
                      ) : isPendingReview && ms.proof_images && ms.proof_images.length > 0 ? (
                          <div className="border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                              <Camera size={24} className="text-purple-300 mb-2" />
                              <span className="text-sm font-medium text-purple-700">Photos under review</span>
                              <span className="text-xs text-purple-500">{ms.proof_images.length} image(s) hidden until approved</span>
                          </div>
                      ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                  <Camera size={20} className="text-gray-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-500">No photos yet</span>
                          </div>
                      )}
                  </div>

                  {/* D. Financials */}
                  <div className={isApproved && ms.payout_tx_hash ? "mb-4" : ""}>
                      <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3">
                          <FileText size={14} className="text-green-600"/> Financial Records
                      </h5>
                      
                      {showProofContent && ms.proof_invoices && ms.proof_invoices.length > 0 ? (
                        <div className="space-y-2">
                            {ms.proof_invoices.map((inv, i) => (
                              <a key={i} href={inv} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors group/file">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="p-2 bg-green-50 text-green-600 rounded">
                                          <FileText size={18} />
                                      </div>
                                      <span className="text-sm font-medium text-gray-900 truncate">
                                          {`Invoice_${i + 1}.pdf`}
                                      </span>
                                  </div>
                                  <Download size={16} className="text-gray-400 group-hover/file:text-green-600 transition-colors" />
                              </a>
                            ))}
                        </div>
                      ) : isPendingReview && ms.proof_invoices && ms.proof_invoices.length > 0 ? (
                          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText size={20} className="text-purple-500" />
                              </div>
                              <div className="text-sm text-purple-800">
                                  <span className="font-semibold">Under Review.</span> Auditing {ms.proof_invoices.length} document(s).
                              </div>
                          </div>
                      ) : (
                          <div className="border border-gray-200 rounded-lg p-4 bg-white flex items-center gap-4 opacity-70">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText size={24} className="text-gray-300" />
                              </div>
                              <div className="text-xs text-gray-400 italic">
                                  Awaiting financial records
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Blockchain Audit Trail */}
                  {isApproved && ms.payout_tx_hash && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                       <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span>Blockchain Audit Trail</span>
                          <a 
                            href={`${explorerUrl}/tx/${ms.payout_tx_hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            View Transaction <ExternalLink size={10} />
                          </a>
                       </div>
                       <p className="text-[10px] font-mono text-gray-500 mt-1 truncate bg-gray-100 p-1.5 rounded border border-gray-200">
                          {ms.payout_tx_hash}
                       </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuditManifestModal 
        cid={ms.ipfs_cid || null}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
}