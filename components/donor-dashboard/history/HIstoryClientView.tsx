"use client";

import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import HistoryTable from "./HistoryTable";

export interface DonationRecord {
  id: string;
  amount: number;
  status: string | null; 
  created_at: string;
  on_chain_tx_hash: string | null; 
  campaigns: {
    title: string;
    id: string;
  } | null;
}

interface HistoryClientViewProps {
  initialDonations: any[]; 
}

export default function HistoryClientView({ initialDonations }: HistoryClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredDonations = initialDonations.filter((donation: DonationRecord) => {
    // 1. Search Logic
    const campaignTitle = donation.campaigns?.title || "Unknown Campaign";
    const matchesSearch = campaignTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Logic (Case Insensitive Fix)
    // We normalize everything to lowercase for comparison
    const dbStatus = (donation.status || "processing").toLowerCase();
    
    let matchesStatus = true;
    if (filterStatus !== "all") {
        // If filter is 'processing', match 'processing' OR 'pending'
        if (filterStatus === "processing") {
            matchesStatus = dbStatus === "processing" || dbStatus === "pending";
        } else {
            matchesStatus = dbStatus === filterStatus;
        }
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your impact and blockchain verification.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors opacity-50 cursor-not-allowed" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <HistoryTable donations={filteredDonations} mode="donor"/>
    </div>
  );
}