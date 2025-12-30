// @/app/api/milestones/update/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pinata } from "@/lib/pinata/config";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.user_metadata?.role !== "ngo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { milestone_id, cids, proof_description } = await req.json();
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

    // 1. Separate images and invoices based on file type/naming 
    // (Assuming cids array has metadata or you filter by extension)
    const images = cids
      .filter((f: any) => f.type === 'activity')
      .map((f: any) => `https://${gateway}/ipfs/${f.cid}`);

    const invoices = cids
      .filter((f: any) => f.type === 'invoice')
      .map((f: any) => `https://${gateway}/ipfs/${f.cid}`);

    // 2. Build file metadata for DB insert & manifest
    const filesToInsert = (cids || []).map((f: any) => ({
      milestone_id,
      campaign_id: f.campaign_id || null,
      filename: f.name || null,
      cid: f.cid || null,
      url: f.url || `https://${gateway}/ipfs/${f.cid}`,
      size: f.size || null,
      uploader_id: user.id,
      file_type: f.type || null,
      created_at: new Date().toISOString(),
    }));

    // 3. Create a manifest JSON and pin it to Pinata to obtain a single canonical CID
    let manifestCid: string | null = null;
    let manifestUrl: string | null = null;
    try {
      const manifest = {
        milestone_id,
        campaign_id: cids[0]?.campaign_id ?? null,
        proof_description,
        files: filesToInsert,
        created_at: new Date().toISOString(),
      };

      // Try to pin the manifest as JSON (SDK may support upload.public.json)
      const manifestUpload = await (pinata as any).upload?.public?.json
        ? await (pinata as any).upload.public.json(manifest)
        : await (pinata as any).upload.public.file(new Blob([JSON.stringify(manifest)]), {
            name: 'manifest.json',
          });

      manifestCid = (manifestUpload as any).cid ?? (manifestUpload as any).IpfsHash ?? (manifestUpload as any).ipfsHash ?? null;
      manifestUrl = manifestCid ? await pinata.gateways.public.convert(manifestCid) : null;
      console.log('Pinned manifest for milestone', milestone_id, 'cid:', manifestCid);
    } catch (err) {
      console.warn('Manifest pinning failed; falling back to first file CID', err);
    }

    const ipfsCidToUse = manifestCid || cids[0]?.cid || null;

    // 4. Update Supabase - Column names now match your SQL exactly
    const { error } = await supabaseAdmin
      .from("milestones")
      .update({
        ipfs_cid: ipfsCidToUse, // Prefer manifest CID when available
        proof_description: proof_description,
        proof_images: images,   // Matches jsonb
        proof_invoices: invoices, // Matches jsonb
        status: "pending_review", // Matches check constraint
        submission_date: new Date().toISOString(), // Matches timestamp with time zone
        updated_at: new Date().toISOString()
      })
      .eq("id", milestone_id);

    if (error) throw error;

    // 5. Persist per-file metadata to `milestone_files` for auditability (best-effort)
    try {
      // best-effort insert: don't fail the main flow if this table doesn't exist
      const { error: insertError } = await supabaseAdmin.from('milestone_files').insert(filesToInsert);
      if (insertError) {
        // Log but don't throw so milestone update still succeeds
        console.warn('milestone_files insert warning:', insertError.message);
      }
    } catch (err) {
      console.warn('Failed to persist milestone_files:', err);
    }

    // --- 6. NEW: NOTIFY ADMIN FOR APPROVAL ---
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      // Get Admin User ID
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", adminEmail)
        .single();

      if (adminUser) {
        await supabaseAdmin.from("notifications").insert({
          user_id: adminUser.id,
          message: `📢 REVIEW REQUIRED: NGO "${user.user_metadata?.full_name || 'An NGO'}" submitted proof for a milestone.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        console.log("Admin notified successfully");
      }
    } catch (notifErr) {
      console.error("Failed to notify admin:", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Milestone Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}