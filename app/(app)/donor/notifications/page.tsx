import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";
import createClient from "@/lib/supabase/server";
import NotificationClient from "@/components/ngo-dashboard/notifications/NotificationClient";

export const metadata = {
  title: "Notifications | Donor Dashboard",
};

export default async function NotificationsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: notifications, error } = await (await supabase)
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("Supabase Error:", error);

  return (
    <main className="...">
        {/* ... headers ... */}
        <NotificationClient 
            initialNotifications={notifications || []} 
            userId={user.id} 
            mode="full"
        />
    </main>
  );
}