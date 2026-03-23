---
title: 'React Router v7 Project Setup'
impact: HIGH
impactDescription:
  'A misconfigured project disables SSR, causing loaders to run in the browser and exposing API keys
  via client-side network requests'
type: capability
tags:
  - react router
  - setup
  - react-router.config
  - ssr
  - environment variables
  - typescript
---

<!-- @case-police-ignore Api -->

# React router v7 project setup

Bootstrap a React Router v7 project with SSR enabled, TypeScript, and secure environment variable
handling for NextDNS API integration

## Overview

React Router v7 is a full-stack React framework (evolved from Remix). It uses **Vite** as its build
tool and supports multiple rendering modes: SSR, CSR, and static pre-rendering. For NextDNS
integration, **SSR must be enabled** so that `loader` and `action` functions run on the server where
`process.env.NEXTDNS_API_KEY` is available.

## Correct usage

### Create a new project

```bash
# ✅ Bootstrap with official CLI
pnpm create react-router@latest my-nextdns-app
cd my-nextdns-app
pnpm install
```

Select **TypeScript** when prompted.

### `React-router.config.ts`

```typescript
// ✅ react-router.config.ts — SSR must be true
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true, // Required: enables server-side loaders and actions
} satisfies Config;
```

### Environment variables

```bash
# .env  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### Directory structure

```text
app/
  lib/
    nextdns.server.ts    # Server-only API utility (.server.ts = stripped from client)
  routes/
    home.tsx             # Dashboard UI route (has default export)
    api.profiles.ts      # Resource route (no default export)
    api.profiles.$id.ts  # Dynamic resource route
  routes.ts              # Route configuration
react-router.config.ts   # Framework config (ssr: true)
```

### Server utility

```typescript
// ✅ app/lib/nextdns.server.ts
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

  if (!res.ok) throw new Error(`NextDNS API error: ${res.status}`);
  return res.json() as Promise<T>;
}
```

### Start development server

```bash
pnpm dev
# Opens http://localhost:5173
```

## Do NOT Use

```typescript
// ❌ Never set ssr: false — disables server loaders, API keys leak to the browser
export default {
  ssr: false, // ❌
} satisfies Config;
```

```bash
# ❌ Never prefix secrets with VITE_ — they are bundled into the client
VITE_NEXTDNS_API_KEY=YOUR_API_KEY  # ❌
```

## Troubleshooting

### Issue: `loader` runs in the browser instead of the server

**Symptoms**: Network tab shows requests to `api.nextdns.io` from the browser.

**Solution**: Set `ssr: true` in `react-router.config.ts`. Without SSR, React Router falls back to
client-side data loading which exposes the API key.

### Issue: TypeScript errors for `route.loaderargs`

**Solution**: Run `pnpm typecheck` or `pnpm dev` once — React Router auto-generates type files
under `app/routes/+types/` based on your route config.

## Reference

- [React Router v7 — Getting Started](https://reactrouter.com/start/framework/installation)
- [React Router v7 — Rendering Modes](https://reactrouter.com/start/framework/rendering)
- [React Router v7 — Route Configuration](https://reactrouter.com/start/framework/routing)
- [NextDNS API Reference](https://nextdns.github.io/api/)
