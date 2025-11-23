import CampaignDetails from '@/components/campaigns/CampaignDetails';

const CampaignPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  return <CampaignDetails id={id} />;
};

export default CampaignPage;
