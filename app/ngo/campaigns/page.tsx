//app/ngo/campaigns/page.tsx
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { mapToNgoUser } from "@/lib/auth/mapToNgoUser";

export default async function CampaignsPage() {
  const supabaseUser = await getAuthenticatedUser();
  const user = await mapToNgoUser(supabaseUser);

  return (
    <main className="space-y-6">
      <h2 className="text-2xl font-bold">📋 My Campaigns</h2>

      {user.campaigns.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t created any campaigns yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.campaigns.map((campaign) => (
            <li
              key={campaign.id}
              className="rounded border p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{campaign.title}</h3>
              <p className="text-sm text-gray-500">Created: {new Date(campaign.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 truncate">Tx Hash: {campaign.tx_hash}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
