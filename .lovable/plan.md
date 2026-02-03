
# Plan: Fix Login Flow Race Condition

## Problem Analysis
The login flow gets stuck because of a **race condition** between authentication state and navigation:

1. After successful login, the app navigates to `/select-site` with a 100ms delay
2. The `SiteSelection` page uses `useAuth()` which creates a **fresh hook instance** with its own loading state
3. Before the auth state fully initializes, the page's `useEffect` sees `!authLoading && !isAuthenticated` and redirects back to `/`

The core issue is that `useAuth()` is a **stateful hook** - each component calling it gets its own isolated state that needs to initialize independently.

## Solution

### Step 1: Update SiteSelection Authentication Check
Modify the redirect logic in `SiteSelection.tsx` to be more defensive:
- Only redirect to login if auth is **definitively** not authenticated (not just during loading)
- Wait for BOTH `authLoading` AND `sitesLoading` to complete before making any redirect decision

```typescript
// Before (problematic)
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    navigate('/', { replace: true });
  }
}, [isAuthenticated, authLoading, navigate]);

// After (fixed)
useEffect(() => {
  // Only redirect if auth has finished loading AND user is definitely not authenticated
  // Also ensure we've given the auth state time to propagate
  if (!authLoading && !sitesLoading && !isAuthenticated) {
    navigate('/', { replace: true });
  }
}, [isAuthenticated, authLoading, sitesLoading, navigate]);
```

### Step 2: Add Session Check Fallback in SiteSelection
Add a direct session check using `supabase.auth.getSession()` as a fallback to ensure we're not redirecting prematurely:

```typescript
const [hasCheckedSession, setHasCheckedSession] = useState(false);

useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/', { replace: true });
    }
    setHasCheckedSession(true);
  };
  
  // Only check session after initial loading completes
  if (!authLoading && !isAuthenticated && !hasCheckedSession) {
    checkSession();
  }
}, [authLoading, isAuthenticated, hasCheckedSession, navigate]);
```

### Step 3: Simplify Login Navigation
Remove the `setTimeout` wrapper since the navigation should happen after auth state is confirmed:

```typescript
// In handleSignIn success block
toast({
  title: "Welcome back!",
  description: "Successfully authenticated.",
});
setIsLoading(false);
navigate('/select-site', { replace: true });
```

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/SiteSelection.tsx` | Add defensive session check before redirecting to login |
| `src/pages/Login.tsx` | Remove setTimeout wrapper from navigation |

## Technical Details

The fix ensures:
1. SiteSelection won't redirect to login until it has **confirmed** via direct API call that there's no valid session
2. This handles the timing gap between navigation and `onAuthStateChange` listener firing
3. The loading state shows "Loading your sites..." while this verification happens
