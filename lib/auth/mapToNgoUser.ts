// // lib/auth/mapToNgoUser.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NgoUser } from "@/types/ngo";
import { User as SupabaseUser } from "@supabase/supabase-js";

// export async function mapToNgoUser(user: SupabaseUser): Promise<NgoUser> {

//   const { data, error } = await supabaseAdmin
//     .from("users")
//     .select(`
//       id, name, email, wallet_address, kms_key_id, role,
//       ngo_profiles!inner (
//         ssm_number,
//         campaigns (
//             id, title, created_at, tx_hash, status, collected_amount
//         )
//       )
//     `)
//     .eq("id", user.id)
//     .eq("role", "ngo")
//     .single();

//   if (error || !data) {
//     console.error("Mapping Error:", error);
//     throw new Error("User is not an NGO or profile missing.");
//   }

//   const profile = Array.isArray(data.ngo_profiles) 
//     ? data.ngo_profiles[0] 
//     : data.ngo_profiles;

//   if (!profile) throw new Error("Profile structure mismatch");

//   return {
//     id: data.id,
//     name: data.name,
//     email: data.email,
//     wallet_address: data.wallet_address,
//     kms_key_id: data.kms_key_id,
//     role: data.role,
//     ssm_number: profile.ssm_number,
//     campaigns: (profile.campaigns || []) as unknown as CampaignSummary[], 
//   };
// }

// lib/auth/mapToNgoUser.ts

export async function mapToNgoUser(user: SupabaseUser): Promise<NgoUser> {
  // Fetch User + Profile (SSM) ONLY. Remove the Campaigns join.
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(`
      id, name, email, wallet_address, kms_key_id, role,
      ngo_profiles!inner ( 
      ssm_number,
      stripe_account_id )
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
    role: data.role,
    ssm_number: profile.ssm_number,
    stripe_account_id: profile.stripe_account_id,
    campaigns: [], // ⚡️ Return empty array here. Layout stays fast!
  } as NgoUser;
}