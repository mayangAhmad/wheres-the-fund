// types/ngo.ts

export interface Campaign {
  id: string; // uuid
  ngo_id?: string | null; // uuid, FK to auth.users
  ngo_name?: string | null; // text
  title: string; // text, required
  description?: string | null; // text
  category?: string | null; // text
  image_url?: string | null; // text
  goal_amount?: number | null; // numeric
  collected_amount?: number | null; // numeric, default 0
  status?: string | null; // text, default 'Ongoing'
  end_date?: string | null; // date (ISO string)
  created_at?: string
  on_chain_id?: number | null; // bigint
  wallet_address?: string | null; // text
  tx_hash?: string | null; // text
  contract_address?: string | null; // text
  milestones?: string[] | null; // text[]
  problems?: string[] | null; // text[]
  solutions?: string[] | null; // text[]
  background?: string | null; // text
  contact_email?: string | null; // text
  contact_phone?: string | null; // text
  campaign_address?: string | null; // text
  pic1?: Record<string, any> | null; // jsonb
  pic2?: Record<string, any> | null; // jsonb
}

// The generic data (from public.users)
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  wallet_address: string;
  kms_key_id: string;
}

// The final object delivered to the dashboard (combines shared and unique data)
export interface NgoUser extends BaseUser {
  // Unique NGO data from ngo_profiles
  ssm_number: string;
  // Related data from campaigns table
  campaigns: Campaign[]; 
}

// You should also create a separate DonorUser interface for clarity
// export interface DonorUser extends BaseUser {
//     // Add donor_profiles fields here if needed
// }