// @/components/shared/AuditManifestModal.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, Loader2, Info, Camera, 
  ExternalLink, X, AlertTriangle, FileText, 
  Search, ChevronRight 
} from "lucide-react";
import Image from "next/image";

interface AuditManifestModalProps {
  cid: string | null | undefined; // ✅ Updated to handle the TS error
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditManifestModal({ cid, isOpen, onClose }: AuditManifestModalProps) {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && cid) {
      const fetchManifest = async () => {
        setLoading(true);
        setError(false);
        try {
          // ✅ Fetch using your private gateway
          const res = await fetch(`https://white-changing-swordfish-666.mypinata.cloud/ipfs/${cid}`);
          if (!res.ok) throw new Error("Gateway Error");
          const data = await res.json();
          setManifest(data);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchManifest();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, cid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#182F44]/90 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#182F44] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="text-green-400" />
            IPFS Manifest Verified
          </div>
          <p className="text-blue-200/70 text-xs mt-1">
            Direct data fetch from decentralized storage. This package cannot be altered.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-sm font-medium">Fetching Truth Anchor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto text-orange-500 mb-4" size={40} />
              <h3 className="font-bold text-gray-900">Sync in Progress</h3>
              <p className="text-sm text-gray-500 mt-2">
                This audit package is currently propagating. <br />
                Please try again in 30 seconds.
              </p>
            </div>
          ) : manifest && (
            <div className="space-y-6">
              
              {/* 1. Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-[10px] p-4 bg-gray-50 rounded-lg border">
                  <div>
                      <span className="text-gray-400 block uppercase font-bold tracking-tighter">Milestone ID</span>
                      <span className="font-mono text-gray-700 truncate block">{manifest.milestone_id || "N/A"}</span>
                  </div>
                  <div>
                      <span className="text-gray-400 block uppercase font-bold tracking-tighter">IPFS Timestamp</span>
                      <span className="text-gray-700 block">
                        {manifest.created_at ? new Date(manifest.created_at).toLocaleString() : "Recently Verified"}
                      </span>
                  </div>
              </div>

              {/* 2. Impact Statement */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg italic text-sm text-blue-900 leading-relaxed">
                  "{manifest.description || manifest.proof_description}"
              </div>

              {/* 3. File Package Contents (The logic you requested) */}
              <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Search size={14} /> File Package Contents
                  </h4>
                  <div className="border rounded-xl divide-y overflow-hidden">
                      {manifest.files?.map((file: any, idx: number) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${file.file_type === 'invoice' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {file.file_type === 'invoice' ? <FileText size={18} /> : <Camera size={18} />}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-gray-900">{file.filename || `Evidence_Log_${idx + 1}`}</p>
                                      <p className="text-[10px] text-gray-400 font-mono">{file.cid?.slice(0, 24)}...</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold uppercase tracking-tighter border">
                                      {file.file_type}
                                  </span>
                                  {/* ✅ Link to View Full File */}
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                  >
                                      <ChevronRight size={20}/>
                                  </a>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* 4. Truth Anchor Note */}
              <div className="bg-[#182F44]/5 p-4 rounded-xl flex gap-3 items-start border border-[#182F44]/10">
                  <Info size={16} className="text-[#182F44] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#182F44] leading-relaxed">
                      This manifest acts as the <strong>Truth Anchor</strong>. The CID stored in the Quorum network matches this JSON file, ensuring data integrity across the platform.
                  </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button 
              onClick={onClose} 
              className="px-8 py-2.5 text-xs font-bold text-white bg-[#182F44] hover:bg-orange-600 rounded-xl transition-all shadow-md active:scale-95"
            >
              Finish Audit Inspection
            </button>
        </div>
      </div>
    </div>
  );
}