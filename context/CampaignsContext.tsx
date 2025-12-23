'use client'
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import createClient from '@/lib/supabase/client'

// 🌟 Use a specific type for the Enum to prevent typos
export type CampaignStatus = 'Ongoing' | 'Completed' | 'Closed' | 'Creating' | 'Failed' | 'Expired';

export type Campaign = {
  id: string
  ngo_name: string | null
  title: string
  description: string | null
  category: string | null
  image_url: string | null
  goal_amount: number
  collected_amount: number
  status: CampaignStatus | null
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

  // ✅ These are the statuses we want to show on the public browse page
  const VISIBLE_STATUSES: CampaignStatus[] = ['Ongoing', 'Completed', 'Closed'];

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .in('status', VISIBLE_STATUSES) 
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
    fetchCampaigns();

    const channel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCampaign = payload.new as Campaign;
            if (VISIBLE_STATUSES.includes(newCampaign.status as CampaignStatus)) {
              setCampaigns(prev => [newCampaign, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCampaign = payload.new as Campaign;
            setCampaigns(prev =>
              prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
                .filter(c => VISIBLE_STATUSES.includes(c.status as CampaignStatus))
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
  }, [fetchCampaigns, supabase]);

  const contextValue = useMemo(() => ({
    campaigns,
    loading,
    refetch: fetchCampaigns,
  }), [campaigns, loading, fetchCampaigns]);

  return (
    <CampaignsContext.Provider value={contextValue}>
      {children}
    </CampaignsContext.Provider>
  );
};