//context/CampaignsContext.tsx

'use client'
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import createClient from '@/lib/supabase/client'

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
  campaigns: Campaign[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchAllOngoingCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'Ongoing')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAllOngoingCampaigns();

    const channel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          // ✅ Selective updates instead of full refetch
          if (payload.eventType === 'INSERT') {
            const newCampaign = payload.new as Campaign;
            if (newCampaign.status === 'Ongoing') {
              setCampaigns(prev => [newCampaign, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCampaign = payload.new as Campaign;
            setCampaigns(prev =>
              prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
                .filter(c => c.status === 'Ongoing')
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setCampaigns(prev => prev.filter(c => c.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllOngoingCampaigns, supabase]);

  const contextValue = useMemo(() => ({
    campaigns,
    loading,
    refetch: fetchAllOngoingCampaigns,
  }), [campaigns, loading, fetchAllOngoingCampaigns]);

  return (
    <CampaignsContext.Provider value={contextValue}>
      {children}
    </CampaignsContext.Provider>
  );
};