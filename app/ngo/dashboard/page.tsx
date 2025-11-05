// app/ngo/dashboard/page.tsx
//server part of dashboard page

import { redirect } from "next/navigation";
import createClient from "@/lib/supabase/server";
import NgoDashboardContent from "./ngo-dashboard-content";

export default async function NgoDashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?next=/ngo/dashboard');
  }


  return <NgoDashboardContent user={user} />;
}