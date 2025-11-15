// app/ngo/campaigns/create/page.tsx
import CreateCampaignForm from "@/components/forms/CreateCampaignForm";
import createClient from "@/lib/supabase/server";

export default async function CreateCampaignPage() {
  const supabase = await createClient(); // use server client directly
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    throw new Error("Unauthorized"); // you can also redirect to login if you want
  }

  return <CreateCampaignForm user={user} />;
}
