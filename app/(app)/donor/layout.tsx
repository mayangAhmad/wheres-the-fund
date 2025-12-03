import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { DonorUserProvider } from "@/context/DonorUserContext"; 
import { mapToDonorUser } from "@/lib/auth/mapToDonorUser";
import DonorDashboardLayoutWrapper from "@/components/donor-dashboard/DonorDashboardLayoutWrapper";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  
  const supabaseUser = await getAuthenticatedUser();
  if (!supabaseUser) redirect("/login");
  
  let user;
  try {
    user = await mapToDonorUser(supabaseUser);
  } catch (error) {
    console.error("Donor Layout Fetch Error:", error);
    redirect("/donor/onboarding");
  }

  return (
    <DonorUserProvider initialUser={user}>
      <DonorDashboardLayoutWrapper>
        {children}
      </DonorDashboardLayoutWrapper>
    </DonorUserProvider>
  );
}