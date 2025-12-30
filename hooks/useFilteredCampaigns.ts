import { useMemo } from 'react'
import { useCampaigns } from './useCampaigns'
import { Campaign } from '@/types/ngo';

interface FilterParams {
  filterStatus: string // From UI: 'All Status', 'Ongoing', 'Completed'
  filterCategory: string 
  searchTerm: string 
}

export const useFilteredCampaigns = ({ filterStatus, filterCategory, searchTerm }: FilterParams) => {
  const { campaigns: allCampaigns, loading, refetch } = useCampaigns()
  
  const filteredCampaigns = useMemo(() => {
    let result: Campaign[] = allCampaigns

    // 1. Status Filter - Mapping UI to DB Enums
    if (filterStatus !== 'All Status') {
      result = result.filter(c => {
        if (filterStatus === 'Ongoing') {
          return c.status === 'Ongoing';
        }
        
        if (filterStatus === 'Completed') {
          return c.status === 'Completed' || c.status === 'Closed';
        }
        
        return false;
      });
    }

    // 2. Category Filter (Case-insensitive)
    if (filterCategory !== 'All Campaigns') {
      const categoryValue = filterCategory.toLowerCase()
      result = result.filter(c => c.category?.toLowerCase() === categoryValue)
    }

    // 3. Search Filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.ngo_name?.toLowerCase().includes(search)
      )
    }

    return result
  }, [allCampaigns, filterStatus, filterCategory, searchTerm])

  return { filteredCampaigns, loading, refetch }
}