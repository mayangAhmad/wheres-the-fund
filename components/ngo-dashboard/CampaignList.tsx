"use client"; // 👈 This marks it as a Client Component

import { useNgoUser } from "@/context/NgoUserContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CampaignsList() {
  // Now safe to use the hook because we are in a Client Component
  const { user } = useNgoUser();
  const campaigns = user.campaigns || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Campaigns</h2>
        <Button asChild>
          <Link href="/ngo/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
          <h3 className="text-lg font-semibold">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">Start your first fundraising campaign today.</p>
          <Button asChild variant="outline">
            <Link href="/ngo/campaigns/create">Create Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {campaign.title}
                </CardTitle>
                <Badge variant={campaign.status === 'Ongoing' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RM {(Number(campaign.collected_amount) || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created on {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}