// app/(app)/admin/deadlines/page.tsx
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";
import AdminDeadlinesClient from "@/components/admin-dashboard/AdminDeadlinesClient";

export const dynamic = "force-dynamic";

export default async function AdminDeadlinesPage() {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/");
  }

  // Fetch milestones with deadlines
  const { data: milestones } = await supabaseAdmin
    .from("milestones")
    .select(`
      *,
      campaigns (
        id,
        title,
        ngo_name,
        ngo_id
      )
    `)
    .eq("status", "pending_proof")
    .not("proof_deadline", "is", null)
    .order("proof_deadline", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proof Submission Deadlines</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor NGO compliance with 5-day submission window</p>
      </div>
      
      <AdminDeadlinesClient milestones={milestones || []} />
    </div>
  );
}