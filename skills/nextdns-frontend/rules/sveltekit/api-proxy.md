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
  - server route
  - proxy
  - $env/static/private
---

<!-- @case-police-ignore Api -->

# API Key Proxy (BFF Pattern)

Proxy all NextDNS API calls through SvelteKit `+server.ts` routes to keep X-Api-Key server-side only

## Overview

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible
code. SvelteKit `+server.ts` files run exclusively on the server, making them the correct place to
attach the key before forwarding requests to `api.nextdns.io`. Environment variables imported from
`$env/static/private` are stripped from client bundles at build time.

```text
Browser → /api/* (SvelteKit +server.ts) → api.nextdns.io (X-Api-Key added here)
```

## Correct Usage

### Environment variable setup

```bash
# .env  (gitignored — add to .gitignore)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Shared server utility

```typescript
// ✅ src/lib/server/nextdns.ts — reusable server-side fetcher
// Only importable from server files; $lib/server/* is blocked from client code
import { NEXTDNS_API_KEY } from '$env/static/private';

export async function nextdnsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!NEXTDNS_API_KEY) throw new Error('NEXTDNS_API_KEY is not set');

  const res = await fetch(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      'X-Api-Key': NEXTDNS_API_KEY,
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

### API route for profile list

```typescript
// ✅ src/routes/api/profiles/+server.ts
import { json, error } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const data = await nextdnsFetch('/profiles');
    return json(data);
  } catch (err) {
    error(502, { message: (err as Error).message });
  }
};
```

### Dynamic profile route

```typescript
// ✅ src/routes/api/profiles/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const data = await nextdnsFetch(`/profiles/${params.id}`);
  return json(data);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const data = await nextdnsFetch(`/profiles/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return json(data);
};
```

## Do NOT Use

```typescript
// ❌ Never import private env vars in .svelte files or +page.ts (shared client/server code)
// src/routes/+page.ts  ← runs on both server and client
import { NEXTDNS_API_KEY } from '$env/static/private'; // ❌ Build error
```

```typescript
// ❌ Never call api.nextdns.io directly from a component script
<script>
  // ❌ This runs in the browser — key would be exposed
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' },
  });
</script>
```

## Best Practices

- **`$env/static/private`**: SvelteKit enforces this at build time — importing private vars in
  client-accessible modules is a build error, not just a runtime warning.
- **`src/lib/server/`**: Any file under `$lib/server/` cannot be imported by client code; SvelteKit
  throws an error if attempted.
- **`$env/dynamic/private`**: Use `import { env } from '$env/dynamic/private'` when env vars change
  at runtime (e.g., Docker/Kubernetes secrets) instead of at build time.

## Troubleshooting

### Issue: Build fails with "Cannot import private module"

**Symptoms**: Build error mentioning `$env/static/private` or `$lib/server/`.

**Solution**: Move all server-only imports to `+server.ts`, `+page.server.ts`, or
`+layout.server.ts` files. Never import them from `+page.ts` (which runs on client and server).

### Issue: `NEXTDNS_API_KEY` is `undefined`

**Symptoms**: The utility throws `NEXTDNS_API_KEY is not set`.

**Solution**: Add the variable to `.env` (development) or your hosting platform's secret store. Run
`pnpm dev` after editing `.env` — SvelteKit reads it at startup.

## Reference

- [SvelteKit — Routing: +server](https://kit.svelte.dev/docs/routing#server)
- [SvelteKit — \$env/static/private](https://kit.svelte.dev/docs/modules#$env-static-private)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
