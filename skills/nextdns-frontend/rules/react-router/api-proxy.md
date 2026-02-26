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
  - resource route
  - proxy
  - process.env
---

<!-- @case-police-ignore Api -->

# API Key Proxy (BFF Pattern)

Proxy all NextDNS API calls through React Router v7 resource routes to keep X-Api-Key server-side
only

## Overview

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible
code. React Router v7 resource routes (route modules without a default component export) run
exclusively on the server and are the correct place to attach the key before forwarding requests to
`api.nextdns.io`. Environment variables without the `VITE_` prefix are never included in client
bundles.

```text
Browser → /api/* (React Router resource route) → api.nextdns.io (X-Api-Key added here)
```

## Correct Usage

### Environment variable setup

```bash
# .env  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Shared server utility

```typescript
// ✅ app/lib/nextdns.server.ts — server-only utility
// The .server.ts suffix prevents Vite from bundling this into the client
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

### Register resource routes

```typescript
// ✅ app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('api/profiles', 'routes/api.profiles.ts'),
  route('api/profiles/:id', 'routes/api.profiles.$id.ts'),
] satisfies RouteConfig;
```

### Profiles resource route

```typescript
// ✅ app/routes/api.profiles.ts
// No default export = resource route
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/api.profiles';

export async function loader(_: Route.LoaderArgs) {
  const data = await nextdnsFetch('/profiles');
  return Response.json(data);
}

export async function action({ request }: Route.ActionArgs) {
  const body = await request.json();
  const data = await nextdnsFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return Response.json(data, { status: 201 });
}
```

### Dynamic profile resource route

```typescript
// ✅ app/routes/api.profiles.$id.ts
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/api.profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  const data = await nextdnsFetch(`/profiles/${params.id}`);
  return Response.json(data);
}

export async function action({ params, request }: Route.ActionArgs) {
  const body = await request.json();
  const data = await nextdnsFetch(`/profiles/${params.id}`, {
    method: request.method,
    body: JSON.stringify(body),
  });
  return Response.json(data);
}
```

## Do NOT Use

```typescript
// ❌ Never prefix the API key with VITE_ — it gets bundled into the client JS
// .env
VITE_NEXTDNS_API_KEY = YOUR_API_KEY; // ❌ Visible in browser source via import.meta.env
```

```typescript
// ❌ Never call api.nextdns.io directly from a component
export default function Dashboard() {
  useEffect(() => {
    fetch('https://api.nextdns.io/profiles', {
      headers: { 'X-Api-Key': process.env.VITE_NEXTDNS_API_KEY }, // ❌ Key exposed
    });
  }, []);
}
```

## Best Practices

- **`.server.ts` suffix**: Vite (used by React Router v7) strips files ending in `.server.ts` from
  client bundles, preventing accidental imports of server-only code.
- **`process.env` in loaders/actions**: Server code (loaders, actions, resource routes) runs only on
  the server and has access to `process.env`. Never pass env vars to client components as props.
- **`ssr: true`**: Ensure `react-router.config.ts` sets `ssr: true`; otherwise resource routes are
  not executed on the server.

## Troubleshooting

### Issue: `process.env.NEXTDNS_API_KEY` is `undefined`

**Solution**: Add the variable to `.env` (development) or the platform's secret store (production).
Variables without the `VITE_` prefix are server-only and require restart to pick up.

### Issue: Resource route returns 404

**Solution**: Verify the route is registered in `app/routes.ts` and the file has no default
component export — a default export turns it into a UI route, not a resource route.

## Reference

- [React Router v7 — Resource Routes](https://reactrouter.com/how-to/resource-routes)
- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
