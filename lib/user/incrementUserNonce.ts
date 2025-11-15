import { supabaseAdmin } from "@/lib/supabase/admin";

export async function incrementUserNonce(userId: string, currentNonce: number) {
  await supabaseAdmin
    .from("users")
    .update({ nonce: currentNonce + 1 })
    .eq("id", userId);
}
