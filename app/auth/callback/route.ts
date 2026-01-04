// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";
import { registerUser } from "@/lib/services/userService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://wheresthefund.com";
  const code = searchParams.get("code");
  
  let next = searchParams.get("next") ?? "/donor/dashboard"; 

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { id, email, user_metadata } = user;
  const name = user_metadata?.name ?? user_metadata?.full_name ?? "Anonymous";
  const roleCallback = user_metadata?.role ?? "donor"; 

  try {
    const result = await registerUser({ id, email: email!, name, role: roleCallback });
    
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