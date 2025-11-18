// components/campaigns/CampaignGrid.tsx

'use client'

import React from 'react' // Import React for use in FC
import Image from 'next/image' // Still needed for the Skeleton component
import Link from 'next/link' // No longer needed here, Link is inside CampaignCard
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
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

// ❌ REMOVED: The redundant getDaysLeft helper function

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

  if (filteredCampaigns.length === 0)
    return <div className="px-6 md:px-16 lg:px-20 py-10 text-center text-gray-500">No campaigns found matching your criteria.</div>

  return (
    <section className="py-16 px-6 md:px-16 lg:px-20 bg-white">
      <div className="max-w-[90rem] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filterCategory === 'All Campaigns' ? 'All Campaigns' : filterCategory}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCampaigns.map((campaign: Campaign) => {
            // ❌ REMOVED: All redundant calculation logic (collected, goal, progress, daysLeft)
            
            // 🌟 FIX 3: REPLACE the entire large div block with the reusable component!
            return (
              <CampaignCard key={campaign.id} campaign={campaign} />
            )
          })}
        </div>
      </div>
    </section>
  )
}