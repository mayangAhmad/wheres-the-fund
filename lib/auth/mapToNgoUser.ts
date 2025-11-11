// lib/auth/mapToNgoUser.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NgoUser } from "@/types/ngo";
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function mapToNgoUser(user: SupabaseUser): Promise<NgoUser> {
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  const { data: campaigns } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("ngo_id", user.id);

  return {
    name: user.user_metadata?.name || "Unnamed NGO",
    email: user.email || "",
    wallet: profile?.wallet_address || "N/A",
    campaigns: campaigns || [],
  };
}
