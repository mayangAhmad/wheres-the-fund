// // lib/auth/mapToNgoUser.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NgoUser } from "@/types/ngo";
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function mapToNgoUser(user: SupabaseUser): Promise<NgoUser> {
  // Fetch User + Profile (SSM) ONLY. Remove the Campaigns join.
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(`
      id, name, email, wallet_address, kms_key_id, role, created_at,
      ngo_profiles!inner ( 
      ssm_number,
      stripe_account_id,
      description, website_url,
      avatar_url )
    `)
    .eq("id", user.id)
    .eq("role", "ngo")
    .single();

  if (error || !data) throw new Error("Mapping Error");

  const profile = Array.isArray(data.ngo_profiles) ? data.ngo_profiles[0] : data.ngo_profiles;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    wallet_address: data.wallet_address,
    kms_key_id: data.kms_key_id,
    created_at: data.created_at,
    role: data.role,
    ssm_number: profile.ssm_number,
    stripe_account_id: profile.stripe_account_id,
    campaigns: [], 
    description: profile.description,
    website_url: profile.website_url,
    avatar_url: profile.avatar_url,
  } as NgoUser;
}