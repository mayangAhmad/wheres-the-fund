//app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react"; // Add other icons as needed
import AdminLogoutButton from "@/components/admin-dashboard/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- SECURITY CHECK (Moved from Page to Layout) ---
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!adminEmail || user.email !== adminEmail) {
    console.warn(`Unauthorized admin access attempt by: ${user.email}`);
    redirect("/"); 
  }
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white flex flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-gray-900">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          {/* Add more links here later */}
        </nav>

        {/* LOGOUT BUTTON AREA */}
        <div className="border-t p-4">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pl-64 w-full">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}