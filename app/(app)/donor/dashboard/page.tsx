// app/donor/dashboard/page.tsx
import { redirect } from "next/navigation";
import createClient from "@/lib/supabase/server";
import HomeDashboard from "@/components/donor-dashboard/dashboard/HomeDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?next=/donor/dashboard');
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) console.error("Error fetching donor profile:", profileError);

  const { data: notificationsData, error: notifError } = await supabase
    .from("notifications")
    .select("id, message, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

    if (notifError) console.error("Error fetching notifications:", notifError);

  const { data: statsData, error: statsError } = await supabase
    .from("donations")
    .select("campaign_id, amount")
    .eq("donor_id", user.id)
    .eq("status", "completed");

  if (statsError) console.error("Error fetching donor stats:", statsError);

  const profileData = {
    ...userProfile,
    phoneNum: user.phone || ""
  }

  return <HomeDashboard profile={profileData} stats={statsData} notifications={notificationsData || []}/>;
}