import createClient from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCampaignForm from "@/components/ngo-dashboard/publich-campaign/forms/CreateCampaignForm";

export default async function CreateCampaignPage() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 2. Fetch Profile Data (Server-Side)
  // We check the exact same fields as your Sidebar and API
  const { data: profile } = await supabase
    .from("ngo_profiles")
    .select("description, website_url")
    .eq("ngo_id", user.id)
    .single();

  // 3. Define Completeness Logic
  const isComplete = profile && profile.description && profile.website_url;

  // 4. BLOCK ACCESS: Render "Restricted" View if incomplete
  if (!isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm border mt-8 mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4">
        
        <div className="bg-orange-100 p-4 rounded-full mb-6">
          <AlertCircle size={48} className="text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Setup Required</h1>
        
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          To ensure transparency and build trust with donors, we require all NGOs to complete their public profile (including a <strong>Bio</strong> and <strong>Website URL</strong>) before publishing a campaign.
        </p>
        
        <Link href="/ngo/settings">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 pl-6 pr-6 py-6 text-base font-medium shadow-orange-200 shadow-lg hover:shadow-xl transition-all">
            Complete Profile <ArrowRight size={18} />
          </Button>
        </Link>
        
        <p className="text-xs text-gray-400 mt-6">
          This only takes about 1 minute.
        </p>
      </div>
    );
  }

  // 5. ALLOW ACCESS: Render the Form
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 px-6">Create New Campaign</h1>
      <CreateCampaignForm />
    </div>
  );
}