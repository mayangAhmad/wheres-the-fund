"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ConnectRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Wait a moment then redirect back to dashboard
    const timeout = setTimeout(() => {
      router.push("/ngo/dashboard");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="text-gray-600">Refreshing connection settings...</p>
    </div>
  );
}