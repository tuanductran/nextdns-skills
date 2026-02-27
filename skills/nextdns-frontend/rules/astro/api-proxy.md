---
title: 'API Key Proxy (BFF Pattern)'
impact: HIGH
impactDescription:
  'Using the PUBLIC_ prefix on the API key exposes it in the client bundle, granting every browser
  user full access to the NextDNS account'
type: capability
tags:
  - api key
  - security
  - bff
  - endpoint
  - proxy
  - import.meta.env
---

<!-- @case-police-ignore Api -->

# API key proxy (bff pattern)

Proxy all NextDNS API calls through Astro API endpoints to keep X-Api-Key server-side only

## Overview

The NextDNS `X-Api-Key` grants full account access. In Astro, any environment variable **without**
the `PUBLIC_` prefix is server-only and never bundled into the browser. Astro API endpoints
(`src/pages/api/`) run exclusively on the server, making them the correct place to attach the key
before forwarding requests to `api.nextdns.io`.

```text
Browser → /api/* (Astro endpoint) → api.nextdns.io (X-Api-Key added here)
```

> **Requires SSR**: API endpoints with runtime data require an SSR adapter and either
> `output: 'server'` or `output: 'hybrid'` in `astro.config.mjs`.

## Correct usage

### Environment variable setup

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Shared server utility

```typescript
// ✅ src/lib/nextdns.ts — only imported in .astro frontmatter or API endpoints
export async function nextdnsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const apiKey = import.meta.env.NEXTDNS_API_KEY;
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
    throw new Error(body?.errors?.[0]?.detail ?? `NextDNS error ${res.status}`);
  }

  return res.json() as Promise<T>;
}
```

### Profile list endpoint

```typescript
// ✅ src/pages/api/profiles.ts
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../lib/nextdns';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await nextdnsFetch('/profiles');
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### Dynamic profile endpoint

```typescript
// ✅ src/pages/api/profiles/[id].ts
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../../lib/nextdns';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const data = await nextdnsFetch(`/profiles/${params.id}`);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const data = await nextdnsFetch(`/profiles/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  await nextdnsFetch(`/profiles/${params.id}`, { method: 'DELETE' });
  return new Response(null, { status: 204 });
};
```

## Do NOT Use

```typescript
// ❌ PUBLIC_ prefix exposes the key to the browser bundle
// .env
PUBLIC_NEXTDNS_API_KEY = YOUR_API_KEY; // ❌ Visible in browser source

// ❌ Calling api.nextdns.io from a React component
// src/components/react/Profiles.tsx
const res = await fetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': import.meta.env.PUBLIC_NEXTDNS_API_KEY }, // ❌ Key exposed
});
```

## Best practices

- **One utility, one key location**: Use `src/lib/nextdns.ts` as the single place where the key is
  attached — never repeat `import.meta.env.NEXTDNS_API_KEY` across endpoint files.
- **`export const prerender = false`**: Required on every dynamic API endpoint when using
  `output: 'hybrid'` mode. Not needed in `output: 'server'` mode.
- **Rotate keys without redeploying**: Keep the key in `.env` or your hosting platform's secret
  store.

## Troubleshooting

### Issue: `import.meta.env.nextdns_api_key` is `undefined` in an API endpoint

**Solution**: Verify the variable exists in `.env` and does **not** have the `PUBLIC_` prefix.
Non-`PUBLIC_` variables are only available in server-side code (Astro frontmatter, endpoints,
`src/lib/`). They are not accessible in client-side React components.

### Issue: API endpoint returns 404 in production

**Solution**: Ensure your Astro project uses `output: 'server'` or `output: 'hybrid'` with an SSR
adapter. Static builds do not support runtime API endpoints.

## Reference

- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Astro — Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
