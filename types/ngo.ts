// types/ngo.ts

export interface Campaign {
  id: string;
  title: string;
  created_at: string;
  tx_hash: string;
  amount?: number;
  status?: string;
}

export interface NgoUser {
  name: string;
  email: string;
  wallet: string;
  campaigns: Campaign[];
}
