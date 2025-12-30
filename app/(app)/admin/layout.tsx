// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Server-Side Security Guard
  const user = await getAuthenticatedUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!user || user.email !== adminEmail) {
    console.warn(`Blocked unauthorized admin access: ${user?.email}`);
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- SIDEBAR COMPONENT --- */}
      <AdminSidebar />

      {/* --- MAIN CONTENT AREA --- */}
      {/* 'pl-64' matches the sidebar width (w-64) */}
      <main className="flex-1 md:pl-64 min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}