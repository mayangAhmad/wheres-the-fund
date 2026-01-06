import createClient from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export interface DonorUser {
  id: string;
  email: string;
  name: string;
  role: string;
  wallet_address: string | null;
  profile_image_url?: string;
  stripe_customer_id: string | null;
}

export async function mapToDonorUser(authenticatedUser: User): Promise<DonorUser> {
  const supabase = await createClient();

  // 1. Fetch data from both 'users' and 'donor_profiles' using the foreign key relationship
  // We expect a single result since IDs are unique.
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      wallet_address,
      donor_profiles (
        stripe_customer_id,
        profile_image_url
      )
    `)
    .eq("id", authenticatedUser.id)
    .single();

  if (error || !data) {
    console.error("Error fetching donor profile:", error);
    throw new Error("Failed to fetch user profile");
  }

  // 2. Validate that the specific donor profile exists
  // If 'donor_profiles' is null/empty array (depending on query), the user hasn't finished onboarding.
  // .single() on a join usually returns the relation as an object or null.
  if (!data.donor_profiles) {
    throw new Error("Donor profile not found - User needs onboarding");
  }

  // 3. Flatten the data structure for easier use in the frontend
  // The query returns donor_profiles as an object/array, we just want the ID.
  const donorProfile = Array.isArray(data.donor_profiles) 
    ? data.donor_profiles[0] 
    : data.donor_profiles;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    wallet_address: data.wallet_address,
    profile_image_url: donorProfile.profile_image_url,
    stripe_customer_id: donorProfile?.stripe_customer_id || null,
  };
}