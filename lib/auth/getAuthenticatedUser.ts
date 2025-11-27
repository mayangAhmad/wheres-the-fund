//lib/auth/getAuthenticatedUser.ts
import createClient from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user;
}

export async function getSupabase() {
const supabase = await createClient();
return supabase;
}

