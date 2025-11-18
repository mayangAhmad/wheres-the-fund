import { supabaseAdmin } from "@/lib/supabase/admin";
import { NgoUser, BaseUser } from "@/types/ngo"; 
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function mapToNgoUser(user: SupabaseUser): Promise<NgoUser> {
  // 1. Fetch Shared User Data
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select(`id, name, email, wallet_address, kms_key_id, role`)
    .eq("id", user.id)
    .single() as { data: (BaseUser & { role: string }) | null, error: any };

  if (userError || !userData || userData.role !== 'ngo') {
    console.error("User Profile Error:", userError);
    throw new Error("User profile not found or role is not NGO.");
  }
  
  // 2. Fetch Unique Profile Data + Key Campaign Stats
  const { data: ngoProfileData, error: profileError } = await supabaseAdmin
    .from("ngo_profiles")
    .select(
      `
        ssm_number,
        campaigns (
            id, 
            title, 
            created_at, 
            tx_hash, 
            status, 
            collected_amount
        ) 
      `
    )
    // ✅ FIX: Use 'ngo_id' because that is your PRIMARY KEY in the ngo_profiles table
    .eq("ngo_id", user.id)
    .single();

  if (profileError || !ngoProfileData) {
     // Log the error to help debugging
     console.error("NGO Profile Query Error:", profileError);
     throw new Error(`NGO Profile data missing: ${profileError?.message}`);
  }

  // 3. Construct the final NgoUser object
  return {
    ...userData,
    ssm_number: ngoProfileData.ssm_number,
    // Safely handle the array (default to empty if null)
    campaigns: (ngoProfileData.campaigns || []) as unknown as NgoUser["campaigns"], 
  } as NgoUser;
}