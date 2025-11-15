"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Menu } from "lucide-react";
import createClient from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import AuthButton from "./auth-button";

interface MenuItem {
  title: string;
  url: string;
}

export default function Nav() {
  const [dashboardUrl, setDashboardUrl] = useState("/");

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || "donor";
      setDashboardUrl(role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard");
    };

    fetchUserRole();
  }, []);

  const NAV_MENU_ITEMS: MenuItem[] = [
    { title: "Home", url: "/" },
    { title: "Campaigns", url: "/campaigns" },
    { title: "Dashboard", url: dashboardUrl },
  ];

  return (
    <header className="sticky top-0 z-50 p-4 border-b bg-background">
      <div className="container mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Logo />
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {NAV_MENU_ITEMS.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <AuthButton />
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  {NAV_MENU_ITEMS.map((item) => renderMobileMenuItem(item))}
                  <AuthButton />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="/wtf-logo.svg"
      alt="Your Logo"
      width={128}
      height={40}
    />
  </Link>
);

const renderMenuItem = (item: MenuItem) => (
  <NavigationMenuItem key={item.title}>
    <NavigationMenuLink
      href={item.url}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
    >
      {item.title}
    </NavigationMenuLink>
  </NavigationMenuItem>
);

const renderMobileMenuItem = (item: MenuItem) => (
  <Link key={item.title} href={item.url} className="text-md font-semibold">
    {item.title}
  </Link>
);
