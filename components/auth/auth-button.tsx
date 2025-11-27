"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import createClient from "@/lib/supabase/client";
import { LOGIN_PATH } from "@/constants/common";
import { ArrowRightIcon, LogOut, Loader2 } from "lucide-react";
import useUser from "@/hooks/useUser";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className }: AuthButtonProps) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const supabase = createClient();

  const baseStyles = cn(
    "relative inline-flex items-center justify-center h-10 px-6 py-2",
    "text-sm font-semibold tracking-wide transition-all duration-300 ease-out",
    "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "active:scale-95", // Click effect
    className
  );

  if (pathname === LOGIN_PATH) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = LOGIN_PATH;
  };

  
  if (loading) {
    return (
      <button
        disabled
        className={cn(
          baseStyles,
          "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className={cn(
          baseStyles,
          "bg-blue-50", // Light red background
          "hover:bg-blue-950 hover:text-white", // Fills solid red on hover
        )}
      >
        <span>Logout</span>
        <LogOut className="ml-2 w-4 h-4 transition-transform group-hover:rotate-12" />
      </button>
    );
  }

   return (
    <Link
      href={LOGIN_PATH}
      className={cn(
        baseStyles,
        "bg-blue-50", // Light red background
          "hover:bg-blue-950 hover:text-white", // Fills solid red on hover
        )}
    >
      <span>Login</span>
      <ArrowRightIcon
        className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}