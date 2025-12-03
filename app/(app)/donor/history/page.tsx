import HistoryClientView from "@/components/donor-dashboard/history/HIstoryClientView";
import { getAuthenticatedUser, getSupabase} from "@/lib/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Donation History | WheresTheFund",
  description: "View your past contributions and their impact.",
};

export default async function DonorHistoryPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await getSupabase();

  const { data: donations, error } = await supabase
    .from("donations")
    .select(`
      id,
      amount,
      status,
      created_at,
      on_chain_tx_hash,
      campaigns (
        title,
        id
      )
    `)
    .eq("donor_id", user.id) 
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase History Fetch Error:", JSON.stringify(error, null, 2));
    
    // Fallback UI for errors
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
        <p className="font-bold">Unable to load donation history.</p>
        <p className="text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HistoryClientView initialDonations={donations || []} />
    </div>
  );
}