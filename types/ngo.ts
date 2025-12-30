// types/ngo.ts

export interface Milestone {
  id: string;
  campaign_id: string;
  milestone_index: number;
  title: string;
  description: string;
  funds_allocated_percent: number;
  target_amount: number;
  status: 'locked' | 'active' | 'pending_proof' | 'pending_review' | 'approved' | 'rejected' | 'completed';
  proof_description?: string;
  proof_images?: string[];
  proof_invoices?: string[];
  ipfs_cid?: string;      // For Transparency Card
  payout_tx_hash?: string | null; // For Blockchain Proof
  submission_date: string | null;
  auditor_remarks: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignSummary {
  id: string;
  title: string;
  status: string;
  collected_amount: number;
  created_at: string;
  tx_hash: string | null;
}

export interface Campaign extends CampaignSummary {
  ngo_id: string;
  ngo_name: string;
  description: string;
  category: string;
  image_url: string;
  goal_amount: number;
  end_date: string;
  on_chain_id: number | null;
  wallet_address: string | null;
  contract_address: string | null;
  milestones: Milestone[];

  problems: string[];
  solutions: string[];
  background: string;
  contact_email: string;
  contact_phone: string;
  campaign_address: string;
  pic1: Record<string, any>;
  pic2: Record<string, any>;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  kms_key_id: string;
  created_at: string;
  phoneNum?: string;
  role: string;
}

export interface NgoUser extends BaseUser {
  stripe_account_id: string;
  ssm_number: string;
  avatar_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  campaigns: CampaignSummary[];
}

export interface Donation {
  id: string;
  name: string;
  time: string;
  amount: number;
  created_at: string;
  targetMilestoneId: string;
  milestone_index: number;
}

export interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

