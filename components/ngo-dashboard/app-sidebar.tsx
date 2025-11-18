"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSettings,
  IconBellRinging2,
  IconCash,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/ngo-dashboard/nav-documents";
import { NavMain } from "@/components/ngo-dashboard/nav-main";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import WalletDisplay from "./WalletDisplay";

const navData = {
  navMain: [
    { title: "Dashboard", url: "/ngo/dashboard", icon: IconDashboard },
    { title: "My campaigns", url: "/ngo/campaigns", icon: IconListDetails },
    { title: "Notifications", url: "/ngo/notifications", icon: IconBellRinging2 },
    { title: "Withdraw funds", url: "/ngo/withdraw", icon: IconCash },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
  ],
  documents: [{ name: "Reports", url: "#", icon: IconReport }],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    wallet_address: string;
    campaigns?: unknown[];
  };
  onNavigate?: (view: string) => void;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-4 px-4 py-2">
          <Image
            src="/placeholder.jpg"
            alt="Organization Logo"
            width={48}
            height={48}
            className="rounded-full border border-gray-300 w-12 h-12"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-md text-gray-800">{user.name}</span>
            <span>
              <WalletDisplay address={user.wallet_address} />
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavDocuments items={navData.documents} />
      </SidebarContent>
    </Sidebar>
  );
}
