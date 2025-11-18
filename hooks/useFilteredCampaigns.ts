// hooks/useFilteredCampaigns.ts

import { useMemo } from 'react'
import { useCampaigns } from './useCampaigns' // Import the consumer hook
import { Campaign } from '@/context/CampaignsContext'

interface FilterParams {
  filterStatus: string // 'All Status', 'Ongoing', 'Completed'
  filterCategory: string // 'All Campaigns', 'standard', 'disaster'
  searchTerm: string // Debounced search term
}

// 🌟 New dedicated hook
export const useFilteredCampaigns = ({ filterStatus, filterCategory, searchTerm }: FilterParams) => {
  // Use the global context hook (which contains ALL ongoing campaigns)
  const { campaigns: allOngoingCampaigns, loading, refetch } = useCampaigns()
  
  // Use useMemo to re-filter the list only when the inputs change
  const filteredCampaigns = useMemo(() => {
    let result: Campaign[] = allOngoingCampaigns

    // 1. Apply Status Filter
    if (filterStatus !== 'All Status') {
      // 🌟 Best Practice: Normalize status for consistent filtering
      const statusValue = filterStatus.toLowerCase() 
      result = result.filter(c => c.status?.toLowerCase() === statusValue)
    }

    // 2. Apply Category Filter
    if (filterCategory !== 'All Campaigns') {
      const categoryValue = filterCategory.toLowerCase()
      result = result.filter(c => c.category?.toLowerCase() === categoryValue)
    }

    // 3. Apply Search Term Filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      result = result.filter(c => 
        // Search by title OR NGO name
        c.title.toLowerCase().includes(lowerCaseSearch) ||
        c.ngo_name?.toLowerCase().includes(lowerCaseSearch)
      )
    }

    // Note: Since allOngoingCampaigns are already sorted by 'created_at' from the Provider,
    // we don't need to re-sort here.

    return result
  }, [allOngoingCampaigns, filterStatus, filterCategory, searchTerm])

  return { filteredCampaigns, loading, refetch }
}