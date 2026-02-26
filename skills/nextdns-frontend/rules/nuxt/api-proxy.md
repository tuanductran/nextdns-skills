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
  - runtimeConfig
---

<!-- @case-police-ignore Api -->

# API Key Proxy (BFF Pattern)

Proxy all NextDNS API calls through Nuxt server routes to keep X-Api-Key server-side only

## Overview

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible
code. Nuxt 4 server routes (`server/api/`) run exclusively on the server, making them the correct
place to attach the key before forwarding requests to `api.nextdns.io`.

```text
Browser → /api/* (Nuxt server route) → api.nextdns.io (X-Api-Key added here)
```

## Correct Usage

### Environment variable setup

```bash
# .env
NUXT_NEXTDNS_API_KEY=YOUR_API_KEY
NUXT_NEXTDNS_PROFILE_ID=abc123
```

### nuxt.config.ts — server-only runtimeConfig

```typescript
// ✅ Keys without the "public" prefix are server-only
export default defineNuxtConfig({
  runtimeConfig: {
    nextdnsApiKey: '', // filled from NEXTDNS_API_KEY at runtime
    nextdnsProfileId: '', // filled from NEXTDNS_PROFILE_ID at runtime
  },
});
```

### Shared fetch utility

```typescript
// ✅ server/utils/nextdns.ts — reusable server-side fetcher
import type { H3Event } from 'h3';

export function useNextDNSFetch<T>(
  path: string,
  event: H3Event,
  options?: RequestInit
): Promise<T> {
  const config = useRuntimeConfig(event);
  return $fetch<T>(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      'X-Api-Key': config.nextdnsApiKey,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
}
```

### Profile list proxy

```typescript
// ✅ server/api/profiles.get.ts
export default defineEventHandler(async (event) => {
  return useNextDNSFetch('/profiles', event);
});
```

### Dynamic profile proxy

```typescript
// ✅ server/api/profiles/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  return useNextDNSFetch(`/profiles/${id}`, event);
});

// ✅ server/api/profiles/[id].patch.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return useNextDNSFetch(`/profiles/${id}`, event, { method: 'PATCH', body: JSON.stringify(body) });
});
```

## Do NOT Use

```typescript
// ❌ Never put the API key in runtimeConfig.public — it goes to the browser bundle
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      nextdnsApiKey: 'YOUR_API_KEY', // ❌ Visible to every browser user
    },
  },
});

// ❌ Never call api.nextdns.io directly from a Vue component or composable
const { data } = await useFetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key visible in browser network tab
});
```

## Best Practices

- **One utility, one key location**: Use `server/utils/nextdns.ts` as the single place where the key
  is attached — never repeat it across route files.
- **Validate route params server-side**: Call `getRouterParam` in the server route and return a 400
  error before forwarding to NextDNS if params are missing.
- **Rotate keys without redeploying**: Keep the key in `.env` / hosting secret store so rotation
  requires no code change.

## Troubleshooting

### Issue: `useRuntimeConfig().nextdnsApiKey` is empty at runtime

**Symptoms**: API calls return 401 Unauthorized.

**Solution**: Nuxt maps env vars to `runtimeConfig` keys using the `NUXT_` prefix and
SCREAMING_SNAKE_CASE. The camelCase key `nextdnsApiKey` is overridden by `NUXT_NEXTDNS_API_KEY`.

```bash
# Verify the env var is set (must include NUXT_ prefix)
echo $NUXT_NEXTDNS_API_KEY
```

### Issue: Server route returns 500 on missing profile ID

**Solution**: Guard with an early return:

```typescript
const id = getRouterParam(event, 'id');
if (!id) throw createError({ statusCode: 400, message: 'Profile ID required' });
```

## Reference

- [Nuxt 4 — Server Routes](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt 4 — Runtime Config](https://nuxt.com/docs/4.x/guide/going-further/runtime-config)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
