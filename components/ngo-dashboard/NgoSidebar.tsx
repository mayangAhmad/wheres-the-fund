"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useNgoUser } from "@/context/NgoUserContext";
import { Home, Heart, Bell, Settings, PlusCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

// Define the Props this component now needs
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const sidebarLinks = [
  { name: "Dashboard", href: "/ngo/dashboard", icon: Home },
  { name: "My Campaigns", href: "/ngo/campaigns", icon: Heart },
  { name: "Notifications", href: "/ngo/notifications", icon: Bell },
  { name: "Settings", href: "/ngo/settings", icon: Settings },
];

export default function NgoSidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useNgoUser();

  // Dynamic Width Class
  const sidebarWidth = isCollapsed ? "w-20" : "w-64";

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-[#182F44] text-white flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out z-20`}
    >
      
      {/* 1. Header / Logo */}
      <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? "justify-center" : "gap-3"} h-[88px]`}>
        <div className="relative h-10 w-10 shrink-0">
          <Image 
            src={"/placeholder.jpg"} 
            alt={user?.name || "Org"}
            fill
            className="rounded-full object-cover border-2 border-white/10"
            priority
          />
        </div>
        
        {/* Hide Text when Collapsed */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <h1 className="text-sm font-bold tracking-tight truncate" title={user?.name}>
                  {user?.name || "Loading..."}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Dashboard</p>
          </div>
        )}
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        
        {/* Publish Button */}
        <Link 
          href="/ngo/campaigns/create"
          className={`flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-3 rounded-lg transition-all mb-6 font-medium whitespace-nowrap
            ${pathname === "/ngo/campaigns/create" 
              ? "bg-orange-600 text-white shadow-md" 
              : "bg-white/10 hover:bg-orange-500 text-white"}
          `}
          title={isCollapsed ? "Publish Campaign" : ""}
        >
          <PlusCircle size={20} />
          {!isCollapsed && <span className="ml-3 animate-in fade-in duration-200">Publish Campaign</span>}
        </Link>

        {/* Links */}
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href; 
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-3 rounded-lg transition-colors whitespace-nowrap
                ${isActive 
                  ? "bg-white/20 text-white font-semibold" 
                  : "text-gray-300 hover:bg-white/10 hover:text-white" 
                }
              `}
              title={isCollapsed ? link.name : ""}
            >
              <link.icon size={20} />
              {!isCollapsed && <span className="ml-3 animate-in fade-in duration-200">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Collapse Toggle */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <button className={`flex items-center ${isCollapsed ? "justify-center" : "px-4"} py-3 w-full rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors`}>
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3 animate-in fade-in">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}