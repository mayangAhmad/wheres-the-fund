"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js"; // ✅ import correct type
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/GoogleIcon";

interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
}

export default function GoogleLoginButton({ supabase, next, setError }: Props) {
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError("Error logging in with Google. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Button
      variant="outline"
      className=" w-full flex justify-center items-center gap-2"
      onClick={loginWithGoogle}
      disabled={loading}
    >
      {loading ? <LoaderCircle className="animate-spin size-5" /> : <GoogleIcon />}
      Continue with Google
    </Button>
    
    <div className="flex items-center gap-2 my-4">
        <span className="flex-grow h-px bg-gray-300" />
        <span className="text-gray-500 text-sm">or</span>
        <span className="flex-grow h-px bg-gray-300" />
        </div>

    </>


  );
}
