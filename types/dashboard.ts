export interface MilestoneReview {
  id: string;
  milestone_index: number;
  title: string;
  campaign_id: string;
  description: string;
  proof_description: string;
  proof_images: string[];
  proof_invoices: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  campaigns: {
    id: string;
    title: string;
    ngo_name: string;
    escrow_balance: number;
    ngo_id: string;
  };
}

export interface AdminDashboardClientProps {
  initialReviews: MilestoneReview[];
}