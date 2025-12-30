"use client";

import createClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Admin logged out successfully");
      
      // Redirect to home or login page
      router.push("/");
      router.refresh(); // Clears any cached server-side auth states
    } catch (error: any) {
      toast.error("Logout failed: " + error.message);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
    >
      <LogOut className="h-5 w-5" />
      Logout
    </Button>
  );
}