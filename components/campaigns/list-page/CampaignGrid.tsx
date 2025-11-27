'use client'

import { useFilteredCampaigns } from '@/hooks/useFilteredCampaigns' 
import { Skeleton } from "@/components/ui/skeleton"
import CampaignCard from '@/components/campaigns/CampaignCard' 
import { Campaign } from '@/context/CampaignsContext'

interface CampaignGridProps {
  filterStatus: string
  filterCategory: string 
  searchTerm: string
}

// Reusable Grid Class to ensure Skeleton and Content match exactly
const gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-8"

function CampaignGridSkeleton() {
  return (
    <div className={gridClassName}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col h-full border border-gray-100">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-3">
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
            <div className="pt-4">
               <Skeleton className="w-full h-2 rounded-full" />
            </div>
            <Skeleton className="w-full h-10 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CampaignGrid({
  filterStatus,
  filterCategory,
  searchTerm,
}: CampaignGridProps) {
  
  const { filteredCampaigns, loading } = useFilteredCampaigns({
    filterStatus,
    filterCategory,
    searchTerm,
  });

  if (loading) {
    return <CampaignGridSkeleton />
  }

  if (filteredCampaigns.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-lg">No campaigns found matching your criteria.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-orange-600 hover:underline text-sm"
        >
          Clear filters
        </button>
      </div>
    )
  }
  
  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {filterCategory === 'All Campaigns' ? 'All Campaigns' : `${filterCategory} Campaigns`}
        </h2>
        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
          {filteredCampaigns.length} Results
        </span>
      </div>

      {/* SNAP GRID: Uses standard breakpoints for smooth transitions */}
      <div className={gridClassName}>
        {filteredCampaigns.map((campaign: Campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  )
}