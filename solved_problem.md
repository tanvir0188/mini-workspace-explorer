# Solved Problems Log

This document keeps track of major technical problems faced during development and their adapted solutions.

## 1. Next.js App Router: Suspense Fallback Not Showing on Query Param Changes

**Problem:**
When applying filters on the properties page, the UI was intended to show a "Loading properties..." skeleton state. However, clicking the "Apply" button triggered a soft navigation (`router.push`), which in Next.js App Router (and React 18 Concurrent Mode) wraps the state update in a `startTransition`. This intentionally keeps the old UI visible and blocks the `<Suspense>` fallback from showing while the server fetches the new data for the updated query parameters. The result was a "frozen" UI with no feedback until the new data arrived.

**Adapted Solution:**
We implemented a manual loading state manager using React Context to bypass the transition delay and provide immediate visual feedback.

1.  **Shared Loading Context:** Created `FilterLoadingContext` to hold an `isLoading` boolean.
2.  **Trigger on Action:** In the `FilterSidebar` client component, we explicitly call `setLoading(true)` right before executing `router.push()` when applying or clearing filters.
3.  **Client-Side Wrapper:** Created `PropertyListWrapper` to read the `isLoading` state. If true, it immediately renders the loading skeleton, bypassing Next.js's native transition hold.
4.  **Reset on Server Render:** The server component passes a `serverKey` (a stringified version of the current search params) down to the wrapper. A `useEffect` in the wrapper listens for changes to this `serverKey`. When the new server payload arrives with the updated key, the effect sets `isLoading` to false, revealing the newly fetched data.

## 2. Next.js 15: Uncached data was accessed outside of `<Suspense>` (blocking-route error)

**Problem:**
During the production build, Next.js threw an error: `Route "/dashboard/admin/users/[id]": Uncached data was accessed outside of <Suspense>`. This occurred because a Client Component (`DashboardContentWrapper`) accessed routing hooks like `usePathname()` outside of a `<Suspense>` boundary in the dashboard layout. Next.js 15 is stricter about this: accessing dynamic route information or search params without Suspense opts out of static rendering entirely and blocks the pre-render process, causing the build to fail.

**Adapted Solution:**
We wrapped the `DashboardContentWrapper` inside a `<Suspense>` boundary in `app/dashboard/layout.tsx`.

1.  **Identify the boundary:** We located the layout wrapping the dynamically read component (`app/dashboard/layout.tsx`).
2.  **Add Suspense:** We wrapped `<DashboardContentWrapper>` with `<Suspense>` and provided a loading skeleton as the `fallback`.
3.  **Result:** This tells Next.js to pre-render the static parts of the layout, and delay rendering the dynamic client components until they resolve, successfully fixing the build error while maintaining good UX.
