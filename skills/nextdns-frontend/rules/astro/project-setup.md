---
title: 'Project Setup'
impact: HIGH
impactDescription:
  'Omitting the SSR adapter or using the PUBLIC_ prefix on secret keys causes API endpoints to fail
  in production and API keys to leak to the browser'
type: capability
tags:
  - astro
  - setup
  - astro.config
  - ssr
  - adapter
  - react integration
  - environment variables
---

<!-- @case-police-ignore Api -->

# Project Setup

Bootstrap an Astro project with React integration configured to integrate with the NextDNS API

## Overview

A NextDNS Astro + React frontend requires:

1. An Astro project with the `@astrojs/react` integration
2. An SSR adapter (Node.js, Netlify, Vercel, or Cloudflare) for API endpoints
3. Server-only environment variables (no `PUBLIC_` prefix) for the API key
4. A `src/lib/nextdns.ts` shared fetcher used in Astro frontmatter and API endpoints

## Correct Usage

### Create the project

```bash
# ✅ Bootstrap with create-astro (TypeScript template recommended)
npm create astro@latest nextdns-dashboard
cd nextdns-dashboard

# ✅ Add React integration
npx astro add react

# ✅ Add Node.js adapter for SSR (or replace with netlify/vercel/cloudflare)
npx astro add node
```

### Install recommended packages

```bash
# ✅ SWR — lightweight Client Component data fetching
npm install swr

# ✅ Or React Query — more feature-rich alternative
npm install @tanstack/react-query
```

### astro.config.mjs

```javascript
// ✅ Complete configuration for a NextDNS Astro frontend
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  // 'server': all routes SSR by default
  // 'hybrid': static by default, opt-in with export const prerender = false
  output: 'server',

  adapter: node({ mode: 'standalone' }),

  integrations: [react()],
});
```

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Environment variables

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Directory structure

```text
nextdns-dashboard/
├── .env                              # secrets — gitignored
├── astro.config.mjs
├── src/
│   ├── lib/
│   │   └── nextdns.ts                # shared server-only API fetcher
│   ├── pages/
│   │   ├── index.astro               # profile list (server-rendered)
│   │   ├── profiles/
│   │   │   └── [id].astro            # profile detail / analytics
│   │   └── api/                      # API endpoints (server-side only)
│   │       ├── profiles.ts           # GET, POST /api/profiles
│   │       ├── profiles/
│   │       │   └── [id].ts           # GET, PATCH, DELETE /api/profiles/[id]
│   │       └── logs/
│   │           └── stream.ts         # GET /api/logs/stream (SSE)
│   └── components/
│       └── react/                    # React components (interactive islands)
│           ├── ProfileActions.tsx
│           └── LogStream.tsx
└── public/
```

### Shared server utility

```typescript
// ✅ src/lib/nextdns.ts — server-only, never import in React components
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

### TypeScript types

```typescript
// ✅ src/types/nextdns.ts — shared type definitions
export interface NextDNSProfile {
  id: string;
  name: string;
}

export interface NextDNSLogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

export interface NextDNSAnalyticsItem {
  queries: number;
  [key: string]: unknown;
}
```

## Do NOT Use

```typescript
// ❌ Importing src/lib/nextdns.ts in a React component — it won't have server env access
// src/components/react/Profiles.tsx
import { nextdnsFetch } from '../../lib/nextdns'; // ❌ React runs in browser

// ❌ Using output: 'static' with runtime API endpoints
// astro.config.mjs
export default defineConfig({ output: 'static' }); // ❌ API endpoints become build-time only
```

## Troubleshooting

### Issue: `@astrojs/react` installed but components show no hydration

**Solution**: Add the `client:*` directive to the React component in the `.astro` template:

```astro
<!-- ✅ Hydrate the React component on the client -->
<ProfileActions client:load profileId={profile.id} />
```

Without a `client:*` directive, React components render as static HTML only (no JavaScript sent to
the browser).

### Issue: TypeScript JSX errors in `.tsx` files

**Solution**: Ensure `tsconfig.json` has `"jsx": "react-jsx"` and `"jsxImportSource": "react"`.
These are required when using React alongside Astro's own JSX syntax.

## Reference

- [Astro — Installation](https://docs.astro.build/en/install-and-setup/)
- [Astro — React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro — Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
