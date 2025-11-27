// types/ngo.ts

// 1. Define the Lightweight Summary (Matches your Dashboard Query)
export interface CampaignSummary {
  id: string;
  title: string;
  status: string | null;
  collected_amount: number | null;
  created_at: string;
  tx_hash: string | null;
}

// 2. Define the Full Details (Matches your Campaign Details Page)
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
  milestones: string[] | null;
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
  stripe_account_id: string;
  ssm_number: string;
  campaigns: CampaignSummary[];
}