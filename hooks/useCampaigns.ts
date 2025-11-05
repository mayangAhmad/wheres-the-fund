// hooks/useCampaigns.ts
import { useEffect, useState, useCallback } from 'react'
import createClient from '../lib/supabase/client'

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

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Wrap in useCallback to make it stable
  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'Ongoing')
      .order('created_at', { ascending: false })

    if (error) console.error('Fetch campaigns error:', error)
    else setCampaigns(data || [])

    setLoading(false)
  }, [supabase]) // <-- supabase is stable if your createClient returns the same client instance

  useEffect(() => {
    fetchCampaigns()

    const channel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          const newCampaign = payload.new as Campaign
          const oldCampaign = payload.old as Campaign | null

          switch (payload.eventType) {
            case 'INSERT':
              setCampaigns((prev) => [newCampaign, ...prev])
              break
            case 'UPDATE':
              setCampaigns((prev) =>
                prev.map((c) => (c.id === newCampaign.id ? newCampaign : c))
              )
              break
            case 'DELETE':
              if (oldCampaign)
                setCampaigns((prev) =>
                  prev.filter((c) => c.id !== oldCampaign.id)
                )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCampaigns, supabase]) // ✅ now dependencies are complete

  return { campaigns, loading, refetch: fetchCampaigns }
}
