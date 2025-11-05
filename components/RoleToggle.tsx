"use client";

import { Button } from "@/components/ui/button";

interface RoleToggleProps {
  role: "donor" | "ngo";
  setRole: (role: "donor" | "ngo") => void;
}

export default function RoleToggle({ role, setRole }: RoleToggleProps) {
  return (
    <div className="flex justify-center gap-4 mb-12">
      <Button
        variant={role === "donor" ? "default" : "outline"}
        onClick={() => setRole("donor")}
      >
        Donor
      </Button>
      <Button
        variant={role === "ngo" ? "default" : "outline"}
        onClick={() => setRole("ngo")}
      >
        NGO
      </Button>
    </div>
  );
}
