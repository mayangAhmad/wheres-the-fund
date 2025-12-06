# Codebase Analysis & Optimization Report
## WheresTheFund - Where's The Fund

**Generated:** December 3, 2025

---

## 🔴 CRITICAL ISSUES

### 1. **Type Safety: Excessive Use of `any` Type**
**Severity:** HIGH  
**Files Affected:**
- `AdminDashboardClient.tsx` (lines 11, 21, 48)
- `CampaignManagerClient.tsx` (lines 17-18, 25)
- `UpdateMilestoneModal.tsx` (line 18, 95)
- `NgoProfileView.tsx` (line 167)
- `HIstoryClientView.tsx` (line 20)
- `HeroCampaignCarousel.tsx` (line 12)
- `HomeHero2.tsx` (line 9)

**Impact:** Removes TypeScript's type checking, leading to runtime errors, harder debugging, and security vulnerabilities.

**Recommendation:**
```typescript
// ❌ BEFORE
interface AdminDashboardClientProps {
  initialReviews: any[];
}

// ✅ AFTER
interface MilestoneReview {
  id: string;
  milestone_index: number;
  title: string;
  campaign_id: string;
  proof_description: string;
  proof_images?: string[];
  proof_invoices?: string[];
  campaigns?: {
    title: string;
    escrow_balance: number;
    ngo_name: string;
  };
}

interface AdminDashboardClientProps {
  initialReviews: MilestoneReview[];
}
```

---

### 2. **Supabase Client Created Inside useEffect (Performance Issue)**
**Severity:** MEDIUM  
**File:** `components/navbar/Navbar.tsx` (line 19-23)

**Issue:** `createClient()` is called inside `useEffect` without dependency, causing recreations on every render.

**Current Code:**
```tsx
useEffect(() => {
  const fetchUserRole = async () => {
    const supabase = createClient(); // ❌ New client instance each time
    // ...
  };
  fetchUserRole();
}, []); // Missing dependency
```

**Recommendation:**
```tsx
useEffect(() => {
  const supabase = createClient();
  const fetchUserRole = async () => {
    // ...
  };
  fetchUserRole();
}, []); // Move client creation outside callback
```

---

### 3. **Memory Leak: Event Listener Not Properly Cleaned Up**
**Severity:** MEDIUM  
**File:** `components/navbar/Navbar.tsx` (lines 35-46)

**Issue:** Event listeners added multiple times and cleanup might not prevent duplicate listeners.

**Current Code:**
```tsx
useEffect(() => {
  if (isMobileMenuOpen) {
    window.addEventListener("keydown", handleKeyDown); // ❌ Could add duplicates
  } else {
    window.removeEventListener("keydown", handleKeyDown);
  }
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isMobileMenuOpen, handleKeyDown]);
```

**Recommendation:**
```tsx
useEffect(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  if (isMobileMenuOpen) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
    };
  }
}, [isMobileMenuOpen]);
```

---

### 4. **Unused/Dead Code in CampaignsContext**
**Severity:** LOW-MEDIUM  
**File:** `context/CampaignsContext.tsx` (line 67)

**Issue:** `console.log` left in production code for debugging.

**Current:**
```tsx
console.log('Realtime change detected, refetching all campaigns:', payload.eventType)
```

**Fix:** Remove or replace with proper logging library (e.g., Sentry, LogRocket).

---

## 🟡 PERFORMANCE ISSUES

### 5. **Inefficient Realtime Subscription - Full Refetch on Any Change**
**Severity:** MEDIUM  
**File:** `context/CampaignsContext.tsx`

**Issue:** Every database change (insert/update/delete) triggers a full refetch of ALL campaigns, even if the change is unrelated.

**Current Pattern:**
```tsx
.on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'campaigns' },
  (payload) => {
    fetchAllOngoingCampaigns() // ❌ Full refetch
  }
)
```

**Recommendation:** Implement selective updates:
```tsx
(payload) => {
  if (payload.eventType === 'INSERT') {
    const newCampaign = payload.new;
    if (newCampaign.status === 'Ongoing') {
      setCampaigns(prev => [newCampaign, ...prev]);
    }
  } else if (payload.eventType === 'UPDATE') {
    setCampaigns(prev =>
      prev.map(c => c.id === payload.new.id ? payload.new : c)
    );
  } else if (payload.eventType === 'DELETE') {
    setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
  }
}
```

---

### 6. **Multiple useMemo Without Dependencies - Potential Infinite Loops**
**Severity:** MEDIUM  
**Files:**
- `context/CampaignsContext.tsx` (line 30)
- `components/homepage/heroSection/HeroCampaignCarousel.tsx` (line 28)

**Issue:** Memoization might not be needed or dependencies could be incomplete.

**Review:** Ensure all `useMemo` calls have proper dependencies and only memoize expensive computations.

---

### 7. **Image Optimization Issues**
**Severity:** MEDIUM  
**File:** `components/campaigns/CampaignCard.tsx` (line 43-49)

**Issue:** Using custom image loader (wsrvLoader) with `priority` on potentially many images.

**Current:**
```tsx
<Image
  loader={wsrvLoader}
  src={campaign.image_url || '/placeholder.jpg'}
  alt={campaign.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  priority // ⚠️ Only use for above-the-fold images
  quality={75}
/>
```

**Recommendation:**
```tsx
<Image
  loader={wsrvLoader}
  src={campaign.image_url || '/placeholder.jpg'}
  alt={campaign.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  priority={index < 3} // Only prioritize first 3 items
  quality={75}
  loading="lazy" // Explicit lazy loading
/>
```

