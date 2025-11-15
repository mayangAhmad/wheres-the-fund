//app/auth/callback/route.ts
import { NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/donor/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("Session exchange error:", exchangeError.message);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User fetch error:", userError?.message);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { id, email, user_metadata } = user;
  const role = user_metadata?.role ?? "donor"; // fallback to donor
  const name = user_metadata?.name ?? user_metadata?.full_name ?? "Anonymous";

  console.log("Google user metadata:", user_metadata);
  console.log("Registering user:", { id, name, email, role });

  // ✅ Insert via secure API route (bypasses RLS)
  const registerRes = await fetch(`${origin}/api/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, email, role }),
  });

  if (!registerRes.ok) {
    const { error: registerError } = await registerRes.json();
    console.error("Register error:", registerError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // ✅ Trigger wallet setup
  await fetch(`${origin}/api/user/setup-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });

  return NextResponse.redirect(`${origin}${next}`);
}
