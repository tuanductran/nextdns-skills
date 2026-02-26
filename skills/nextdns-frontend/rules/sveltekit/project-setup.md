---
title: 'SvelteKit Project Setup'
impact: HIGH
impactDescription:
  'A misconfigured project exposes API keys or breaks server-side rendering, making the NextDNS
  dashboard insecure or non-functional'
type: capability
tags:
  - sveltekit
  - setup
  - svelte.config
  - adapter
  - environment variables
  - typescript
---

<!-- @case-police-ignore Api -->

# SvelteKit Project Setup

Bootstrap a SvelteKit project with TypeScript, an SSR adapter, and secure environment variable
handling for NextDNS API integration

## Overview

SvelteKit requires an **adapter** to deploy to a target platform. The adapter determines how server
routes (`+server.ts`) run — `@sveltejs/adapter-node` for Node.js servers, platform-specific adapters
for Vercel, Netlify, Cloudflare, etc. Without a server-capable adapter, `+server.ts` routes cannot
run and API key security is broken.

## Correct Usage

### Create a new project

```bash
# ✅ Bootstrap with TypeScript enabled
npx sv create my-nextdns-app
cd my-nextdns-app
npm install
```

When prompted: select **SvelteKit minimal** template and enable **TypeScript**.

### Install adapter

```bash
# ✅ Node.js adapter (for self-hosted / Docker deployments)
npm install --save-dev @sveltejs/adapter-node
```

### `svelte.config.js`

```javascript
// ✅ svelte.config.js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

### Environment variables

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### Directory structure

```text
src/
  lib/
    server/
      nextdns.ts       # Server-only API utility
  routes/
    api/
      profiles/
        +server.ts     # GET /api/profiles
        [id]/
          +server.ts   # GET/PATCH/DELETE /api/profiles/[id]
    +page.svelte       # Dashboard page
    +page.server.ts    # Server-side data loading
```

### Verify server-only protection

```typescript
// src/lib/server/nextdns.ts
// ✅ Any file under src/lib/server/ cannot be imported by client code
import { NEXTDNS_API_KEY } from '$env/static/private';
```

## Do NOT Use

```bash
# ❌ Do NOT use adapter-static — it generates a pure static site with no server routes
npm install @sveltejs/adapter-static
```

```javascript
// ❌ Never set fallback in adapter-static config — it disables server routes
adapter: adapter({ fallback: 'index.html' });
```

## Troubleshooting

### Issue: Dev server starts but `/api/*` routes return 404

**Solution**: Ensure `src/routes/api/profiles/+server.ts` exists (with the `+server` prefix) and
exports at least one handler (`GET`, `POST`, etc.).

### Issue: Environment variable is `undefined` in production

**Solution**: Platform-specific secret management is required in production. For Vercel, add secrets
in Project Settings → Environment Variables. For Docker, pass `--env-file .env`.

## Reference

- [SvelteKit — Project Structure](https://kit.svelte.dev/docs/project-structure)
- [SvelteKit — Adapters](https://kit.svelte.dev/docs/adapters)
- [SvelteKit — \$env/static/private](https://kit.svelte.dev/docs/modules#$env-static-private)
- [NextDNS API Reference](https://nextdns.github.io/api/)
