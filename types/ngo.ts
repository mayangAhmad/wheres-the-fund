// types/ngo.ts

// 1. Define the Milestone interface based on your SQL schema
export interface Milestone {
  id: string;
  campaign_id: string;
  milestone_index: number;
  title: string;
  description: string;
  funds_allocated_percent: number;
  target_amount: number;
  status: 'locked' | 'active' | 'pending_review' | 'approved' | 'rejected';
  proof_description: string | null;
  proof_images: string[] | null;   // JSONB usually returns as array
  proof_invoices: string[] | null; // JSONB usually returns as array
  submission_date: string | null;
  auditor_remarks: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignSummary {
  id: string;
  title: string;
  status: string | null;
  collected_amount: number | null;
  created_at: string;
  tx_hash: string | null;
}

export interface Campaign extends CampaignSummary {
  ngo_id: string | null;
  ngo_name: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  goal_amount: number | null;
  end_date: string | null;
  on_chain_id: number | null;
  wallet_address: string | null;
  contract_address: string | null;
  milestones: Milestone[] | null; 
  
  problems: string[] | null;
  solutions: string[] | null;
  background: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  campaign_address: string | null;
  pic1: Record<string, any> | null;
  pic2: Record<string, any> | null;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  kms_key_id: string;
  role: string;
}

export interface NgoUser extends BaseUser {
  ssm_number: string;
  avatar_url?: string | null; 
  website_url?: string | null;
  description?: string | null;
  campaigns: CampaignSummary[]; 
}