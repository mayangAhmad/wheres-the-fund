import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminUsersClient from "@/components/admin-dashboard/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Users Error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Directory</h1>
        <p className="text-sm text-gray-500">View and manage roles for donors, NGOs, and administrative staff.</p>
      </div>

      <AdminUsersClient initialUsers={users || []} />
    </div>
  );
}