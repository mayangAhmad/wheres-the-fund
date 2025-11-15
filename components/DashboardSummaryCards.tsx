"use client";

import {
  IconTrendingUp,
 // IconTrendingDown,
  IconUsers,
  IconCash,
  IconCheck,
  //IconWorld,
} from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  stats: {
    totalFunds: string;
    activeCampaigns: number;
    donors: string;
    completionRate: string;
  };
}

export function DashboardSummaryCards({ stats }: Props) {
  return (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Funds Raised</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalFunds}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Consistent growth <IconCash className="size-4" />
          </div>
          <div className="text-muted-foreground">Across all campaigns</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Campaigns</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeCampaigns}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCheck />
              Verified
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Running smoothly <IconCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">Campaigns currently live</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Donors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.donors}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Growing support <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">Across all regions</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.completionRate}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Stable
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Reliable delivery <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Campaigns reaching goals</div>
        </CardFooter>
      </Card>
    </div>
  );
}
