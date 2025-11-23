// components/campaigns/CampaignGrid.tsx

'use client'

import { useFilteredCampaigns } from '@/hooks/useFilteredCampaigns' 
import { Skeleton } from "@/components/ui/skeleton"
import CampaignCard from '@/components/campaigns/CampaignCard' 
import { Campaign } from '@/context/CampaignsContext'

interface CampaignGridProps {
  filterStatus: string
  filterCategory: string // Mapped Supabase value ('standard', 'disaster', or 'All Campaigns')
  searchTerm: string
}

function CampaignGridSkeleton() {
  return (
    <div className="py-16 px-6 md:px-16 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto grid gap-6 
        grid-cols-1 
        sm:grid-cols-[repeat(2,minmax(280px,1fr))] 
        md:grid-cols-[repeat(3,minmax(280px,1fr))] 
        lg:grid-cols-[repeat(4,minmax(280px,1fr))]">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
            <Skeleton className="w-full h-40 mb-4" />
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-1/2 h-4 mb-4" />
            <Skeleton className="w-full h-2 mb-1" />
            <Skeleton className="w-full h-2 mb-4" />
            <Skeleton className="w-full h-10 mt-4" />
          </div>
        ))}
      </div>
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
      <div className="px-6 md:px-16 lg:px-20 py-10 text-center text-gray-500">
        No campaigns found matching your criteria.
      </div>
    )
  }
  
return (
  <div className="py-16 px-6 md:px-16 lg:px-20 bg-white">
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {filterCategory === 'All Campaigns' ? 'All Campaigns' : filterCategory}
        </h2>
      </div>

      {/* Responsive grid: 1 → 2 → 3 → 4 columns */}
      <div className="grid gap-6 
        grid-cols-1 
        sm:grid-cols-[repeat(2,minmax(280px,1fr))] 
        md:grid-cols-[repeat(3,minmax(280px,1fr))] 
        lg:grid-cols-[repeat(4,minmax(280px,1fr))]">
        {filteredCampaigns.map((campaign: Campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  </div>
)

}
