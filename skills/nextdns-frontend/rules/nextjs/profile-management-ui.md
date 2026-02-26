---
title: 'Profile Management UI'
impact: MEDIUM
impactDescription:
  'Fetching data in Client Components instead of Server Components adds unnecessary JavaScript and
  exposes fetching logic to the browser'
type: capability
tags:
  - profile
  - crud
  - server component
  - react
  - fetch
  - route handler
---

<!-- @case-police-ignore Api -->

# Profile Management UI

Build profile list, create, update, and delete flows using Next.js App Router patterns

## Overview

In Next.js App Router, profile data is fetched in **Server Components** (no extra client JS, no API
key exposure). Mutations (create, update, delete) are triggered from **Client Components** via Route
Handlers. Server Actions are an alternative for forms.

## Correct Usage

### Route Handlers (server-side)

```typescript
// ✅ app/api/profiles/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await nextdnsFetch('/profiles');
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await nextdnsFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status: 201 });
}
```

```typescript
// ✅ app/api/profiles/[id]/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  const data = await nextdnsFetch(`/profiles/${id}`);
  return NextResponse.json(data);
}

export async function PATCH(req: Request, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  const body = await req.json();
  const data = await nextdnsFetch(`/profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  await nextdnsFetch(`/profiles/${id}`, { method: 'DELETE' });
  return new Response(null, { status: 204 });
}
```

### Server Component — profile list page

```tsx
// ✅ app/page.tsx — Server Component, no 'use client' needed
import { nextdnsFetch } from '@/lib/nextdns';
import type { NextDNSProfile } from '@/types/nextdns';
import ProfileActions from '@/components/ProfileActions';

export default async function ProfilesPage() {
  const { data: profiles } = await nextdnsFetch<{ data: NextDNSProfile[] }>('/profiles');

  return (
    <main>
      <h1>Profiles</h1>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            {profile.name} ({profile.id})
            <ProfileActions profileId={profile.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Client Component — profile actions

```tsx
// ✅ components/ProfileActions.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function ProfileActions({ profileId }: { profileId: string }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
    router.refresh(); // Re-fetch Server Component data
  }

  return (
    <button onClick={handleDelete} className="text-red-500">
      Delete
    </button>
  );
}
```

### Profile detail page

```tsx
// ✅ app/profiles/[id]/page.tsx — Server Component
import { nextdnsFetch } from '@/lib/nextdns';
import type { NextDNSProfile } from '@/types/nextdns';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: profile } = await nextdnsFetch<{ data: NextDNSProfile }>(`/profiles/${id}`);

  return (
    <main>
      <h1>{profile.name}</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </main>
  );
}
```

## Do NOT Use

```tsx
// ❌ Fetching directly from api.nextdns.io in a Client Component
'use client'
const [profiles, setProfiles] = useState([])
useEffect(() => {
  fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': '...' }, // ❌ Key exposed to browser
  }).then((r) => r.json()).then((d) => setProfiles(d.data))
}, [])

// ❌ Adding 'use client' to a page just to fetch data — use Server Components instead
'use client'
export default function ProfilesPage() { ... } // ❌ Unnecessary client bundle
```

## Best Practices

- **Use `router.refresh()`** after mutations instead of full page reloads — it re-runs Server
  Component data fetching without a hard navigation.
- **Use Server Components for initial data**: Profile lists loaded at page render should come from
  Server Components, not `useEffect` hooks.
- **Use Server Actions for forms**: For create/update forms, Server Actions avoid writing a
  dedicated Route Handler.

## Troubleshooting

### Issue: Profile list shows stale data after delete

**Solution**: Call `router.refresh()` after the mutation to revalidate Server Component data:

```tsx
const router = useRouter();
await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
router.refresh();
```

### Issue: `params` type error in Next.js 15

**Solution**: In Next.js 15, `params` in pages and Route Handlers is a **Promise**. Always await it:

```tsx
// ✅ Next.js 15
const { id } = await params;
```

## Reference

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
