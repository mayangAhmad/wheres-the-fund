import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";
import createClient from "@/lib/supabase/server";
import NotificationClient from "@/components/ngo-dashboard/notifications/NotificationClient";

export const metadata = {
  title: "Notifications | NGO Dashboard",
};

export default async function NotificationsPage() {
  // 1. Auth Check
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: notifications, error } = await (await supabase)
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Debugging: Check if this is actually returning what we expect
  if (error) console.error("Supabase Error:", error);

  return (
    <main className="...">
        {/* ... headers ... */}
        <NotificationClient 
            initialNotifications={notifications || []} // FIX: Add "|| []" here too
            userId={user.id} 
            mode={"full"}
        />
    </main>
  );
}