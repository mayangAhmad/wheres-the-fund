//components/admin-dashboard/AdminSidebar.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Clock,
  Settings 
} from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    href: "/admin/campaigns",
    icon: FileText,
  },
  {
    title: "Deadlines",
    href: "/admin/deadlines",
    icon: Clock,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white flex flex-col md:flex">
      {/* 1. Logo Area */}


      
      <div className="flex h-16 items-center border-b px-6">
             <Image
            src="/wtf-logo.svg"
            alt="WheresTheFund Logo"
            width={150}
            height={40}
            className="w-32 h-auto"
            priority
          />
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer with Logout */}
      <div className="border-t p-4">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}