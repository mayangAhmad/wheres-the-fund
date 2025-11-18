// app/api/integrations/ssm/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { ssmNumber } = await req.json();

    // 1. Call your Mock API here (Server-to-Server)
    // In the future, replace this URL with the real SSM API endpoint
    const mockUrl = new URL("https://68f342dafd14a9fcc4283dd6.mockapi.io/ngos/ngos-verification");
    mockUrl.searchParams.append("ssmNumber", ssmNumber.trim());

    const res = await fetch(mockUrl.toString(), { 
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store' // Don't cache verification results
    });

    if (!res.ok) return NextResponse.json({ valid: false }, { status: 400 });

    const data = await res.json();

    // 2. Validate the Mock Data structure
    const isValid = Array.isArray(data) && data.length > 0;

    if (!isValid) {
      return NextResponse.json(
        { valid: false, message: "SSM Number not found." },
        { status: 400 }
      );
    }

    // 3. Return success to frontend
    return NextResponse.json({ valid: true });

  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Verification service unavailable." },
      { status: 500 }
    );
  }
}