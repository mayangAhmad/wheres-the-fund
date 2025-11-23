import { type NextRequest, NextResponse } from "next/server";
import updateSession from "@/lib/supabase/proxy";

console.log("--- PROXY FILE LOADED ---");

// 🔴 FIX: Change 'Proxy' to 'proxy' (lowercase)
export default function proxy(request: NextRequest) {
  console.log("🔒 Proxy running for:", request.nextUrl.pathname);

  try {
    return updateSession(request);
  } catch (e) {
    console.error("Proxy Error:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/login",
    "/donor/dashboard/:path*",
    "/ngo/dashboard/:path*",
    "/donor/dashboard",
    "/ngo/dashboard",

  ]
};