// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";
import { registerUser } from "@/lib/services/userService";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // 1. Set a default, but we will overwrite this later based on the DB
  let next = searchParams.get("next") ?? "/donor/dashboard"; 

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();

  // 2. Exchange Code
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // 3. Get User
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { id, email, user_metadata } = user;
  const name = user_metadata?.name ?? user_metadata?.full_name ?? "Anonymous";
  
  // Default fallback for NEW users. 
  // Existing users will ignore this inside registerUser().
  const roleCallback = user_metadata?.role ?? "donor"; 

  try {
    // 4. Call Service and CAPTURE THE RESULT
    // 'result.role' contains the actual role found in the database (e.g. 'ngo')
    const result = await registerUser({ id, email: email!, name, role: roleCallback });
    
    // 5. ✅ FIX: Check the REAL role from the database
    if (result.role === 'ngo') {
      next = "/ngo/dashboard";
    } else {
      next = "/donor/dashboard";
    }

  } catch (error) {
    console.error("Registration failed during callback:", error);
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=registration_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}