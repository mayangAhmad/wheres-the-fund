import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ngo-dashboard/app-sidebar";
import { SiteHeader } from "@/components/ngo-dashboard/site-header";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { mapToNgoUser } from "@/lib/auth/mapToNgoUser"; 
import { NgoUserProvider } from "@/context/NgoUserContext"; // 👈 1. Import this

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
  const supabaseUser = await getAuthenticatedUser();
  
  // Ensure this doesn't fail if the user is missing a profile
  // You might want to wrap this in a try/catch or handle the redirect if null
  const user = await mapToNgoUser(supabaseUser); 

  return (
    // 2. Wrap everything in the Provider
    // Your context expects "initialUser", so we pass "user" into it.
    <NgoUserProvider initialUser={user}>
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
    </NgoUserProvider>
  );
}