//components/NgoSignupForm.tsx
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

export default function NgoSignupForm({ supabase, setError }: Props) {
  const [orgName, setOrgName] = useState("");
  const [ssmNumber, setSsmNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Fixed SSM verification using your working endpoint
  const verifySsmNumber = async (ssm: string): Promise<boolean> => {
    const normalized = ssm.trim();

    try {
      const url = new URL(
        "https://68f342dafd14a9fcc4283dd6.mockapi.io/ngos/ngos-verification"
      );
      url.searchParams.append("ssmNumber", normalized);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!res.ok) {
        console.error("Network error:", res.status);
        return false;
      }

      const data = await res.json();
      console.log("Fetched data for verification:", data);

      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.error("SSM verification failed:", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!email.includes("@")) return setError("Invalid email format.");
  if (password.length < 8) return setError("Password must be at least 8 characters.");
  if (password !== confirmPassword) return setError("Passwords do not match.");

  setLoading(true);

  // ✅ Verify SSM first
  const isValidSsm = await verifySsmNumber(ssmNumber);
  if (!isValidSsm) {
    setError("SSM number is invalid or not registered.");
    setLoading(false);
    return;
  }

  try {
    // ✅ Sign up NGO
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: orgName,
          ssmNumber,
          role: "ngo",
        },
      },
    });

    if (error) throw error;

    const user = data?.user;
    if (!user?.id) throw new Error("User not returned after signup");

    const { id, email: userEmail, user_metadata } = user;
    const role = user_metadata?.role ?? "ngo";
    const displayName = user_metadata?.name ?? orgName ?? "Anonymous";

    // ✅ Insert via secure API route (bypasses RLS)
    const registerRes = await fetch("/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: displayName,
        email: userEmail,
        role,
        ssm_number: ssmNumber,
      }),
    });

    if (!registerRes.ok) {
      const { error: registerError } = await registerRes.json();
      throw new Error(registerError || "User registration failed");
    }

    // ✅ Trigger wallet setup
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
        <Label className="mb-2" htmlFor="orgName">
          Organization Name
        </Label>
        <Input
          id="orgName"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Helping Hands Foundation"
          required
        />
        {orgName.trim().length > 0 && orgName.trim().length < 5 && (
          <p className="text-sm text-red-600 mt-1">Name is required.</p>
        )}
      </div>

      <div>
        <Label className="mb-2" htmlFor="ssm">
          SSM Number
        </Label>
        <Input
          id="ssm"
          value={ssmNumber}
          onChange={(e) => setSsmNumber(e.target.value)}
          placeholder="e.g. 1234567-X"
          required
        />
        {ssmNumber.length < 12 && ssmNumber.length > 0 && (
          <p className="text-sm text-red-600 mt-1">
            SSM Number must be 12 characters.
          </p>
        )}
      </div>

      <div>
        <Label className="mb-2" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
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
        <Label className="mb-2" htmlFor="password">
          Password
        </Label>
        <Input
          id="password"
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

      <div>
        <Label className="mb-2" htmlFor="confirmPassword">
          Re-enter Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          required
        />
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <p className="text-sm text-red-600 mt-1">
            Passwords do not match.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
