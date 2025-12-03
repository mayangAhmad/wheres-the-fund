'use client'

import React, { createContext, useContext, useState } from "react";
import { DonorUser } from "@/lib/auth/mapToDonorUser";

interface DonorUserContextType {
  user: DonorUser | null;
  isLoading: boolean;
  // Add method to update user if needed (e.g. after editing profile)
  updateUser: (updates: Partial<DonorUser>) => void;
}

const DonorUserContext = createContext<DonorUserContextType | undefined>(undefined);

export function DonorUserProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: DonorUser 
}) {
  const [user, setUser] = useState<DonorUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = (updates: Partial<DonorUser>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <DonorUserContext.Provider value={{ user, isLoading, updateUser }}>
      {children}
    </DonorUserContext.Provider>
  );
}

// Custom hook for easy access
export function useDonorUser() {
  const context = useContext(DonorUserContext);
  if (context === undefined) {
    throw new Error("useDonorUser must be used within a DonorUserProvider");
  }
  return context;
}