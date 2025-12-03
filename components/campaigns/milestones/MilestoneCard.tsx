"use client";

import Image from "next/image";
import { 
  CheckCircle2, Lock, Clock, AlertCircle, ChevronDown, 
  Camera, FileText, TrendingUp, Target, Download, ShieldCheck
} from "lucide-react";

// --- Types ---
export interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'pending_review' | 'approved' | 'rejected';
  funds_allocated_percent: number;
  target_amount: number;
  proof_description?: string;
  proof_images?: string[];
  proof_invoices?: string[];
}

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
  const isLocked = ms.status === 'locked';
  const isApproved = ms.status === 'approved';
  const isUnderReview = ms.status === 'pending_review';

  // Privacy Check: Only show proof details if approved
  const showProofContent = isApproved;

  // Dynamic Styles Logic
  let statusColor = "bg-gray-100 text-gray-500 border-gray-200";
  let StatusIcon = Lock;
  let statusLabel = "Locked";

  if (isApproved) {
    statusColor = "bg-green-100 text-green-700 border-green-200";
    StatusIcon = CheckCircle2;
    statusLabel = "Completed";
  } else if (ms.status === 'active') {
    statusColor = "bg-blue-100 text-blue-700 border-blue-200";
    StatusIcon = Clock;
    statusLabel = "In Progress";
  } else if (isUnderReview) {
    statusColor = "bg-orange-100 text-orange-700 border-orange-200";
    StatusIcon = AlertCircle;
    statusLabel = "Under Audit";
  } else if (ms.status === 'rejected') {
    statusColor = "bg-red-100 text-red-700 border-red-200";
    StatusIcon = AlertCircle;
    statusLabel = "Revision Needed";
  }

  return (
    <div className="relative pl-0 md:pl-16 group">
      
      {/* Timeline Dot */}
      <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 hidden md:block transition-colors duration-300 ${
          isApproved ? 'bg-green-500' : (ms.status === 'active' ? 'bg-blue-500' : 'bg-gray-300')
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
                
                {/* A. Planned Objectives */}
                <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                        <Target size={14} /> Planned Objectives
                    </h5>
                    <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 border rounded-lg">
                        {ms.description}
                    </p>
                </div>

                {/* B. Progress Report (PRIVACY PROTECTED) */}
                <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className={isLocked ? "text-gray-400" : "text-blue-500"}/> Progress Report
                    </h5>
                    
                    {isLocked ? (
                      <div className="text-xs text-gray-400 italic pl-1 flex items-center gap-2">
                          <Lock size={12} /> Pending start of this phase.
                      </div>
                    ) : showProofContent && ms.proof_description ? (
                      // 1. Show Proof (Approved)
                      <div className="relative">
                        <p className="text-blue-900 text-sm leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 animate-in fade-in">
                            {ms.proof_description}
                        </p>
                      </div>
                    ) : isUnderReview ? (
                      // 2. Show Placeholder (Under Review)
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex items-center gap-3">
                         <div className="bg-orange-100 p-2 rounded-full">
                            <Clock className="text-orange-600 w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-orange-800">Evidence Submitted</p>
                            <p className="text-xs text-orange-600">The NGO has submitted proof of work. It is currently being audited by WheresTheFund admins.</p>
                         </div>
                      </div>
                    ) : (
                      // 3. No Update Yet
                      <div className="text-xs text-gray-400 italic pl-1">
                        No written update provided yet.
                      </div>
                    )}
                </div>

                {/* C. Gallery (PRIVACY PROTECTED) */}
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
                    ) : isUnderReview && ms.proof_images && ms.proof_images.length > 0 ? (
                        // Hidden Gallery Placeholder
                        <div className="border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <Camera size={24} className="text-orange-300 mb-2" />
                            <span className="text-sm font-medium text-orange-700">Photos under review</span>
                            <span className="text-xs text-orange-500">{ms.proof_images.length} image(s) hidden until approved</span>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                <Camera size={20} className="text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">No photos visible</span>
                        </div>
                    )}
                </div>

                {/* D. Financials (PRIVACY PROTECTED) */}
                <div>
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
                                        {`Verified_Invoice_${i + 1}`}
                                    </span>
                                </div>
                                <Download size={16} className="text-gray-400 group-hover/file:text-green-600 transition-colors" />
                            </a>
                          ))}
                      </div>
                    ) : isUnderReview && ms.proof_invoices && ms.proof_invoices.length > 0 ? (
                        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={20} className="text-orange-500" />
                            </div>
                            <div className="text-sm text-orange-800">
                                <span className="font-semibold">Financials Locked.</span> Auditing {ms.proof_invoices.length} document(s).
                            </div>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white flex items-center gap-4 opacity-70">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={24} className="text-gray-300" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="h-2.5 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                            </div>
                            <div className="text-xs text-gray-400 italic px-2 whitespace-nowrap">
                                Awaiting Records
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}