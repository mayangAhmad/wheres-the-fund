"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  supabase: SupabaseClient;
  setError: (msg: string | null) => void;
}

export default function DonorSignupForm({ supabase, setError }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!email.includes("@")) return setError("Invalid email format.");
  if (password.length < 8) return setError("Password must be at least 8 characters.");
  if (password !== confirmPassword) return setError("Passwords do not match.");

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "donor" },
      },
    });
    if (error) throw error;

    const user = data?.user;
    if (!user?.id) throw new Error("User not returned after signup");

    const { id, email: userEmail, user_metadata } = user;
    const role = user_metadata?.role ?? "donor";
    const displayName = user_metadata?.name ?? name ?? "Anonymous";

    //Add user to the supabase via api route
    const registerRes = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: displayName,
        email: userEmail,
        role,
      }),
    });

    if (!registerRes.ok) {
      const { error: registerError } = await registerRes.json();
      throw new Error(registerError || "User registration failed");
    }

    //wallet setup
    await fetch("/api/user/setup-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });

    router.push("/auth/login");
    
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as { message?: string }).message
        : "Unexpected error";
    setError(message || "error");
  } finally {
    setLoading(false);
  }
};




  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="name">Your Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
         {name.trim().length > 0 && name.trim().length < 5  && (
          <p className="text-sm text-red-600 mt-1">Name is required.</p>
        )}
      </div>

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

      <div>
        <Label className="mb-2" htmlFor="confirmPassword">Re-enter Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          required
        />
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <p className="text-sm text-red-600 mt-1">Passwords do not match.</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
