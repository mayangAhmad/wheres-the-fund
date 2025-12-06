# Step-by-Step Fix Instructions

This document provides exact, copy-paste solutions for the most critical issues.

---

## Fix 1: Remove Console.log Statements (5 minutes)

### File: `context/CampaignsContext.tsx`

**BEFORE (Line 67):**
```tsx
console.log('Realtime change detected, refetching all campaigns:', payload.eventType)
```

**AFTER:**
```tsx
// Removed in production - enable only for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Realtime change detected, refetching all campaigns:', payload.eventType)
}
```

---

### File: `app/(app)/ngo/campaigns/[id]/page.tsx`

**BEFORE:**
```tsx
console.log(campaign.ngo_id)
```

**AFTER:**
```tsx
// Removed console.log
```

---

## Fix 2: Fix Metadata Type (2 minutes)

### File: `app/layout.tsx`

**BEFORE (Line 28):**
```tsx
export const metadata: Metadata = {
  metadataBase: "http://localhost:3000", // ❌ String - Wrong type
  title: "WheresTheFund | Transparent Funds Tracking",
```

**AFTER:**
```tsx
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"), // ✅ Correct type
  title: "WheresTheFund | Transparent Funds Tracking",
```

---

## Fix 3: Fix Navbar Event Listener (15 minutes)

### File: `components/navbar/Navbar.tsx`

**Replace the entire section from line 19-46 with:**

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

  // Fetch user role - memoized client creation
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

  // Handle escape key and body overflow
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    // Set overflow on menu open
    document.body.style.overflow = "hidden";

    // Single event listener for escape key
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
        {/* Rest of your nav code */}
      </div>
    </header>
  );
}
```

---

## Fix 4: Create Type Definitions (20 minutes)

### New File: `types/dashboard.ts`

Create this new file:

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

### File: `components/admin-dashboard/AdminDashboardClient.tsx`

**BEFORE (Lines 1-12):**
```tsx
"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 
import Image from "next/image";

// Add props interface
interface AdminDashboardClientProps {
  initialReviews: any[];
}
```

**AFTER:**
```tsx
"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 
import Image from "next/image";
import type { MilestoneReview, AdminDashboardClientProps } from "@/types/dashboard";
```

**BEFORE (Line 15):**
```tsx
export default function AdminDashboardClient({ initialReviews }: AdminDashboardClientProps) {
  // Initialize state with the server data
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);
```

**AFTER:**
```tsx
export default function AdminDashboardClient({ initialReviews }: AdminDashboardClientProps) {
  // Initialize state with the server data
  const [reviews, setReviews] = useState<MilestoneReview[]>(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);
```

**BEFORE (Line 21):**
```tsx
  const handleDecision = async (milestone: any, decision: 'approve' | 'reject') => {
```

**AFTER:**
```tsx
  const handleDecision = async (milestone: MilestoneReview, decision: 'approve' | 'reject') => {
```

**BEFORE (Lines 48):**
```tsx
    } catch (error: any) {
        toast.dismiss(toastId);
        toast.error(error.message);
```

**AFTER:**
```tsx
    } catch (error) {
        toast.dismiss(toastId);
        const message = error instanceof Error ? error.message : "An error occurred";
        toast.error(message);
```

---

## Fix 5: Add Input Validation (25 minutes)

### New File: `lib/validation/donationValidation.ts`

Create this new file:

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

### File: `components/donation/DonationModal.tsx`

**Add import at top (line 1):**
```tsx
import { validateDonationAmount, validateCampaignId } from "@/lib/validation/donationValidation";
import { AlertCircle } from "lucide-react";
```

**Replace handleProceedToPayment function (around line 27):**

```tsx
const handleProceedToPayment = async () => {
  setError(null);

  // ✅ Validate campaign ID
  const campaignValidation = validateCampaignId(campaignId);
  if (!campaignValidation.valid) {
    setError(campaignValidation.error);
    return;
  }

  // ✅ Validate amount
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
```

**Add error display in JSX (inside the dialog content):**

```tsx
{!clientSecret ? (
  <div className="space-y-6 pt-4">
    {/* ✅ Add error message display */}
    {error && (
      <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )}

    {/* Rest of JSX */}
  </div>
) : (
  // ...
)}
```

---

## Fix 6: Optimize Image Loading (10 minutes)

### File: `components/campaigns/CampaignCard.tsx`

**Add priority prop (line 8):**

```tsx
interface CampaignCardProps {
  campaign: Campaign;
  priority?: boolean; // ✅ Add this
}
```

**Update component function (line 24):**

```tsx
const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, priority = false }) => {
```

**Update Image component (lines 42-49):**

```tsx
<Image
  loader={wsrvLoader}
  src={campaign.image_url || '/placeholder.jpg'}
  alt={campaign.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  priority={priority} // ✅ Use prop instead of always true
  quality={75}
  loading={priority ? 'eager' : 'lazy'} // ✅ Add explicit loading strategy
/>
```

**Update parent component usage:**

For `HeroCampaignCarousel.tsx`, update line 81:

```tsx
<div
  key={`${campaign.id}-${i}`}
  className="shrink-0 w-full sm:w-[calc((100%-40px)/3)]"
  aria-hidden={!isVisible}
>
  <CampaignCard 
    campaign={campaign} 
    priority={i < 3} // ✅ Only first 3 cards are prioritized
  />
</div>
```

---

## Fix 7: Optimize CampaignsContext (30 minutes)

### File: `context/CampaignsContext.tsx`

**Replace the realtime subscription section (lines 54-72) with:**

```tsx
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
```

---

## Priority Order for Application

1. **Fix 1 + 2** (5 min) - Quick wins, no side effects
2. **Fix 3** (15 min) - Fixes memory leak
3. **Fix 4** (20 min) - Improves type safety
4. **Fix 5** (25 min) - Better UX and validation
5. **Fix 6** (10 min) - Performance improvement
6. **Fix 7** (30 min) - Major performance boost

**Total Time:** ~105 minutes (less than 2 hours)

---

## Testing After Fixes

```bash
# Build to check for TypeScript errors
npm run build

# Run dev server
npm run dev

# Check for console warnings
# Open DevTools → Console tab

# Test Navbar
# - Open menu on mobile
# - Press Escape key
# - Check if menu closes

# Test Donation Flow
# - Try to donate with invalid amount
# - Check error messages display

# Performance check
# - Open DevTools → Performance tab
# - Record while loading campaign list
# - Check for memory leaks
```

---

## Verification Checklist

- [ ] No TypeScript errors in build
- [ ] No console.log in production
- [ ] No `any` types in dashboard components
- [ ] Donation form validates input
- [ ] Navbar listens to escape key once
- [ ] Images load with proper priority
- [ ] Campaign context updates selectively
- [ ] All tests pass

---

## If You Get Stuck

Refer back to:
1. **CODEBASE_ANALYSIS.md** - Full explanation of each issue
2. **QUICK_FIX_GUIDE.md** - Alternative implementations
3. **OPTIMIZATION_SUMMARY.md** - Overview and strategy

