'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { NgoUser } from '@/types/ngo'; 
// ✅ Import the necessary hook to manage the subscription lifecycle
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription"; 

interface NgoUserContextType {
  user: NgoUser;
  isLoading: boolean;
}

const NgoUserContext = createContext<NgoUserContextType | undefined>(undefined);

interface NgoUserProviderProps {
  initialUser: NgoUser; 
  children: ReactNode;
}

export const NgoUserProvider = ({ initialUser, children }: NgoUserProviderProps) => {
  // 1. State Management
  // The 'user' state is what the hook will update instantly
  const [user, setUser] = useState<NgoUser>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Sync with Server Props
  // Ensures local state updates when the parent Layout fetches new data (e.g., after navigation)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // 3. Attach Realtime Logic
  // The useRealtimeSubscription hook manages the useEffect, the channel, 
  // and the payload parsing outside of this file.
  useRealtimeSubscription(user, setUser);

  return (
    <NgoUserContext.Provider value={{ user, isLoading }}>
      {children}
    </NgoUserContext.Provider>
  );
};

export const useNgoUser = () => {
  const context = useContext(NgoUserContext);
  if (context === undefined) {
    throw new Error('useNgoUser must be used within a NgoUserProvider');
  }
  return context;
};