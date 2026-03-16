---
title: 'Data Revalidation Strategies (React Router v7)'
impact: MEDIUM
impactDescription: 'Without shouldRevalidate or fetcher-based mutations, every navigation triggers a full loader re-run, causing unnecessary API calls and UI flicker'
type: efficiency
tags:
  - revalidation
  - shouldRevalidate
  - fetcher
  - defer
  - await
  - react router
  - performance
  - background mutation
---

<!-- @case-police-ignore Api -->

# Data revalidation strategies React router v7)

Control when React Router v7 re-runs loaders and implement background mutations with fetchers

## Overview

By default, React Router re-runs all active loaders after every action. For a NextDNS dashboard
with multiple panels (profile list, analytics, recent logs), this can mean 3–4 unnecessary API
calls per user interaction. Fine-tuning revalidation reduces API usage and prevents UI flicker.

Three tools are available:

1. **`shouldRevalidate`** — skip a loader re-run when it is not needed.
2. **`fetcher`** — trigger mutations without navigating, enabling inline updates.
3. **`defer` + `<Await>`** — render the page immediately with static data while analytics loads in
   the background.

## shouldRevalidate — skip unnecessary re-runs

```typescript
// ✅ app/routes/profiles.tsx — skip revalidation after unrelated actions
import type { Route } from './+types/profiles';

// Only re-run the profiles loader if the action was on THIS route
export function shouldRevalidate({
  actionResult,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: Route.ShouldRevalidateFunctionArgs): boolean {
  // Skip revalidation when navigating within profile detail pages
  if (
    currentUrl.pathname.startsWith('/profiles/') &&
    nextUrl.pathname.startsWith('/profiles/')
  ) {
    return false;
  }

  // Always revalidate after a mutation that touches profiles
  if (actionResult?.revalidateProfiles) {
    return true;
  }

  return defaultShouldRevalidate;
}

export async function loader(_: Route.LoaderArgs) {
  const data = await nextdnsFetch<{ data: Array<{ id: string; name: string }> }>('/profiles');
  return { profiles: data.data };
}
```

## Fetcher — inline mutations without navigation

Use `fetcher.submit` for mutations that should not navigate away from the current page:

```typescript
// ✅ app/routes/profiles.tsx — action handles fetcher submissions
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles';

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'toggle-security') {
    const profileId = form.get('profileId') as string;
    const enabled = form.get('cryptojacking') === 'true';

    await nextdnsFetch(`/profiles/${profileId}/security`, {
      method: 'PATCH',
      body: JSON.stringify({ cryptojacking: enabled }),
    });

    // Signal that only this profile's data changed
    return { revalidateProfiles: false, profileId };
  }
}
```

```tsx
// ✅ Inline toggle component using useFetcher
import { useFetcher } from 'react-router';

export default function SecurityToggle({
  profileId,
  initialValue,
}: {
  profileId: string;
  initialValue: boolean;
}) {
  const fetcher = useFetcher();

  // Optimistic UI: show the new value immediately
  const isEnabled =
    fetcher.formData
      ? fetcher.formData.get('cryptojacking') === 'true'
      : initialValue;

  return (
    <fetcher.Form method="post" action="/profiles">
      <input type="hidden" name="intent" value="toggle-security" />
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="cryptojacking" value={String(!isEnabled)} />
      <button type="submit" disabled={fetcher.state !== 'idle'}>
        {isEnabled ? '✅ Cryptojacking blocked' : '❌ Cryptojacking allowed'}
      </button>
    </fetcher.Form>
  );
}
```

## defer + Await — non-blocking analytics

Render the profile list immediately while analytics loads in the background:

```typescript
// ✅ app/routes/profiles.$id.tsx — defer slow analytics
import { defer } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  // Profile data — fetch synchronously (fast, needed for page title)
  const profile = await nextdnsFetch<{ data: { id: string; name: string } }>(
    `/profiles/${params.id}`
  );

  // Analytics — defer (can be slow, not needed for initial render)
  const analyticsPromise = nextdnsFetch(
    `/profiles/${params.id}/analytics/status?from=-7d`
  );

  return defer({
    profile: profile.data,
    analytics: analyticsPromise, // Promise, not awaited
  });
}
```

```tsx
// ✅ Component — render immediately, stream analytics when ready
import { Await, useLoaderData } from 'react-router';
import { Suspense } from 'react';

export default function ProfilePage() {
  const { profile, analytics } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Renders immediately */}
      <h1>{profile.name}</h1>

      {/* Streams in when analytics resolves */}
      <Suspense fallback={<p aria-live="polite">Loading analytics…</p>}>
        <Await
          resolve={analytics}
          errorElement={<p>Analytics failed to load.</p>}
        >
          {(data) => (
            <ul>
              {data.data.map((item: { status: string; queries: number }) => (
                <li key={item.status}>
                  {item.status}: {item.queries}
                </li>
              ))}
            </ul>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

## Background data refresh with fetcher.load

```tsx
// ✅ Auto-refresh analytics every 60 seconds without full navigation
'use client'; // Not needed in React Router — shown for clarity
import { useFetcher, useLoaderData } from 'react-router';
import { useEffect } from 'react';

export default function AnalyticsPanel({ profileId }: { profileId: string }) {
  const fetcher = useFetcher<{ data: Array<{ status: string; queries: number }> }>();

  // Trigger a background reload every 60 seconds
  useEffect(() => {
    const id = setInterval(() => {
      fetcher.load(`/api/profiles/${profileId}/analytics/status?from=-7d`);
    }, 60_000);
    return () => clearInterval(id);
  }, [profileId, fetcher]);

  const items = fetcher.data?.data ?? [];

  return (
    <ul aria-live="polite">
      {items.map((item) => (
        <li key={item.status}>{item.status}: {item.queries}</li>
      ))}
    </ul>
  );
}
```

## Do NOT Use

```typescript
// ❌ Returning true from shouldRevalidate unconditionally — defeats its purpose
export function shouldRevalidate() {
  return true; // ❌ Same as not having shouldRevalidate at all
}

// ❌ Using navigate() instead of fetcher for inline mutations
// navigate() triggers a full navigation and re-runs all loaders
import { useNavigate } from 'react-router';
const navigate = useNavigate();
await deleteProfile(id);
navigate('.'); // ❌ Use fetcher.submit instead
```

## Reference

- [React Router v7 — shouldRevalidate](https://reactrouter.com/api/hooks/useFetcher)
- [React Router v7 — Fetchers](https://reactrouter.com/start/framework/pending-ui#optimistic-ui)
- [React Router v7 — Deferred Data](https://reactrouter.com/how-to/streaming)
