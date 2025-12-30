// @/app/api/files/url/route.ts
import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata/config";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.user_metadata?.role !== "ngo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signed = await pinata.upload.public.createSignedURL({ expires: 30 });
    // Pinata SDK may return a string or an object with { url }
    const signedAny = signed as any;
    const signedUrl = typeof signedAny === "string" ? signedAny : (signedAny.url ?? signedAny);
    return NextResponse.json({ url: signedUrl }, { status: 200 });
  } catch (err) {
    console.error("Pinata Signed URL Error:", err);
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }
}
 