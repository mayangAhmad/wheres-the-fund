import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import CreateCampaignForm from "@/components/forms/CreateCampaignForm";

export default async function CreateCampaignPage() {
  const user = await getAuthenticatedUser(); // ✅ server-only
  return <CreateCampaignForm user={user} />;
}
