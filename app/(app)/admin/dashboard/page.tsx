import { supabaseAdmin } from "@/lib/supabase/admin"; // <--- Use Admin Client (Bypasses RLS)
import AdminDashboardClient from "@/components/admin-dashboard/AdminDashboardClient";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";

// Force dynamic so it refreshes on every view
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Command Center | WheresTheFund",
  description: "Approve milestones and release funds.",
};

export default async function AdminDashboardPage() {
  // 1. Double Check Security
  const user = await getAuthenticatedUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/");
  }

  // 2. Fetch Pending Reviews (Server-Side)
  const { data: reviews, error } = await supabaseAdmin
    .from("milestones")
    .select(`
        *,
        campaigns (
            title,
            collected_amount,
            total_released,
            escrow_balance,
            ngo_name,
            ngo_profiles (
                stripe_account_id
            )
        )
    `)
    .eq("status", "pending_review")
    .order("submission_date", { ascending: true });

  if (error) {
    console.error("Admin Fetch Error:", error);
    // You could render an error state here if you want
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Dashboard Overview
      </h1>
      
      {/* Pass the data down as initial props */}
      <AdminDashboardClient initialReviews={reviews || []} />
    </div>
  );
}