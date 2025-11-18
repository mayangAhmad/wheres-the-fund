//context/CampaignsContext.tsx

'use client'
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import createClient from '@/lib/supabase/client'

// 1. Type Definitions
export type Campaign = {
  id: string
  ngo_name: string | null
  title: string
  description: string | null
  category: string | null
  image_url: string | null
  goal_amount: number
  collected_amount: number
  status: string | null
  end_date: string | null
  created_at: string | null
}

interface CampaignsContextType {
  campaigns: Campaign[] // This now holds ALL ongoing campaigns
  loading: boolean
  refetch: () => Promise<void>
}

// 2. Create the Context
export const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined)

// 3. The Provider Component
export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), []) // 🌟 Best Practice: Memoize client creation

  // Function to fetch all ongoing campaigns
  const fetchAllOngoingCampaigns = useCallback(async () => {
    setLoading(true)
    
    // 🌟 Fetches ALL ongoing campaigns, without category filter
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'Ongoing')
      .order('created_at', { ascending: false })

    if (error) console.error('Fetch campaigns error:', error)
    else setCampaigns(data || [])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // 1. Initial Data Fetch
    fetchAllOngoingCampaigns()

    // 2. Single Realtime Subscription
    const channel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          // 🌟 Best Practice: Re-fetch all data on ANY change to ensure consistency 
          // (especially with complex filtering/sorting that's now local to the provider).
          console.log('Realtime change detected, refetching all campaigns:', payload.eventType)
          fetchAllOngoingCampaigns()
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAllOngoingCampaigns, supabase])

  const contextValue = useMemo(() => ({
    campaigns,
    loading,
    refetch: fetchAllOngoingCampaigns,
  }), [campaigns, loading, fetchAllOngoingCampaigns])

  return (
    <CampaignsContext.Provider value={contextValue}>
      {children}
    </CampaignsContext.Provider>
  )
}