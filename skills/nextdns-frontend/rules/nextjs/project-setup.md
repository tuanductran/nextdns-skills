---
title: 'Project Setup'
impact: HIGH
impactDescription:
  'Missing server-only env vars or incorrect App Router setup causes API key leaks and broken Route
  Handlers'
type: capability
tags:
  - next.js
  - setup
  - app router
  - next.config
  - environment variables
  - typescript
---

<!-- @case-police-ignore Api -->

# Project Setup

Bootstrap a Next.js 15 App Router project configured to integrate with the NextDNS API

## Overview

A NextDNS Next.js frontend requires:

1. A Next.js 15 project with TypeScript and the App Router enabled
2. Server-only environment variables (no `NEXT_PUBLIC_` prefix) for the API key
3. A `lib/nextdns.ts` shared fetcher — used exclusively in Route Handlers and Server Components
4. Optional: shadcn/ui for components, SWR or React Query for Client Component data fetching

## Correct Usage

### Create the project

```bash
# ✅ Bootstrap with create-next-app (TypeScript + App Router + Tailwind by default)
npx create-next-app@latest nextdns-dashboard
cd nextdns-dashboard
```

### Install recommended packages

```bash
# ✅ shadcn/ui — component library (buttons, cards, tables, toasts)
npx shadcn@latest init

# ✅ SWR — lightweight Client Component data fetching
npm install swr

# ✅ Or React Query — more feature-rich alternative
npm install @tanstack/react-query
```

### Environment variables

```bash
# .env.local  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

### Directory structure

```text
nextdns-dashboard/
├── .env.local                        # secrets — gitignored
├── next.config.ts
├── lib/
│   └── nextdns.ts                    # shared server-only API fetcher
├── app/
│   ├── layout.tsx                    # root layout
│   ├── page.tsx                      # profile list (Server Component)
│   ├── profiles/
│   │   └── [id]/
│   │       └── page.tsx              # profile detail / analytics
│   └── api/                          # Route Handlers (server-side only)
│       ├── profiles/
│       │   ├── route.ts              # GET /api/profiles, POST /api/profiles
│       │   └── [id]/
│       │       └── route.ts          # GET, PATCH, DELETE /api/profiles/[id]
│       └── logs/
│           └── stream/
│               └── route.ts          # GET /api/logs/stream (SSE)
└── components/                       # Client Components (use client)
    ├── ProfileList.tsx
    └── LogStream.tsx
```

### Shared server utility

```typescript
// ✅ lib/nextdns.ts — only imported in Route Handlers and Server Components
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
    // Disable Next.js default caching for dynamic data
    cache: 'no-store',
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

```typescript
// ❌ Importing lib/nextdns.ts from a Client Component — leaks the env var read
'use client';
import { nextdnsFetch } from '@/lib/nextdns'; // ❌ Client bundle cannot access server env vars

// ❌ Using fetch with force-cache on dynamic data — returns stale NextDNS data
fetch('https://api.nextdns.io/profiles', { cache: 'force-cache' }); // ❌

// ❌ Static export (output: 'export') — SSE Route Handlers require a Node.js server
// next.config.ts
export default { output: 'export' }; // ❌ Breaks all Route Handlers
```

## Troubleshooting

### Issue: TypeScript errors on missing `RouteContext` type

**Solution**: `RouteContext` is globally available after running `next dev` or `next build` (type
generation). Run:

```bash
npx next typegen
```

### Issue: `lib/nextdns.ts` imported in a Client Component causes build error

**Solution**: Add `'server-only'` to guard the file from accidental client-side imports:

```typescript
// lib/nextdns.ts
import 'server-only'

export async function nextdnsFetch<T>(...) { ... }
```

## Reference

- [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [shadcn/ui](https://ui.shadcn.com)
