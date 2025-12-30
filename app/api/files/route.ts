// @/app/api/files/route.ts
import { NextResponse } from "next/server";
import { pinata } from "@/lib/pinata/config";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.user_metadata?.role !== "ngo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as unknown as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

    if ((file as any).size && (file as any).size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    if ((file as any).type && !allowed.includes((file as any).type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    const uploadRes = await pinata.upload.public.file(file);
    // pinata.upload.public.file may return { cid } or { IpfsHash } or ipfsHash
    const cid = (uploadRes as any).cid ?? (uploadRes as any).IpfsHash ?? (uploadRes as any).ipfsHash ?? null;
    const url = cid ? await pinata.gateways.public.convert(cid) : null;

    return NextResponse.json({ cid, url, name: (file as any).name, size: (file as any).size }, { status: 200 });
  } catch (err) {
    console.error("Pinata upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
