"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/navbar/Navbar";
import NgoSidebar from "./NgoSidebar";

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Initialize state (default to false/expanded)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Optional: Save preference to localStorage so it remembers user choice
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Sidebar (Controlled) */}
      <NgoSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* 2. Main Content */}
      <main 
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "pl-20" : "pl-64"} 
        `}
      >
        
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
           <Nav />
        </div>

        <div className="p-8 flex-1">
          {children}
        </div>
        
      </main>
    </div>
  );
}