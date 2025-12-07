# Quick Fix Guide - Implementation Examples

This guide provides ready-to-use code snippets to fix the identified issues.

---

## 1. Fix Type Safety Issues

### Create Proper Type Definitions

**File: `types/dashboard.ts`**
```typescript
export interface MilestoneReview {
  id: string;
  milestone_index: number;
  title: string;
  campaign_id: string;
  description: string;
  proof_description: string;
  proof_images: string[];
  proof_invoices: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  campaigns: {
    id: string;
    title: string;
    ngo_name: string;
    escrow_balance: number;
    ngo_id: string;
  };
}

export interface AdminDashboardClientProps {
  initialReviews: MilestoneReview[];
}
```

### Update AdminDashboardClient.tsx

```tsx
"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 
import Image from "next/image";
import type { MilestoneReview, AdminDashboardClientProps } from "@/types/dashboard";

export default function AdminDashboardClient({ initialReviews }: AdminDashboardClientProps) {
  const [reviews, setReviews] = useState<MilestoneReview[]>(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDecision = async (milestone: MilestoneReview, decision: 'approve' | 'reject') => {
    const action = decision === 'approve' ? "Release funds" : "Reject proof";
    if (!confirm(`${action}?`)) return;

    setProcessingId(milestone.id);
    const toastId = toast.loading("Processing...");

    try {
      const res = await fetch("/api/admin/milestones/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          milestoneId: milestone.id, 
          campaignId: milestone.campaign_id,
          decision: decision 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      toast.dismiss(toastId);
      toast.success(decision === 'approve' ? "Funds Released!" : "Proof Rejected");
      
      setReviews(prev => prev.filter(r => r.id !== milestone.id));
    } catch (error) {
      toast.dismiss(toastId);
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    // ... JSX remains the same but now with proper types
    <div>Dashboard content</div>
  );
}
```

---

## 2. Fix Navbar Event Listeners

**File: `components/navbar/Navbar.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import createClient from "@/lib/supabase/client";
import AuthButton from "../auth/auth-button";

interface MenuItem {
  title: string;
  url: string;
}

export default function Nav() {
  const [dashboardUrl, setDashboardUrl] = useState("/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user role once on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role || "donor";
        setDashboardUrl(role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard");
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };
    
    fetchUserRole();
  }, []);

  // Handle escape key and overflow separately
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    // Set overflow on open
    document.body.style.overflow = "hidden";

    // Add single event listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    // Cleanup: remove listener and restore overflow
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const NAV_MENU_ITEMS: MenuItem[] = [
    { title: "Home", url: "/" },
    { title: "Campaigns", url: "/campaigns" },
    { title: "Verified?", url: "/ngos" },
    { title: "Dashboard", url: dashboardUrl },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Navigation content */}
      </div>
    </header>
  );
}
```

---

## 3. Fix CampaignsContext Realtime Subscription

**File: `context/CampaignsContext.tsx`**

```tsx
'use client'
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import createClient from '@/lib/supabase/client'
import type { Campaign } from '@/context/CampaignsContext'

interface CampaignsContextType {
  campaigns: Campaign[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchAllOngoingCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'Ongoing')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAllOngoingCampaigns();

    const channel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          // ✅ Selective updates instead of full refetch
          if (payload.eventType === 'INSERT') {
            const newCampaign = payload.new as Campaign;
            if (newCampaign.status === 'Ongoing') {
              setCampaigns(prev => [newCampaign, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCampaign = payload.new as Campaign;
            setCampaigns(prev =>
              prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
                .filter(c => c.status === 'Ongoing')
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setCampaigns(prev => prev.filter(c => c.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllOngoingCampaigns, supabase]);

  const contextValue = useMemo(() => ({
    campaigns,
    loading,
    refetch: fetchAllOngoingCampaigns,
  }), [campaigns, loading, fetchAllOngoingCampaigns]);

  return (
    <CampaignsContext.Provider value={contextValue}>
      {children}
    </CampaignsContext.Provider>
  );
};
```

---

## 4. Fix Image Lazy Loading in CampaignCard

**File: `components/campaigns/CampaignCard.tsx`**

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/context/CampaignsContext'; 
import wsrvLoader from '@/lib/services/image-service';

interface CampaignCardProps {
  campaign: Campaign;
  priority?: boolean; // Add priority prop
}

const getDaysLeft = (endDateString: string | null): string => {
  if (!endDateString) return 'No Deadline';
  const now = new Date();
  const end = new Date(endDateString);
  const diffTime = end.getTime() - now.getTime();
  
  if (diffTime <= 0) return 'Ended';
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
};

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, priority = false }) => {
  const collected = Number(campaign.collected_amount) || 0;
  const goal = Number(campaign.goal_amount) || 0;
  const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;
  const daysLeft = getDaysLeft(campaign.end_date);

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="relative w-full h-40 shrink-0 overflow-hidden">
        <Image
          loader={wsrvLoader}
          src={campaign.image_url || '/placeholder.jpg'}
          alt={campaign.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority} // ✅ Only prioritize first few cards
          quality={75}
          loading={priority ? 'eager' : 'lazy'} // ✅ Explicit loading strategy
        />
      </div>

      {/* Rest of the component */}
    </Link>
  );
};

