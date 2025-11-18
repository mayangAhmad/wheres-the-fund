// hooks/useCampaigns.ts

import { useContext, useMemo } from 'react'
import { CampaignsContext, Campaign } from '@/context/CampaignsContext' // Adjust the import path

// The hook now accepts an optional filter string
export const useCampaigns = (categoryFilter?: string) => {
  const context = useContext(CampaignsContext)

  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider')
  }

  const { campaigns, loading, refetch } = context
  
  // 🌟 Best Practice: Use useMemo to filter the list only when 
  // the global campaigns list or the category filter changes.
  const filteredCampaigns = useMemo(() => {
    if (!categoryFilter) {
      return campaigns
    }
    
    // Apply the local filter logic. 
    // We trim and lowercase both values for a more robust match.
    const normalizedFilter = categoryFilter.trim().toLowerCase()

    return campaigns.filter(campaign => 
      campaign.category?.trim().toLowerCase() === normalizedFilter
    )
    
  }, [campaigns, categoryFilter])


  return { campaigns: filteredCampaigns, loading, refetch }
}