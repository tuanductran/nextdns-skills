---
title: 'API Key Proxy (BFF Pattern)'
impact: HIGH
impactDescription:
  'Placing X-Api-Key in client-side code exposes the key to all users via browser DevTools and
  network requests'
type: capability
tags:
  - api key
  - security
  - bff
  - route handler
  - proxy
  - process.env
---

<!-- @case-police-ignore Api -->

# API Key Proxy (BFF Pattern)

Proxy all NextDNS API calls through Next.js Route Handlers to keep X-Api-Key server-side only

## Overview

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible
code. Next.js Route Handlers (`app/api/`) run exclusively on the server, making them the correct
place to attach the key before forwarding requests to `api.nextdns.io`.

```text
Browser → /api/* (Next.js Route Handler) → api.nextdns.io (X-Api-Key added here)
```

## Correct Usage

### Environment variable setup

```bash
# .env.local  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Shared server utility

```typescript
// ✅ lib/nextdns.ts — reusable server-side fetcher
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
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.errors?.[0]?.detail ?? `NextDNS API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
```

### Profile list Route Handler

```typescript
// ✅ app/api/profiles/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await nextdnsFetch('/profiles');
  return NextResponse.json(data);
}
```

### Dynamic profile Route Handler

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
```

## Do NOT Use

```typescript
// ❌ Never prefix the API key with NEXT_PUBLIC_ — it gets bundled into the client JS
// .env.local
NEXT_PUBLIC_NEXTDNS_API_KEY = YOUR_API_KEY; // ❌ Visible in browser source

// ❌ Never call api.nextdns.io directly from a Client Component
('use client');
const res = await fetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_NEXTDNS_API_KEY }, // ❌ Key exposed
});
```

## Best Practices

- **One utility, one key location**: Use `lib/nextdns.ts` as the single place where the key is
  attached — never repeat `process.env.NEXTDNS_API_KEY` across Route Handler files.
- **No `NEXT_PUBLIC_` prefix**: Non-prefixed env vars in `.env.local` are server-only and never
  bundled into client JavaScript. Use `NEXTDNS_API_KEY`, not `NEXT_PUBLIC_NEXTDNS_API_KEY`.
- **Rotate keys without redeploying**: Keep the key in `.env.local` or a hosting secret store.

## Troubleshooting

### Issue: `process.env.NEXTDNS_API_KEY` is `undefined` in a Route Handler

**Symptoms**: The utility throws `NEXTDNS_API_KEY is not set`.

**Solution**: Ensure the variable is defined in `.env.local` (development) or in your hosting
platform's environment secrets (production). Next.js does NOT auto-load `.env` files at runtime in
production — secrets must be set as OS-level env vars.

```bash
# Verify the env var is set
echo $NEXTDNS_API_KEY
```

### Issue: `process.env.NEXTDNS_API_KEY` is accessible in a Client Component

**Symptoms**: The key appears in browser DevTools → Application → JavaScript.

**Solution**: Remove the `NEXT_PUBLIC_` prefix and move all fetching logic to Route Handlers or
Server Components.

## Reference

- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