---

### 8. **useCallback Missing Dependency**
**Severity:** MEDIUM  
**File:** `components/navbar/Navbar.tsx` (line 29)

**Issue:** `handleKeyDown` has no dependencies but references `isMobileMenuOpen` state.

```tsx
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === "Escape") {
    setIsMobileMenuOpen(false); // Uses state
  }
}, []); // ❌ Missing dependency
```

**Fix:** Add dependency or use state setter callback.

---

## 🟢 CODE QUALITY IMPROVEMENTS

### 9. **Metadata Type Issue**
**Severity:** LOW  
**File:** `app/layout.tsx` (line 28)

**Issue:** `metadataBase` should be a URL object, not a string.

**Current:**
```tsx
export const metadata: Metadata = {
  metadataBase: "http://localhost:3000", // ❌ String
  // ...
}
```

**Fix:**
```tsx
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  // ...
}
```

---

### 10. **Unused Hook: useFilteredCampaigns**
**Severity:** LOW  
**File:** `hooks/useFilteredCampaigns.ts`

**Issue:** Hook exists but may not be used throughout the codebase.

**Action:** Verify if it's used. If not, consider removing it.

---

### 11. **Inconsistent Error Handling**
**Severity:** MEDIUM  
**Files:** Multiple API route handlers and components

**Issue:** Error handling is inconsistent:
- Some catch `error: any` (AdminDashboardClient, UpdateMilestoneModal)
- Some use `error?.message` without null checks
- No structured error logging

**Recommendation:** Create error utility:
```typescript
// lib/utils/error.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export const handleError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message);
  }
  return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
};
```

---

### 12. **No Input Validation in DonationModal**
**Severity:** MEDIUM  
**File:** `components/donation/DonationModal.tsx` (line 27)

**Current:**
```tsx
const handleProceedToPayment = async () => {
  if (!amount || Number(amount) <= 0) return; // Basic check
  // ...
}
```

**Recommendation:** Add comprehensive validation:
```tsx
const validateDonationAmount = (amount: string): { valid: boolean; error?: string } => {
  if (!amount) return { valid: false, error: 'Amount is required' };
  const num = Number(amount);
  if (isNaN(num)) return { valid: false, error: 'Invalid amount' };
  if (num <= 0) return { valid: false, error: 'Amount must be greater than 0' };
  if (num > 1000000) return { valid: false, error: 'Amount exceeds maximum' };
  return { valid: true };
};
```

---

## 📋 REFACTORING SUGGESTIONS

### 13. **Extract Reusable Type Definitions**

Create a centralized types file:
```typescript
// types/campaign.ts
export interface Campaign {
  id: string;
  ngo_name: string | null;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  goal_amount: number;
  collected_amount: number;
  status: 'Ongoing' | 'Completed' | 'Ended';
  end_date: string | null;
  created_at: string | null;
}

export interface Milestone {
  id: string;
  milestone_index: number;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'pending_review' | 'approved' | 'rejected';
  target_amount: number;
  proof_description?: string;
  proof_images?: string[];
  proof_invoices?: string[];
}
```

---

### 14. **Create Custom Hooks for Common Patterns**

```typescript
// hooks/useAsyncData.ts
export const useAsyncData = <T,>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await fetchFn();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, deps);

  return { data, loading, error };
};
```

---

### 15. **Implement Proper API Error Handling**

```typescript
// API Route Template
export async function POST(request: Request) {
  try {
    // Validate input
    const body = await request.json();
    // ... business logic

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const apiError = handleError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode }
    );
  }
}
```

---

## 📊 SUMMARY TABLE

| Issue | Severity | File(s) | Impact | Effort |
|-------|----------|---------|--------|--------|
| Excessive `any` types | HIGH | Multiple | Type safety | Medium |
| Supabase client recreation | MEDIUM | Navbar | Performance | Low |
| Event listener cleanup | MEDIUM | Navbar | Memory leaks | Low |
| Realtime subscription inefficiency | MEDIUM | CampaignsContext | Performance | High |
| Image lazy loading | MEDIUM | CampaignCard | Performance | Low |
| Error handling inconsistency | MEDIUM | Multiple | Reliability | Medium |
| Missing input validation | MEDIUM | DonationModal | Security | Low |
| Type definitions scattered | LOW | Multiple | Maintainability | Medium |

---

## ✅ ACTION ITEMS (Priority Order)

1. **Replace all `any` types** - Start with interfaces in AdminDashboardClient, CampaignManagerClient
2. **Fix event listener cleanup** - Navbar.tsx cleanup logic
3. **Remove console.log statements** - CampaignsContext
4. **Fix metadata type** - layout.tsx
5. **Optimize realtime subscription** - Implement selective updates
6. **Add comprehensive validation** - DonationModal and API routes
7. **Extract type definitions** - Create centralized types directory
8. **Implement error utility** - Standardize error handling across app
9. **Create custom hooks** - Consolidate common patterns
10. **Review unused hooks** - Clean up dead code

---

## 🚀 Best Practices to Implement

- Use TypeScript's strict mode (`strict: true` in tsconfig.json)
- Implement proper dependency arrays in all hooks
- Add unit tests for utility functions
- Use React DevTools Profiler to identify render bottlenecks
- Implement error boundaries for better error handling
- Add loading states and skeleton components
- Use React.memo for expensive components that receive same props
- Implement pagination for large lists instead of infinite loading

