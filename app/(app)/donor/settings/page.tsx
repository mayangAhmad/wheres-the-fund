// app/(app)/donor/settings/page.tsx
import createClient from "@/lib/supabase/server";
import Settings from "@/components/donor-dashboard/settings/Settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ⭐ Fetch the full profile with donor_profiles joined
  const { data: profile } = await supabase
    .from("users")
    .select(`
      *,
      donor_profiles (
        stripe_customer_id,
        profile_image_url
      )
    `)
    .eq("id", user?.id)
    .single();

  // ⭐ Extract donor profile data
  const donorProfile = Array.isArray(profile?.donor_profiles) 
    ? profile.donor_profiles[0] 
    : profile?.donor_profiles;

  return (
    <Settings 
      user={profile} 
      profileImageUrl={donorProfile?.profile_image_url} 
    />
  ); 
}