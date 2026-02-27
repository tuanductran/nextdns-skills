---
title: 'Error Handling'
impact: MEDIUM
impactDescription:
  'Unhandled API errors silently fail or show raw JSON to users, breaking the UI feedback loop'
type: capability
tags:
  - error handling
  - error boundary
  - next response
  - toast
  - api errors
---

<!-- @case-police-ignore Api -->

# Error handling

Map NextDNS API errors to user-friendly React and Next.js error UI

## Overview

The NextDNS API returns errors in two formats:

- **HTTP 4xx/5xx** with `{ "errors": [...] }` — validation or auth errors.
- **HTTP 200 OK** with `{ "errors": [...] }` — user-level errors (for example, duplicate name).

Both must be handled explicitly. Next.js Route Handlers should return typed error responses, and
React components should display them via error boundaries or toast notifications.

## Correct usage

### Route handler — return typed errors

```typescript
// ✅ lib/nextdns.ts — throw structured errors from the fetcher
export async function nextdnsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) throw new Error('NEXTDNS_API_KEY is not set');

  const res = await fetch(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const json = await res.json();

  // Both 4xx and 200 responses may contain errors
  if (json.errors?.length) {
    const first = json.errors[0];
    const status = res.ok ? 422 : res.status;
    const err = new Error(first.detail ?? first.code ?? 'NextDNS API error');
    (err as NodeJS.ErrnoException).code = String(status);
    throw err;
  }

  return json as T;
}
```

```typescript
// ✅ app/api/profiles/route.ts — translate server errors to HTTP responses
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await nextdnsFetch('/profiles', { method: 'POST', body: JSON.stringify(body) });
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = Number((err as NodeJS.ErrnoException).code) || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

### Next.js error boundary — page-level errors

```tsx
// ✅ app/profiles/[id]/error.tsx — Client Component, catches errors in the segment
'use client';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Failed to load profile</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Client component — toast on mutation failure

```tsx
// ✅ components/ProfileActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProfileForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') }),
    });

    if (!res.ok) {
      const { error: message } = await res.json();
      setError(message ?? 'Failed to create profile');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Profile name" required />
      <button type="submit">Create</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Global error page

```tsx
// ✅ app/global-error.tsx — catches root layout errors
'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Reload</button>
      </body>
    </html>
  );
}
```

## Do NOT Use

```tsx
// ❌ Swallowing errors silently in a Client Component
const res = await fetch('/api/profiles', { method: 'DELETE' });
// ❌ No error check — user gets no feedback if delete fails

// ❌ Checking only HTTP status — NextDNS also returns errors in 200 responses
// lib/nextdns.ts
if (!res.ok) throw new Error('error'); // ❌ Misses 200-with-errors case

// ❌ Exposing raw NextDNS error objects to the browser
return NextResponse.json(err, { status: 500 }); // ❌ May leak internal details
```

## Best practices

- **Check `json.errors` first**: NextDNS returns user errors inside 200 responses — HTTP status
  alone is not sufficient.
- **Keep error messages user-friendly**: Translate codes like `invalid` into sentences like _"Domain
  format is invalid — use example.com without a trailing dot."_
- **Use `error.tsx` files per segment**: Next.js error boundaries are scoped — a profile page error
  won't crash the whole dashboard.
- **Log server-side errors**: Use `console.error` in Route Handlers to capture upstream failures
  without exposing details to the browser.

## Troubleshooting

### Issue: `error.tsx` is NOT displayed — the page crashes instead

**Solution**: `error.tsx` must be a **Client Component** (`'use client'` at the top). Server
Components cannot be error boundaries in Next.js.

### Issue: error message from route handler NOT reaching the client component

**Solution**: Ensure the Route Handler returns a JSON body with an `error` field:

```typescript
return NextResponse.json({ error: message }, { status: 400 });
// Client: const { error } = await res.json()
```

## Reference

- [Next.js — Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js — global-error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error)
- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)
