import createClient from "@/lib/supabase/server";
import NgoList from "@/components/verified-ngos/NgoList";

// Define the shape of the data based on your schema + the join
export interface NgoProfileWithUser {
  ngo_id: string;
  description: string | null;
  avatar_url: string | null;
  website_url: string | null;
  ssm_number: string;
  users: {
    name: string; 
    email: string;
  } | null;
}

export default async function NgosPage() {
  const supabase = createClient();

  const { data: ngos, error } = await (await supabase)
    .from("ngo_profiles")
    .select(`
      ngo_id,
      description,
      avatar_url,
      website_url,
      ssm_number,
      users (
        name,
        email
      )
    `);

  if (error) {
    console.error("Error fetching NGOs:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Failed to load NGOs. Please try again later.
      </div>
    );
  }

  // FIXED: Removed the <div className="container..."> wrapper and the duplicate text.
  // The NgoList component handles the full-width layout, Hero section, and containers internally.
  return <NgoList initialNgos={ngos as unknown as NgoProfileWithUser[]} />;
}