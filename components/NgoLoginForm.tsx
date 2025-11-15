//components/NgoLoginForm.tsx
"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  supabase: SupabaseClient;
  next: string | null;
  setError: (msg: string | null) => void;
}

export default function NgoLoginForm({ supabase, next, setError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      router.push(next || "/ngo/dashboard");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="ngo-email">Email</Label>
        <Input
          id="ngo-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        {!email.includes("@") && email.length > 0 && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid email address.
          </p>
        )}
      </div>

      <div>
        <Label className="mb-2" htmlFor="ngo-password">Password</Label>
        <Input
          id="ngo-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />
        {password.length > 0 && password.length < 8 && (
          <p className="text-sm text-red-600 mt-1">
            Password must be at least 8 characters.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
