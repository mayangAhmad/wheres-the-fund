"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Heart, Bell, Settings, PlusCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useDonorUser } from "@/context/DonorUserContext";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const sidebarLinks = [
  { name: "Home", href: "/donor/dashboard", icon: Home },
  { name: "My History", href: "/donor/history", icon: Heart },
  { name: "Notifications", href: "/donor/notifications", icon: Bell },
  { name: "Settings", href: "/donor/settings", icon: Settings },
];

export default function DonorSidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useDonorUser();

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";
  const profileImage = "/placeholder.jpg"; 

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-[#182F44] text-white flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out z-20`}
    >
      
      {/* 1. Header / Logo */}
      <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? "justify-center" : "gap-3"} h-[88px]`}>
        
        {/* Profile Image Container */}
        <Link href="/ngo/settings">
        <div className="relative h-10 w-10 shrink-0">
          <Image 
            src={profileImage} 
            alt={user?.name || "Org"}
            fill
            sizes="40px"
            className="rounded-full object-cover border-2 border-white/10"
            priority
          />
        </div>
        </Link>
        
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        

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