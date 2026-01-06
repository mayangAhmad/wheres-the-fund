// app/api/cron/enforce-proof-deadlines/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date().toISOString();

    // Find overdue milestones
    const { data: overdueMilestones } = await supabaseAdmin
      .from("milestones")
      .select("*, campaigns(ngo_id, title)")
      .eq("status", "pending_proof")
      .lt("proof_deadline", now)
      .not("proof_deadline", "is", null);

    let blockedCount = 0;

    for (const milestone of overdueMilestones || []) {
      const ngoId = milestone.campaigns.ngo_id;
      
      // Block NGO account
      await supabaseAdmin
        .from("ngo_profiles")
        .update({ 
          account_status: "blocked",
          blocked_reason: `Failed to submit proof for Milestone ${milestone.milestone_index + 1} within 5-day deadline`,
          blocked_at: new Date().toISOString()
        })
        .eq("ngo_id", ngoId);

      // Mark milestone as failed
      await supabaseAdmin
        .from("milestones")
        .update({ status: "failed_deadline" })
        .eq("id", milestone.id);

      // Notify NGO
      await supabaseAdmin.from("notifications").insert({
        user_id: ngoId,
        message: `🚫 ACCOUNT BLOCKED: Proof deadline for "${milestone.title}" missed. Contact support to appeal.`,
        is_read: false
      });

      blockedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      blockedAccounts: blockedCount,
      message: `Enforced ${blockedCount} deadline violations`
    });

  } catch (error: any) {
    console.error("❌ Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}