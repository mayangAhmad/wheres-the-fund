//components/admin-dashboard/AdminLogoutButton.tsx

"use client";

import { LogOut } from "lucide-react";
import createClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Force a hard refresh to clear all browser states
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
        "text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      <span>Sign Out</span>
    </button>
  );
}