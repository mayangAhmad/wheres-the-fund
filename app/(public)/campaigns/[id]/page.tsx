// app/(public)/campaigns/[id]/page.tsx
import CampaignDetails from '@/components/campaigns/id-page/CampaignDetails';

const CampaignPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  return <CampaignDetails id={id} />;
};

export default CampaignPage;
