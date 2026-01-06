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
    
    const { milestone_id, cids, proof_description, proof_submitted_at } = await req.json();
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

    // ⭐ CHECK: Is this milestone already failed_deadline?
    const { data: currentMilestone } = await supabaseAdmin
      .from("milestones")
      .select("status")
      .eq("id", milestone_id)
      .single();

    if (currentMilestone?.status === 'failed_deadline') {
      return NextResponse.json({ 
        error: "Submission disabled. Deadline has passed and account is suspended." 
      }, { status: 403 });
    }

    // 1. Separate images and invoices
    const images = cids
      .filter((f: any) => f.type === 'activity')
      .map((f: any) => `https://${gateway}/ipfs/${f.cid}`);

    const invoices = cids
      .filter((f: any) => f.type === 'invoice')
      .map((f: any) => `https://${gateway}/ipfs/${f.cid}`);

    // 2. Build file metadata
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

    // 3. Create manifest and pin
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

    // 4. Update Supabase
    const { error } = await supabaseAdmin
      .from("milestones")
      .update({
        ipfs_cid: ipfsCidToUse,
        proof_description: proof_description,
        proof_images: images,
        proof_invoices: invoices,
        status: "pending_review",
        submission_date: new Date().toISOString(),
        proof_submitted_at: proof_submitted_at || new Date().toISOString(), // ⭐ Add this
        updated_at: new Date().toISOString()
      })
      .eq("id", milestone_id);

    if (error) throw error;

    // 5. Persist files
    try {
      const { error: insertError } = await supabaseAdmin.from('milestone_files').insert(filesToInsert);
      if (insertError) {
        console.warn('milestone_files insert warning:', insertError.message);
      }
    } catch (err) {
      console.warn('Failed to persist milestone_files:', err);
    }

    // 6. Notify admin
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", adminEmail)
        .single();

      if (adminUser) {
        await supabaseAdmin.from("notifications").insert({
          user_id: adminUser.id,
          message: `📢 REVIEW REQUIRED: NGO "${user.user_metadata?.full_name || 'An NGO'}" submitted proof for milestone.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        console.log("Admin notified successfully");
      }
    } catch (notifErr) {
      console.error("Failed to notify admin:", notifErr);
    }

    // ⭐ 7. Notify NGO of successful submission
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      message: `✅ Proof submitted successfully! Your milestone evidence is now under admin review.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Milestone Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}