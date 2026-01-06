// types/ngo.ts

// types/ngo.ts (or wherever Milestone is defined)
export interface Milestone {
  id: string;
  campaign_id: string;
  milestone_index: number;
  title: string;
  description: string;
  funds_allocated_percent: number;
  target_amount: number;
  status: 'locked' | 'active' | 'pending_proof' | 'pending_review' | 'approved' | 'rejected' | 'failed_deadline'; // ⭐ Updated
  proof_description?: string;
  proof_images?: string[];
  proof_invoices?: string[];
  submission_date?: string;
  auditor_remarks?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  payout_tx_hash?: string;
  ipfs_cid?: string;
  proof_deadline?: string;
  proof_submitted_at?: string; 
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

