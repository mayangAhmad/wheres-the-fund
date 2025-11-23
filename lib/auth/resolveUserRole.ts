import { supabaseAdmin } from "../supabase/admin";

export async function resolveUserRole(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return "donor"; // safe default
  return data.role;
}
