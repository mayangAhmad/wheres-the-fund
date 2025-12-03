import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { 
        milestone_id, 
        campaign_id, 
        proof_description, 
        proof_images, 
        proof_invoices 
    } = body;

    // 1. Update the Milestone Status
    const { error } = await supabaseAdmin
      .from("milestones")
      .update({
        proof_description,
        proof_images,      // Array of URLs
        proof_invoices,    // Array of URLs
        submission_date: new Date().toISOString(),
        status: "pending_review" 
      })
      .eq("id", milestone_id);

    if (error) throw error;

    // 2. Notify the Admin
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    
    if (adminEmail) {
        const { data: adminUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", adminEmail)
            .single();

        if (adminUser) {
            // Get campaign title context
            const { data: campaign } = await supabaseAdmin
                .from("campaigns")
                .select("title")
                .eq("id", campaign_id)
                .single();

            await supabaseAdmin.from("notifications").insert({
                user_id: adminUser.id,
                message: `📢 REVIEW REQUEST: Proof submitted for "${campaign?.title}".`,
                is_read: false
            });
        }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Milestone Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}