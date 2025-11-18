//app/ngo/campaigns/create/page.tsx
import CampaignsList from "@/components/ngo-dashboard/CampaignList";

export default function CampaignsPage() {
  // This Server Component remains simple and fast.
  // It renders the Client Component which handles the Context.
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CampaignsList />
    </div>
  );
}