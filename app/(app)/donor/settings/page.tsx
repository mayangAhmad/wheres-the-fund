import createClient from "@/lib/supabase/server";
import Settings from "@/components/donor-dashboard/settings/Settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the full profile from the DB
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .single();

  return <Settings user={profile} />; 
}