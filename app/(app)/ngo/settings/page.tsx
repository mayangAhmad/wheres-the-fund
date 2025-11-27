import { redirect } from "next/navigation";
import SettingsClient from "@/components/ngo-dashboard/settings/SettingsClient";
import { getAuthenticatedUser, getSupabase } from "@/lib/auth/getAuthenticatedUser";

export default async function NgoSettingsPage() {
  const supabase = await getSupabase();
  const user = await getAuthenticatedUser()

  if (!user) redirect("/auth/login");

  // Fetch combined data from 'users' (Auth data) and 'ngo_profiles' (Public data)
  const { data: profile, error } = await supabase
    .from("ngo_profiles")
    .select(`
      *,
      users (
        email,
        name
      )
    `)
    .eq("ngo_id", user.id)
    .single();

  if (error || !profile) {
    // Handle edge case where profile might be missing
    return <div>Error loading profile.</div>;
  }

  // Flatten data for easier consumption
  const userData = {
    id: profile.ngo_id,
    name: profile.users?.name || "",
    email: profile.users?.email || "", // Read-only auth email
    avatar_url: profile.avatar_url,
    description: profile.description,
    ssm_number: profile.ssm_number,
    stripe_connected: !!profile.stripe_account_id, // Boolean status
    website_url: profile.website_url
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-500">Manage your public profile and account preferences.</p>
      </div>
      
      <SettingsClient initialData={userData} />
    </div>
  );
}