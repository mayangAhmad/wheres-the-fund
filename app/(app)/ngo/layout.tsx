import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { mapToNgoUser } from "@/lib/auth/mapToNgoUser"; 
import { NgoUserProvider } from "@/context/NgoUserContext"; 
import DashboardLayoutWrapper from "@/components/ngo-dashboard/DashboardLayoutWrapper"; 

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
  
  const supabaseUser = await getAuthenticatedUser();
  if (!supabaseUser) redirect("/login");
  
  let user;
  try {
    user = await mapToNgoUser(supabaseUser);
  } catch (error) {
    console.error("Layout Fetch Error:", error);
    redirect("/ngo/onboarding");
  }

  // 3. Render
  return (
    <NgoUserProvider initialUser={user}>
      <DashboardLayoutWrapper>
        {children}
      </DashboardLayoutWrapper>
    </NgoUserProvider>
  );
}