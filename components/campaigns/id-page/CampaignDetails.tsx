'use client';

import React, { useEffect, useState, useContext } from 'react';
import createClient from '@/lib/supabase/client';
import { CampaignsContext, Campaign } from '@/context/CampaignsContext';
import CampaignHeader from './CampaignHeader';
import CampaignTabs from './CampaignTabs';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface CampaignDetailsProps {
  id: string;
}

interface PicData {
  name: string;
  contact: string;
}

interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'pending_review' | 'approved' | 'rejected';
  funds_allocated_percent: number;
  target_amount: number;
}

interface ExtendedData {
  background: string | null;
  problems: string[] | null;
  solutions: string[] | null;
  contact_email: string | null;
  contact_phone: string | null;
  campaign_address: string | null;
  pic1: PicData | null;
  pic2: PicData | null;
  milestones: Milestone[];
  // Note: We removed milestones from here because it's now a separate table
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ id }) => {
  const campaignsContext = useContext(CampaignsContext);

  if (!campaignsContext) {
    throw new Error('CampaignDetails must be used within a CampaignsProvider');
  }

  const router = useRouter();
  const { campaigns, loading: contextLoading } = campaignsContext;

  const [basicInfo, setBasicInfo] = useState<Campaign | null>(null);
  const [extendedInfo, setExtendedInfo] = useState<ExtendedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      const supabase = createClient();

      // 1. Basic Info (Try from Context first, then fetch)
      let currentBasic = campaigns.find((c) => String(c.id) === String(id));
      
      if (!currentBasic) {
        const { data: fetchedBasic } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchedBasic) currentBasic = fetchedBasic;
      }
      
      if (currentBasic) setBasicInfo(currentBasic);

      // 2. Extended Info
      // FIX: Removed 'milestones' from this select string.
      // Asking for a deleted column crashes the query.
      const { data: heavyData, error } = await supabase
        .from('campaigns')
        .select(`
          background, 
          problems, 
          solutions, 
          contact_email, 
          contact_phone, 
          campaign_address, 
          pic1, 
          pic2,
          milestones(*) 
        `) // <--- Notice the milestones(*) syntax
        .eq('id', id)
        .single();

        if (heavyData) {
        // 4. Sort milestones (Postgres doesn't guarantee order)
        const sortedMilestones = heavyData.milestones 
          ? heavyData.milestones.sort((a: Milestone, b: Milestone) => a.milestone_index - b.milestone_index)
          : [];
          
        setExtendedInfo({ ...heavyData, milestones: sortedMilestones });
      }

      if (error) {
        console.error('Supabase Fetch Error:', error.message);
      } else if (heavyData) {
        setExtendedInfo(heavyData);
      }

      setLoading(false);
    };

    if (!contextLoading) loadData();
  }, [id, campaigns, contextLoading]);

  if (loading && !basicInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-pulse text-gray-500">
        Loading...
      </div>
    );
  }

  if (!basicInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500">
        Campaign not found.
      </div>
    );
  }

  const headerData = {
    id: basicInfo.id,
    category: basicInfo.category || 'General',
    ngoName: basicInfo.ngo_name || 'Verified NGO',
    createdAt: basicInfo.created_at,
    image: basicInfo.image_url || '/placeholder.jpg',
    title: basicInfo.title,
    description: basicInfo.description || '',
    tags: ['Charity'],
    targetAmount: basicInfo.goal_amount,
    collectedAmount: basicInfo.collected_amount,
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <div className="p-2 rounded-full bg-gray-50 group-hover:bg-gray-200 transition-all group-hover:-translate-x-1">
          <ArrowLeft size={20} />
        </div>
        <span className="font-semibold text-sm">Campaign Details</span>
      </button>

      <CampaignHeader data={headerData} />

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <span className="text-sm text-gray-400 mt-4">Loading details...</span>
        </div>
      ) : (
        <CampaignTabs
          description={basicInfo.description || ''}
          background={extendedInfo?.background || undefined}
          problem={extendedInfo?.problems || undefined}
          solution={extendedInfo?.solutions || undefined}
          milestones={extendedInfo?.milestones || []}
          contact={{
            email: extendedInfo?.contact_email,
            phone: extendedInfo?.contact_phone,
            location: extendedInfo?.campaign_address,
            pics: [extendedInfo?.pic1, extendedInfo?.pic2].filter(Boolean) as PicData[],
          }}
        />
      )}
    </div>
  );
};

export default CampaignDetails;