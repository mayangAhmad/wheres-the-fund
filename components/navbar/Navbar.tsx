"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import createClient from "@/lib/supabase/client";
import AuthButton from "../auth/auth-button";

interface MenuItem {
  title: string;
  url: string;
}

export default function Nav() {
  const [dashboardUrl, setDashboardUrl] = useState("/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user role once on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role || "donor";
        setDashboardUrl(role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard");
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };
    
    fetchUserRole();
  }, []);

  // Handle escape key and overflow separately
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    // Set overflow on open
    document.body.style.overflow = "hidden";

    // Add single event listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    // Cleanup: remove listener and restore overflow
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const NAV_MENU_ITEMS: MenuItem[] = [
    { title: "Home", url: "/" },
    { title: "Campaigns", url: "/campaigns" },
    { title: "Verified NGOs", url: "/ngos" },
    { title: "Dashboard", url: dashboardUrl },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      {/* Added 'relative' here so the absolute positioning of the nav works relative to this container */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        
        <Logo />

        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {NAV_MENU_ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="tracking-widest group px-4 py-2 text-md text-blue-950 transition-colors hover:text-orange-500"
            >
              <span className="relative">
                {item.title}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-orange-500 transition-all duration-300 ease-out group-hover:w-full" />
              </span>
            </Link>
          ))}
        </nav>

        {/* 3. RIGHT: Auth & Mobile Trigger */}
        <div className="flex items-center gap-4">
          
          {/* Desktop Auth */}
          <div className="hidden lg:block">
            <AuthButton />
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden" 
          role="dialog" 
          aria-modal="true" 
          id="mobile-menu"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true" 
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-[75%] max-w-sm bg-background shadow-xl border-l p-6 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col h-full gap-6"> 
              
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {NAV_MENU_ITEMS.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold py-2 border-b border-border hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>

              <div onClick={() => setIsMobileMenuOpen(false)}>
                <AuthButton className="w-full justify-center" /> 
              </div>
              
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="/wtf-logo.svg"
      alt="WheresTheFund Logo"
      width={150}
      height={40}
      className="w-32 h-auto"
      priority
    />
  </Link>
);