"use client";

import { useState } from "react";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { format } from "date-fns"; 
import StatusBadge from "./StatusBadge";
import { DonationRecord } from "./HIstoryClientView";
// 💡 Import your new Verification Modal
import VerificationModal from "./VerificationModal"; 

interface Props {
  donations: DonationRecord[];
  mode: "donor" | "campaign";
}

export default function HistoryTable({ donations, mode }: Props) {
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
  const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "http://localhost";

  if (donations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <FileText className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No donations found</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't made any donations matching these filters.</p>
      </div>
    );
  }

  const columnHeader = mode === "donor" ? "Campaign" : "Donor";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{columnHeader}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">On-Chain Proof</th>
              {/* 💡 New Column for Verification */}
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trace</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {format(new Date(donation.created_at), "MMM d, yyyy")}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {mode === "donor" ? (
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{donation.campaigns?.title || "N/A"}</div>
                      <div className="text-[10px] text-orange-600 font-bold uppercase">
                        Phase {donation.milestone_index + 1} Support
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {donation.id.slice(0, 8)}</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-900">Anonymous Donor</span>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {(donation as any).donor_id?.slice(0, 8)}</div>
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                  RM {Number(donation.amount).toLocaleString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <StatusBadge status={donation.status || "processing"} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {donation.on_chain_tx_hash ? (
                    <a
                      href={`${explorerUrl}/tx/${donation.on_chain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-mono text-xs"
                    >
                      {donation.on_chain_tx_hash.slice(0, 6)}...{donation.on_chain_tx_hash.slice(-4)}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-[10px] italic">Pending sync...</span>
                  )}
                </td>

                {/* 💡 Action Column: Verify Impact */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => setSelectedDonation(donation)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider hover:bg-orange-100 transition-colors"
                  >
                    <ShieldCheck size={12} />
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 💡 Verification Modal */}
      <VerificationModal 
        donation={selectedDonation} 
        isOpen={!!selectedDonation} 
        onClose={() => setSelectedDonation(null)} 
      />
    </div>
  );
}