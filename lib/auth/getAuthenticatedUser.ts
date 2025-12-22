//lib/auth/getAuthenticatedUser.ts
import createClient from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    if (!user) {
      return null;
    }

    return user;
  } catch (err) {

    return null;
  }

}

export async function getSupabase() {
  const supabase = await createClient();
  return supabase;
}

