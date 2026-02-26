---
title: 'Project Setup'
impact: HIGH
impactDescription:
  'Missing server-only runtime config or incorrect module setup causes API key leaks and broken API
  calls'
type: capability
tags:
  - nuxt
  - setup
  - project structure
  - nuxt.config
  - environment variables
  - typescript
---

<!-- @case-police-ignore Api -->

# Project Setup

Bootstrap a Nuxt 4 project configured to integrate with the NextDNS API

## Overview

A NextDNS Nuxt frontend requires:

1. A Nuxt 4 project with TypeScript enabled
2. Server-only `runtimeConfig` for the API key
3. A `server/utils/nextdns.ts` shared fetcher
4. Optional: Nuxt UI for components, VueUse for composables

## Correct Usage

### Create the project

```bash
# ✅ Bootstrap with Nuxt 4 (pnpm recommended)
npm create nuxt@latest nextdns-dashboard
cd nextdns-dashboard
pnpm install
```

### Install recommended modules

```bash
# ✅ Nuxt UI — component library (buttons, modals, tables, notifications)
pnpm add @nuxt/ui

# ✅ VueUse — composable utilities (EventSource wrapper, etc.)
pnpm add @vueuse/nuxt @vueuse/core
```

### nuxt.config.ts

```typescript
// ✅ Complete configuration for a NextDNS frontend
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  runtimeConfig: {
    // Server-only — never goes to the browser bundle
    nextdnsApiKey: '', // set via NEXTDNS_API_KEY env var
    nextdnsProfileId: '', // set via NEXTDNS_PROFILE_ID env var (optional default)
  },

  typescript: {
    strict: true,
  },
});
```

### Environment variables

```bash
# .env  (never commit this file)
NUXT_NEXTDNS_API_KEY=YOUR_API_KEY
NUXT_NEXTDNS_PROFILE_ID=abc123
```

### Directory structure

```text
nextdns-dashboard/
├── .env                          # secrets — gitignored
├── nuxt.config.ts
├── server/
│   ├── utils/
│   │   └── nextdns.ts            # shared API fetcher (key lives here)
│   └── api/
│       ├── profiles.get.ts
│       ├── profiles.post.ts
│       ├── profiles/
│       │   ├── [id].get.ts
│       │   ├── [id].patch.ts
│       │   └── [id].delete.ts
│       └── logs/
│           └── stream.get.ts
└── app/
    ├── composables/
    │   └── useProfiles.ts        # client-side composables using /api/*
    └── pages/
        ├── index.vue             # profile list
        └── profiles/
            └── [id].vue          # profile detail / analytics
```

### Shared server utility

```typescript
// ✅ server/utils/nextdns.ts
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

### TypeScript types

```typescript
// ✅ types/nextdns.ts — shared type definitions
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

```bash
# ❌ nuxi generate (static export) — SSE streaming and server routes require a Node server
nuxi generate

# ✅ Use nuxi build instead
nuxi build
```

```typescript
// ❌ Storing the API key in a client-accessible location
const apiKey = useRuntimeConfig().public.nextdnsApiKey; // ❌ exposed to browser
```

## Troubleshooting

### Issue: `@nuxt/ui` styles not loading

**Solution**: Add `@nuxt/ui` to `modules` in `nuxt.config.ts` and restart the dev server.

### Issue: TypeScript errors on `useRuntimeConfig()` in server routes

**Solution**: Nuxt auto-generates types for `runtimeConfig`. Run `nuxi prepare` to refresh:

```bash
nuxi prepare
```

## Reference

- [Nuxt 4 — Getting Started](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Nuxt UI](https://ui.nuxt.com)
- [VueUse](https://vueuse.org)
