"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
}

export default function DonorLoginForm({ supabase, next, setError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userRole = data.user?.user_metadata?.role || "donor";
      const dashboardPath = userRole === "ngo" ? "/ngo/dashboard" : "/donor/dashboard";
      router.push(next || dashboardPath);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : "An unexpected error occurred.";
      setError(message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailSignin} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        {!email.includes("@") && email.length > 0 && (
          <p className="text-sm text-red-600 mt-1">Please enter a valid email address.</p>
        )}
      </div>

      <div>
        <Label className="mb-2" htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />
        {password.length > 0 && password.length < 8 && (
          <p className="text-sm text-red-600 mt-1">Password must be at least 8 characters.</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
