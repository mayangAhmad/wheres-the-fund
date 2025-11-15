// app/donor/dashboard/page.tsx
import { redirect } from "next/navigation";
import createClient from "@/lib/supabase/server";
import DashboardContent from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?next=/donor/dashboard');
  }

  return <DashboardContent user={user} />;
}