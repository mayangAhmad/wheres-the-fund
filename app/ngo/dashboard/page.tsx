// app/ngo/dashboard/page.tsx

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { supabaseAdmin } from "@/lib/supabase/admin";
import DashboardContent from "./ngo-dashboard-content";

export default async function Page() {
  const user = await getAuthenticatedUser();

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  const { data: campaigns } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("ngo_id", user.id);

  const userData = {
    name: user.user_metadata?.name || "Unnamed NGO",
    email: user.email || "",
    wallet: profile?.wallet_address || "N/A",
    campaigns: campaigns || [],
  };

  return (
    
        <DashboardContent user={userData} />
  
  );
}
