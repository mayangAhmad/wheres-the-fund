import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { mapToNgoUser } from "@/lib/auth/mapToNgoUser"; // ✅ import your mapper

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
  const supabaseUser = await getAuthenticatedUser();
  const user = await mapToNgoUser(supabaseUser); // ✅ convert to NgoUser

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