export default CampaignCard;
```

---

## 5. Fix Metadata Type in Layout

**File: `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Outfit, Manrope } from "next/font/google";
import "./globals.css";
import { CampaignsProvider } from "@/context/CampaignsContext";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit" 
});

const manrope = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope" 
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"), // ✅ Fixed: URL object instead of string
  title: "WheresTheFund | Transparent Funds Tracking",
  description: "Blockchain-powered donation tracking system.",
  openGraph: {
    title: "WheresTheFund",
    description: "Track every cent of your donation on the blockchain.",
    siteName: "WheresTheFund",
    images: [
      {
        url: "/wtf.svg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
        ${inter.variable} 
        ${jakarta.variable} 
        ${outfit.variable} 
        ${manrope.variable} 
        antialiased
        font-sans
      `}>
        <CampaignsProvider> 
          <main>{children}</main>
        </CampaignsProvider>
      </body>
    </html>
  );
}
```

---

## 6. Create Error Handling Utility

**File: `lib/utils/error.ts`**

```typescript
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message);
  }
  
  return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
};

export const logError = (error: unknown, context?: string) => {
  const apiError = handleError(error);
  console.error(
    `[${context || 'ERROR'}] ${apiError.code}: ${apiError.message}`
  );
  // TODO: Send to error tracking service (Sentry, etc.)
};
```

---

## 7. Add Input Validation Utility

**File: `lib/validation/donationValidation.ts`**

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateDonationAmount = (amount: string): ValidationResult => {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (num < 1) {
    return { valid: false, error: 'Minimum donation is RM 1' };
  }

  if (num > 1000000) {
    return { valid: false, error: 'Amount cannot exceed RM 1,000,000' };
  }

  return { valid: true };
};

export const validateCampaignId = (id: string): ValidationResult => {
  if (!id || id.trim() === '') {
    return { valid: false, error: 'Campaign ID is required' };
  }

  return { valid: true };
};
```

---

## 8. Update DonationModal with Validation

**File: `components/donation/DonationModal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { X, ArrowLeft, AlertCircle } from "lucide-react";
import CheckoutForm from "./CheckoutForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { validateDonationAmount, validateCampaignId } from "@/lib/validation/donationValidation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface DonationModalProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ campaignId, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceedToPayment = async () => {
    setError(null);

    // ✅ Validate inputs
    const campaignValidation = validateCampaignId(campaignId);
    if (!campaignValidation.valid) {
      setError(campaignValidation.error);
      return;
    }

    const amountValidation = validateDonationAmount(amount);
    if (!amountValidation.valid) {
      setError(amountValidation.error);
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Number(amount),
          campaignId: campaignId,
        }), 
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Payment initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Make a Donation</DialogTitle>
            
            {clientSecret && (
              <button 
                onClick={() => {
                  setClientSecret("");
                  setError(null);
                }} 
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Change Amount
              </button>
            )}
          </div>
        </DialogHeader>
        
        {!clientSecret ? (
          <div className="space-y-6 pt-4">
            {/* Error message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Preset Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {["5", "10", "20", "50", "100"].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setAmount(val);
                    setError(null);
                  }}
                  className={`py-2 rounded-lg border font-medium transition-all ${
                    amount === val
                      ? "border-orange-600 bg-orange-50 text-orange-700"
                      : "border-gray-300 hover:border-orange-300"
                  }`}
                >
                  RM {val}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <Input
              type="number"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              min="1"
              className="text-center"
            />

            {/* Proceed Button */}
            <Button 
              onClick={handleProceedToPayment}
              disabled={isLoading || !amount}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Processing..." : `Proceed to Payment`}
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={Number(amount)} />
            </Elements>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 9. Remove Console.log from Production

**File: `context/CampaignsContext.tsx`**

```tsx
// Remove or replace this line:
// ❌ console.log('Realtime change detected, refetching all campaigns:', payload.eventType)

// ✅ Option 1: Remove entirely (if not needed for debugging)
// ✅ Option 2: Replace with proper logging
if (process.env.NODE_ENV === 'development') {
  console.log('Realtime change detected, refetching all campaigns:', payload.eventType);
}
```

Also remove from `app/(app)/ngo/campaigns/[id]/page.tsx`:
```tsx
// ❌ console.log(campaign.ngo_id)
// ✅ Remove this line
```

---

## Implementation Priority

1. **Week 1:** Fix type safety (any types), metadata, console.log
2. **Week 2:** Fix event listeners, refetch patterns
3. **Week 3:** Add validation, error handling utility
4. **Week 4:** Image optimization, performance tuning

