---
title: 'TanStack Query v5 Integration'
impact: MEDIUM
impactDescription: 'Without proper Server Component prefetching, Client Components show a loading spinner on every page navigation instead of instant data from the server'
type: efficiency
tags:
  - tanstack query
  - react query
  - next.js
  - app router
  - prefetch
  - hydration
  - infinite query
  - server component
---

<!-- @case-police-ignore Api -->

# TanStack Query v5 integration

Integrate TanStack Query v5 with Next.js 15 App Router for prefetching in Server Components and mutations in Client Components

## Overview

TanStack Query v5 works alongside the Next.js App Router through the **hydration pattern**: Server
Components prefetch query data server-side, the dehydrated state is serialised into the HTML, and
Client Components rehydrate it to avoid a loading flash.

All actual NextDNS API calls still go through Route Handlers (`/api/*`) — TanStack Query fetches
from those, never directly from `api.nextdns.io`.

## Setup

### Install dependencies

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

### Create the query client provider

```tsx
// ✅ lib/query-client.ts — singleton factory
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      },
    },
  });
}

// Browser singleton
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
```

```tsx
// ✅ components/providers.tsx — wrap the app with QueryClientProvider
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { makeQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```tsx
// ✅ app/layout.tsx — wrap with Providers
import { Providers } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Prefetching in Server Components

```tsx
// ✅ app/page.tsx — Server Component prefetches data
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { nextdnsFetch } from '@/lib/nextdns';
import ProfileList from '@/components/ProfileList';

interface Profile { id: string; name: string }

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch — populates the cache before the Client Component renders
  await queryClient.prefetchQuery({
    queryKey: ['profiles'],
    queryFn: () =>
      nextdnsFetch<{ data: Profile[] }>('/profiles').then((r) => r.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileList />
    </HydrationBoundary>
  );
}
```

### Client Component consuming prefetched data

```tsx
// ✅ components/ProfileList.tsx — Client Component
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Profile { id: string; name: string }

export default function ProfileList() {
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () =>
      fetch('/api/profiles')
        .then((r) => r.json())
        .then((j) => j.data as Profile[]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/profiles/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['profiles'] });
      const previous = queryClient.getQueryData<Profile[]>(['profiles']);
      queryClient.setQueryData<Profile[]>(
        ['profiles'],
        (old) => old?.filter((p) => p.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['profiles'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  if (isLoading) return <p role="status">Loading profiles…</p>;

  return (
    <ul>
      {profiles?.map((profile) => (
        <li key={profile.id}>
          {profile.name}
          <button
            onClick={() => deleteMutation.mutate(profile.id)}
            disabled={deleteMutation.isPending}
            aria-label={`Delete ${profile.name}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Infinite query for logs pagination

```tsx
// ✅ components/LogsTable.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: string;
}

interface LogsResponse {
  data: LogEntry[];
  meta: { pagination: { cursor: string | null } };
}

export default function LogsTable({ profileId }: { profileId: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['logs', profileId],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: '100' });
        if (pageParam) params.set('cursor', pageParam as string);
        const res = await fetch(`/api/profiles/${profileId}/logs?${params}`);
        return res.json() as Promise<LogsResponse>;
      },
      initialPageParam: null as string | null,
      getNextPageParam: (last) => last.meta.pagination.cursor,
    });

  const allLogs = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <ul>
        {allLogs.map((log) => (
          <li key={`${log.timestamp}-${log.domain}`}>
            {log.timestamp} — {log.domain} —{' '}
            <span style={{ color: log.status === 'blocked' ? 'red' : 'green' }}>
              {log.status}
            </span>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}
```

## Do NOT Use

```typescript
// ❌ Calling api.nextdns.io in a TanStack Query queryFn from a Client Component
useQuery({
  queryKey: ['profiles'],
  queryFn: () =>
    fetch('https://api.nextdns.io/profiles', {
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_KEY }, // ❌ Key exposed
    }).then(r => r.json()),
});

// ❌ Not wrapping prefetched queries in HydrationBoundary
// — Client Component will refetch on mount even though server already has the data
export default async function Page() {
  const qc = getQueryClient();
  await qc.prefetchQuery({ queryKey: ['profiles'], queryFn: ... });
  return <ProfileList />; // ❌ Missing <HydrationBoundary state={dehydrate(qc)}>
}
```

## Reference

- [TanStack Query v5 — Next.js App Router Guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [TanStack Query v5 — Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [NextDNS API — Pagination](https://nextdns.github.io/api/#pagination)
