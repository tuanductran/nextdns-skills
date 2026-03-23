# NextDNS Frontend Skills

**Version 1.0.0**  
NextDNS Skills  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring NextDNS frontend dashboard integration with Nuxt, Next.js, Astro, SvelteKit, and React Router. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Best practices and guidelines for NextDNS frontend dashboard integration with Nuxt, Next.js, Astro, SvelteKit, and React Router, ordered by impact.

---

## Table of Contents

1. [Nuxt](#1-nuxt) — **MEDIUM**
   - 1.1 [Analytics Charts](#11-analytics-charts)
   - 1.2 [API Key Proxy (BFF Pattern)](#12-api-key-proxy-bff-pattern)
   - 1.3 [Error Handling](#13-error-handling)
   - 1.4 [Profile Management UI](#14-profile-management-ui)
   - 1.5 [Project Setup](#15-project-setup)
   - 1.6 [Real-Time Log Streaming](#16-real-time-log-streaming)
   - 1.7 [TanStack Query (Vue Query) Integration](#17-tanstack-query-vue-query-integration)
2. [Next.js](#2-nextjs) — **MEDIUM**
   - 2.1 [Analytics Charts](#21-analytics-charts)
   - 2.2 [API Key Proxy (BFF Pattern)](#22-api-key-proxy-bff-pattern)
   - 2.3 [Error Handling](#23-error-handling)
   - 2.4 [Profile Management UI](#24-profile-management-ui)
   - 2.5 [Project Setup](#25-project-setup)
   - 2.6 [Real-Time Log Streaming](#26-real-time-log-streaming)
   - 2.7 [TanStack Query v5 Integration](#27-tanstack-query-v5-integration)
3. [Astro](#3-astro) — **MEDIUM**
   - 3.1 [Analytics Charts](#31-analytics-charts)
   - 3.2 [API Key Proxy (BFF Pattern)](#32-api-key-proxy-bff-pattern)
   - 3.3 [Error Handling](#33-error-handling)
   - 3.4 [Profile Management UI](#34-profile-management-ui)
   - 3.5 [Project Setup](#35-project-setup)
   - 3.6 [Real-Time Log Streaming](#36-real-time-log-streaming)
   - 3.7 [Server Islands for Analytics Panels](#37-server-islands-for-analytics-panels)
4. [SvelteKit](#4-sveltekit) — **MEDIUM**
   - 4.1 [Analytics Charts (SvelteKit)](#41-analytics-charts-sveltekit)
   - 4.2 [API Key Proxy (BFF Pattern)](#42-api-key-proxy-bff-pattern)
   - 4.3 [Error Handling (SvelteKit)](#43-error-handling-sveltekit)
   - 4.4 [Log Streaming via SSE (SvelteKit)](#44-log-streaming-via-sse-sveltekit)
   - 4.5 [Profile Management UI (SvelteKit)](#45-profile-management-ui-sveltekit)
   - 4.6 [SSE Alternatives: Polling and Long-Polling](#46-sse-alternatives-polling-and-long-polling)
   - 4.7 [SvelteKit Project Setup](#47-sveltekit-project-setup)
5. [React Router](#5-react-router) — **MEDIUM**
   - 5.1 [Analytics Charts (React Router v7)](#51-analytics-charts-react-router-v7)
   - 5.2 [API Key Proxy (BFF Pattern)](#52-api-key-proxy-bff-pattern)
   - 5.3 [Data Revalidation Strategies (React Router v7)](#53-data-revalidation-strategies-react-router-v7)
   - 5.4 [Error Handling (React Router v7)](#54-error-handling-react-router-v7)
   - 5.5 [Log Streaming via SSE (React Router v7)](#55-log-streaming-via-sse-react-router-v7)
   - 5.6 [Profile Management UI (React Router v7)](#56-profile-management-ui-react-router-v7)
   - 5.7 [React Router v7 Project Setup](#57-react-router-v7-project-setup)

---

## 1. Nuxt

**Impact: MEDIUM**

### 1.1 Analytics Charts

**Impact: MEDIUM ()**

Fetch NextDNS time-series analytics and render them as charts in a Nuxt dashboard

Fetch NextDNS time-series analytics and render them as charts in a Nuxt dashboard

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.

- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an

  array of counts over time, suitable for line or bar charts.

Both shapes are fetched through a Nuxt server route to keep the API key server-side.

- **Always pass `from`**: Omitting the date range returns all-time data, which is slow and can

  overwhelm a chart.

- **Use `;series` for trend charts**: Aggregated endpoints return a single number — time series

  returns arrays for plotting over time.

- **Cache analytics responses**: Analytics data does not change in real-time. Use Nuxt's

  `getCachedData` or `useAsyncData` with `dedupe: 'defer'` to avoid redundant fetches.

- **Limit to `limit=10`** for top-N tables to keep response sizes small.

**Symptoms**: The number of data points in `queries` does not match `meta.series.times`.

**Solution**: Both arrays have the same length by design. Ensure you are reading from

`data.meta.series.times` (not constructing timestamps manually).

**Symptoms**: No queries are shown even though the profile is active.

**Solution**: Verify the `from` date range covers a period where the profile was in use. Check the

profile's logs to confirm queries were made.

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

- [NextDNS API — Time Series](https://nextdns.github.io/api/#time-series)

- [Nuxt 4 — useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch)

**Correct: Server routes**

```typescript
// ✅ server/api/profiles/[id]/analytics/[endpoint].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const endpoint = getRouterParam(event, 'endpoint');
  if (!id || !endpoint) throw createError({ statusCode: 400, message: 'Missing params' });

  const query = getQuery(event);
  const params = new URLSearchParams(query as Record<string, string>);

  return useNextDNSFetch(`/profiles/${id}/analytics/${endpoint}?${params}`, event);
});
```

**Correct: Composable — aggregated analytics**

```typescript
// ✅ app/composables/useAnalytics.ts
export function useAnalytics(
  profileId: string,
  endpoint: string,
  params: Record<string, string> = {}
) {
  const query = { from: '-7d', ...params };
  return useFetch(`/api/profiles/${profileId}/analytics/${endpoint}`, { query });
}
```

**Correct: Status donut chart (aggregated)**

```vue
<script setup lang="ts">
const props = defineProps<{ profileId: string }>();

const { data } = await useAnalytics(props.profileId, 'status', { from: '-7d' });

// Transform for a chart library (e.g., Chart.js, ApexCharts, or VueUse's useChart)
const chartData = computed(() => ({
  labels: data.value?.data.map((d: { status: string }) => d.status) ?? [],
  values: data.value?.data.map((d: { queries: number }) => d.queries) ?? [],
}));
</script>

<template>
  <div>
    <h2>Query Status (Last 7 days)</h2>
    <!-- Pass chartData to your chart component -->
    <pre>{{ chartData }}</pre>
  </div>
</template>
```

**Correct: Query trend line chart (time series)**

```typescript
// ✅ Fetch time-series data: append ";series" to the endpoint name
const { data } = await useFetch(`/api/profiles/${profileId}/analytics/status;series`, {
  query: { from: '-7d', interval: '1d' },
});

// data.value.data → array of { status, queries: number[] }
// data.value.meta.series.times → array of ISO timestamps (x-axis)

const times = computed(() => data.value?.meta?.series?.times ?? []);
const blockedSeries = computed(
  () => data.value?.data.find((d: { status: string }) => d.status === 'blocked')?.queries ?? []
);
```

**Correct: Top blocked domains table**

```vue
<script setup lang="ts">
const props = defineProps<{ profileId: string }>();

const { data } = await useFetch(`/api/profiles/${props.profileId}/analytics/domains`, {
  query: { status: 'blocked', from: '-7d', limit: 10 },
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Domain</th>
        <th>Queries</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data?.data" :key="item.domain">
        <td>{{ item.domain }}</td>
        <td>{{ item.queries }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

**Incorrect:**

```typescript
// ❌ Fetching analytics without a date range — defaults to all-time, very slow
await useFetch(`/api/profiles/${profileId}/analytics/status`);
// ✅ Always pass at least `from`
await useFetch(`/api/profiles/${profileId}/analytics/status`, { query: { from: '-7d' } });

// ❌ Using the raw /analytics/* endpoint directly from browser
await useFetch('https://api.nextdns.io/profiles/abc123/analytics/status', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key in browser
});
```

### 1.2 API Key Proxy (BFF Pattern)

**Impact: HIGH ()**

Proxy all NextDNS API calls through Nuxt server routes to keep X-Api-Key server-side only

Proxy all NextDNS API calls through Nuxt server routes to keep X-Api-Key server-side only

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible

code. Nuxt 4 server routes (`server/api/`) run exclusively on the server, making them the correct

place to attach the key before forwarding requests to `api.nextdns.io`.

- **One utility, one key location**: Use `server/utils/nextdns.ts` as the single place where the key

  is attached — never repeat it across route files.

- **Validate route params server-side**: Call `getRouterParam` in the server route and return a 400

  error before forwarding to NextDNS if params are missing.

- **Rotate keys without redeploying**: Keep the key in `.env` / hosting secret store so rotation

  requires no code change.

**Symptoms**: API calls return 401 Unauthorized.

**Solution**: Nuxt maps env vars to `runtimeConfig` keys using the `NUXT_` prefix and

SCREAMING_SNAKE_CASE. The camelCase key `nextdnsApiKey` is overridden by `NUXT_NEXTDNS_API_KEY`.

**Solution**: Guard with an early return:

- [Nuxt 4 — Server Routes](https://nuxt.com/docs/4.x/directory-structure/server)

- [Nuxt 4 — Runtime Config](https://nuxt.com/docs/4.x/guide/going-further/runtime-config)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

**Correct: Environment variable setup**

```bash
# .env
NUXT_NEXTDNS_API_KEY=YOUR_API_KEY
NUXT_NEXTDNS_PROFILE_ID=abc123
```

**Correct: Nuxt.config.ts — server-only runtimeconfig**

```typescript
// ✅ Keys without the "public" prefix are server-only
export default defineNuxtConfig({
  runtimeConfig: {
    nextdnsApiKey: '', // filled from NEXTDNS_API_KEY at runtime
    nextdnsProfileId: '', // filled from NEXTDNS_PROFILE_ID at runtime
  },
});
```

**Correct: Shared fetch utility**

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

**Correct: Profile list proxy**

```typescript
// ✅ server/api/profiles.get.ts
export default defineEventHandler(async (event) => {
  return useNextDNSFetch('/profiles', event);
});
```

**Correct: Dynamic profile proxy**

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

**Incorrect:**

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

### 1.3 Error Handling

**Impact: MEDIUM ()**

Map NextDNS API errors to user-friendly Nuxt UI notifications

Map NextDNS API errors to user-friendly Nuxt UI notifications

The NextDNS API returns errors in two formats:

- **400 Bad Request** with `{ "errors": [...] }` — validation errors (invalid input).

- **200 OK** with `{ "errors": [...] }` — user-level errors (for example, duplicate profile name).

Both must be handled explicitly. Nuxt server routes should translate upstream errors into H3 errors,

and Vue components should display them via Nuxt UI toasts.

- **Always check `json.errors`**: The NextDNS API returns user errors inside a 200 response — HTTP

  status alone is not sufficient.

- **Use Nuxt UI `useToast`**: Toast notifications are non-blocking and keep the UI usable after

  transient errors.

- **Provide actionable messages**: Translate error codes like `invalid` into sentences like _"Domain

  format is invalid — use example.com without a trailing dot."_

- **Log server-side errors**: Use `console.error` in server routes to capture upstream failures

  without exposing details to the browser.

**Solution**: `useToast` requires `@nuxt/ui`. Ensure the module is installed and added to

`nuxt.config.ts`. Also wrap your `app.vue` with `<UApp>` which provides the toast provider:

**Solution**: When using `createError`, pass details in the `data` field — Nuxt serialises it to the

client:

- [Nuxt 4 — Error Handling](https://nuxt.com/docs/4.x/getting-started/error-handling)

- [Nuxt UI — Toast](https://ui.nuxt.com/components/toast)

- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)

**Correct: Server route — translate upstream errors**

```typescript
// ✅ server/utils/nextdns.ts — error-aware fetcher
import type { H3Event } from 'h3';

export async function useNextDNSFetch<T>(
  path: string,
  event: H3Event,
  options?: RequestInit
): Promise<T> {
  const config = useRuntimeConfig(event);

  const response = await fetch(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      'X-Api-Key': config.nextdnsApiKey,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const json = await response.json();

  // Both 4xx and 200 responses may contain errors
  if (json.errors?.length) {
    const first = json.errors[0];
    throw createError({
      statusCode: response.ok ? 422 : response.status,
      message: first.detail ?? first.code ?? 'NextDNS API error',
      data: json.errors,
    });
  }

  return json as T;
}
```

**Correct: Vue composable — handle errors from usefetch**

```typescript
// ✅ app/composables/useProfiles.ts — surface errors via Nuxt UI toast
export function useProfiles() {
  const toast = useToast();

  async function createProfile(name: string) {
    try {
      await $fetch('/api/profiles', { method: 'POST', body: { name } });
      toast.add({ title: 'Profile created', color: 'success' });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to create profile';
      toast.add({ title: 'Error', description: message, color: 'error' });
    }
  }

  return { createProfile };
}
```

**Correct: Global error handler for usefetch**

```vue
<script setup lang="ts">
const { data, error } = await useFetch('/api/profiles');
</script>

<template>
  <div v-if="error">
    <UAlert color="error" :title="error.message ?? 'Failed to load profiles'" />
  </div>
  <ul v-else>
    <li v-for="profile in data?.data" :key="profile.id">{{ profile.name }}</li>
  </ul>
</template>
```

**Correct: 404 And 401 handling in server routes**

```typescript
// ✅ Return meaningful HTTP errors to the client
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Profile ID is required' });

  try {
    return await useNextDNSFetch(`/profiles/${id}`, event);
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404) throw createError({ statusCode: 404, message: `Profile ${id} not found` });
    throw err;
  }
});
```

**Incorrect:**

```typescript
// ❌ Swallowing errors silently
try {
  await $fetch('/api/profiles', { method: 'DELETE' })
} catch {
  // ❌ User gets no feedback
}

// ❌ Displaying raw JSON errors to users
const { error } = await useFetch('/api/profiles')
// ❌
<pre>{{ error }}</pre>

// ❌ Checking only HTTP status — NextDNS also returns errors in 200 responses
if (response.status !== 200) handleError() // ❌ Misses 200-with-errors case
```

### 1.4 Profile Management UI

**Impact: MEDIUM ()**

Build profile list, create, update, and delete flows with Nuxt 4 composables

Build profile list, create, update, and delete flows with Nuxt 4 composables

Profile management in a Nuxt frontend relies on calling the Nuxt server routes (which proxy to the

NextDNS API) via `useFetch` or `$fetch`. Keep data-fetching logic in composables and UI in pages.

- **Always use server-generated IDs**: After `createProfile`, call `fetchProfiles()` to get the real

  ID assigned by NextDNS — never assume or generate IDs client-side.

- **Use `useState` for shared profile state**: Prevents redundant fetches across components on the

  same page.

- **Guard deletions with confirmation dialogs**: Profile deletion is irreversible and clears all

  associated logs.

**Solution**: Call `refreshNuxtData()` or re-fetch explicitly after mutations:

- [Nuxt 4 — useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch)

- [Nuxt 4 — useState](https://nuxt.com/docs/4.x/api/composables/use-state)

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

**Correct: Composable — profile crud**

```typescript
// ✅ app/composables/useProfiles.ts
export function useProfiles() {
  const profiles = useState<{ id: string; name: string }[]>('profiles', () => []);

  async function fetchProfiles() {
    const { data } = await useFetch<{ data: { id: string; name: string }[] }>('/api/profiles');
    if (data.value) profiles.value = data.value.data;
  }

  async function createProfile(name: string) {
    await $fetch('/api/profiles', {
      method: 'POST',
      body: { name },
    });
    await fetchProfiles();
  }

  async function updateProfile(id: string, patch: Record<string, unknown>) {
    await $fetch(`/api/profiles/${id}`, {
      method: 'PATCH',
      body: patch,
    });
    await fetchProfiles();
  }

  async function deleteProfile(id: string) {
    await $fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    profiles.value = profiles.value.filter((p) => p.id !== id);
  }

  return { profiles, fetchProfiles, createProfile, updateProfile, deleteProfile };
}
```

**Correct: Profile list page**

```vue
<script setup lang="ts">
const { profiles, fetchProfiles, deleteProfile } = useProfiles();
await fetchProfiles();
</script>

<template>
  <div>
    <h1>Profiles</h1>
    <ul>
      <li v-for="profile in profiles" :key="profile.id">
        {{ profile.name }} ({{ profile.id }})
        <UButton color="error" @click="deleteProfile(profile.id)">Delete</UButton>
        <NuxtLink :to="`/profiles/${profile.id}`">View</NuxtLink>
      </li>
    </ul>
  </div>
</template>
```

**Correct: Profile detail page**

```vue
<script setup lang="ts">
const route = useRoute();
const profileId = route.params.id as string;

const { data: profile } = await useFetch(`/api/profiles/${profileId}`);
</script>

<template>
  <div v-if="profile">
    <h1>{{ profile.data.name }}</h1>
    <pre>{{ profile.data }}</pre>
  </div>
</template>
```

**Correct: Server routes**

```typescript
// ✅ server/api/profiles.get.ts
export default defineEventHandler((event) => useNextDNSFetch('/profiles', event));

// ✅ server/api/profiles.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return useNextDNSFetch('/profiles', event, { method: 'POST', body: JSON.stringify(body) });
});

// ✅ server/api/profiles/[id].get.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Profile ID required' });
  return useNextDNSFetch(`/profiles/${id}`, event);
});

// ✅ server/api/profiles/[id].patch.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Profile ID required' });
  const body = await readBody(event);
  return useNextDNSFetch(`/profiles/${id}`, event, { method: 'PATCH', body: JSON.stringify(body) });
});

// ✅ server/api/profiles/[id].delete.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Profile ID required' });
  return useNextDNSFetch(`/profiles/${id}`, event, { method: 'DELETE' });
});
```

**Incorrect:**

```typescript
// ❌ Calling api.nextdns.io directly from a composable
const { data } = await useFetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed to browser
});

// ❌ Mutating profiles array without refreshing from server on create/update
profiles.value.push({ id: 'unknown', name }); // ❌ ID is server-generated
```

### 1.5 Project Setup

**Impact: HIGH ()**

Bootstrap a Nuxt 4 project configured to integrate with the NextDNS API

Bootstrap a Nuxt 4 project configured to integrate with the NextDNS API

A NextDNS Nuxt frontend requires:

1. A Nuxt 4 project with TypeScript enabled

2. Server-only `runtimeConfig` for the API key

3. A `server/utils/nextdns.ts` shared fetcher

4. Optional: Nuxt UI for components, VueUse for composables

**Solution**: Add `@nuxt/ui` to `modules` in `nuxt.config.ts` and restart the dev server.

**Solution**: Nuxt auto-generates types for `runtimeConfig`. Run `nuxi prepare` to refresh:

- [Nuxt 4 — Getting Started](https://nuxt.com/docs/4.x/getting-started/introduction)

- [Nuxt UI](https://ui.nuxt.com)

- [VueUse](https://vueuse.org)

**Correct: Create the project**

```bash
# ✅ Bootstrap with Nuxt 4 (pnpm recommended)
pnpm create nuxt@latest nextdns-dashboard
cd nextdns-dashboard
pnpm install
```

**Correct: Install recommended modules**

```bash
# ✅ Nuxt UI — component library (buttons, modals, tables, notifications)
pnpm add @nuxt/ui

# ✅ VueUse — composable utilities (EventSource wrapper, etc.)
pnpm add @vueuse/nuxt @vueuse/core
```

**Correct: Nuxt.config.ts**

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

**Correct: Environment variables**

```bash
# .env  (never commit this file)
NUXT_NEXTDNS_API_KEY=YOUR_API_KEY
NUXT_NEXTDNS_PROFILE_ID=abc123
```

**Correct: Directory structure**

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

**Correct: Shared server utility**

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

**Correct: TypeScript types**

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

**Incorrect:**

```bash
# ❌ nuxi generate (static export) — SSE streaming and server routes require a Node server
nuxi generate

# ✅ Use nuxi build instead
nuxi build
```

**Incorrect:**

```typescript
// ❌ Storing the API key in a client-accessible location
const apiKey = useRuntimeConfig().public.nextdnsApiKey; // ❌ exposed to browser
```

### 1.6 Real-Time Log Streaming

**Impact: HIGH ()**

Proxy the NextDNS SSE log stream through a Nuxt server route and consume it in Vue

Proxy the NextDNS SSE log stream through a Nuxt server route and consume it in Vue

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from

the browser because SSE via `EventSource` does not support custom headers. The solution is a Nuxt

server route that opens the upstream SSE connection (with the key server-side) and pipes the stream

to the browser.

- **Cap the in-memory log buffer**: SSE delivers logs continuously; limit the array to prevent

  unbounded memory growth (500 entries is a good default).

- **Handle reconnection**: `EventSource` auto-reconnects on disconnect, but implement a manual

  reconnect UI for when the user navigates away and returns.

- **Use the `id` field to resume streams**: The `/logs/stream` endpoint supports an `id` query param

  to resume from the last received event — pass `event.lastEventId` when reconnecting.

**Symptoms**: `EventSource` opens successfully but no `onmessage` events fire.

**Solution**: Verify the upstream NextDNS SSE connection is healthy by testing the server route

directly:

**Solution**: `sendStream` is a Nuxt H3 utility. Ensure you are using Nuxt 4.x and import is

resolved automatically in server routes.

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)

- [Nuxt 4 — sendStream (H3)](https://h3.unjs.io/utils/response#sendstreamevent-stream)

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

**Correct: Server route — sse proxy**

```typescript
// ✅ server/api/logs/stream.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const profileId = query.profileId as string;

  if (!profileId) throw createError({ statusCode: 400, message: 'profileId required' });

  // Set SSE response headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Open upstream SSE connection with the API key
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': config.nextdnsApiKey },
  });

  if (!upstream.body) throw createError({ statusCode: 502, message: 'No stream body' });

  // Pipe the upstream stream directly to the browser response
  return sendStream(event, upstream.body);
});
```

**Correct: Vue composable — consume sse**

```typescript
// ✅ app/composables/useLogStream.ts
import type { Ref } from 'vue';

export interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

export function useLogStream(profileId: Ref<string>) {
  const logs = ref<LogEntry[]>([]);
  const connected = ref(false);
  let source: EventSource | null = null;

  function connect() {
    if (source) source.close();

    source = new EventSource(`/api/logs/stream?profileId=${profileId.value}`);

    source.onopen = () => {
      connected.value = true;
    };

    source.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        logs.value.unshift(entry); // newest first
        if (logs.value.length > 500) logs.value.pop(); // cap at 500 entries
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      connected.value = false;
      source?.close();
    };
  }

  function disconnect() {
    source?.close();
    source = null;
    connected.value = false;
  }

  // Reconnect when profile changes
  watch(profileId, connect, { immediate: true });

  onUnmounted(disconnect);

  return { logs, connected, connect, disconnect };
}
```

**Correct: Log stream page**

```vue
<script setup lang="ts">
const route = useRoute();
const profileId = computed(() => route.params.id as string);
const { logs, connected } = useLogStream(profileId);
</script>

<template>
  <div>
    <p>Status: {{ connected ? '🟢 Live' : '🔴 Disconnected' }}</p>
    <ul>
      <li v-for="log in logs" :key="log.timestamp + log.domain">
        <span>{{ log.timestamp }}</span>
        <span :class="log.status === 'blocked' ? 'text-red-500' : 'text-green-500'">
          {{ log.status }}
        </span>
        <span>{{ log.domain }}</span>
      </li>
    </ul>
  </div>
</template>
```

**Incorrect:**

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
);

// ❌ Polling /api/logs every second instead of using SSE — wasteful and laggy
setInterval(() => fetchLogs(), 1000);
```

### 1.7 TanStack Query (Vue Query) Integration

**Impact: MEDIUM (Without mutation invalidation, the UI shows stale profile data after create or delete operations)**

Use TanStack Query (Vue Query) in a Nuxt 4 project for advanced data fetching with caching, mutations, and infinite pagination for NextDNS data

Use TanStack Query (Vue Query) in a Nuxt 4 project for advanced data fetching with caching, mutations, and infinite pagination for NextDNS data

While Nuxt's built-in `useFetch` is sufficient for simple cases, TanStack Query (Vue Query) provides

more powerful primitives for:

- **Automatic cache invalidation** after mutations

- **Optimistic updates** for instant UI feedback on delete/create

- **Infinite queries** for paginating through large log or analytics datasets

- **Background refetching** and stale-while-revalidate patterns

All API calls still go through Nuxt server routes — Vue Query fetches from `/api/*`, never directly

from `api.nextdns.io`.

- [TanStack Query — Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview)

- [Nuxt 4 — Server Routes](https://nuxt.com/docs/4.x/directory-structure/server)

- [NextDNS API — Pagination](https://nextdns.github.io/api/#pagination)

**Incorrect:**

```typescript
// ❌ Calling api.nextdns.io directly from a Vue Query queryFn
useQuery({
  queryKey: ['profiles'],
  queryFn: () =>
    fetch('https://api.nextdns.io/profiles', {
      headers: { 'X-Api-Key': 'YOUR_KEY' }, // ❌ Key exposed in browser
    }).then((r) => r.json()),
});

// ❌ Not invalidating after mutation — cache becomes stale
useMutation({
  mutationFn: deleteProfile,
  // ❌ Missing onSettled: () => queryClient.invalidateQueries(...)
});
```

---

## 2. Next.js

**Impact: MEDIUM**

### 2.1 Analytics Charts

**Impact: MEDIUM ()**

Fetch NextDNS time-series analytics and render them as charts in a Next.js dashboard

Fetch NextDNS time-series analytics and render them as charts in a Next.js dashboard

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.

- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an

  array of counts over time, suitable for line or bar charts.

Both shapes are fetched through a Next.js Route Handler (or directly in a Server Component) to keep

the API key server-side.

- **Always include `from=`**: Scoped time ranges are faster and return more relevant data.

- **Cache Server Component fetches**: For dashboard-level data, set `next: { revalidate: 60 }` in

  `nextdnsFetch` options to cache results for 60 seconds.

- **Use Client Components for interactive date pickers**: Allow users to change the time range

  without a full page navigation by fetching from Route Handlers in Client Components.

**Symptoms**: `nextdnsFetch` throws a `NextDNS error 404`.

**Solution**: Verify the endpoint path. The `;series` suffix is part of the URL path segment, not a

query parameter. Example: `/analytics/status;series` (correct) vs `/analytics/status?series`

(incorrect).

**Symptoms**: The series array is missing some time points.

**Solution**: NextDNS only returns data points where at least one query occurred. Gaps indicate

zero-query intervals, which is normal. Fill them client-side when rendering charts.

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)

- [SWR Documentation](https://swr.vercel.app)

**Correct: Route handler — analytics proxy**

```typescript
// ✅ app/api/profiles/[id]/analytics/[endpoint]/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: RouteContext<{ id: string; endpoint: string }>) {
  const { id, endpoint } = await context.params;
  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();

  // Forward time range and other query params
  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }

  const data = await nextdnsFetch(`/profiles/${id}/analytics/${endpoint}?${params}`);
  return NextResponse.json(data);
}
```

**Correct: Server component — aggregated analytics**

```tsx
// ✅ app/profiles/[id]/analytics/page.tsx — Server Component
import { nextdnsFetch } from '@/lib/nextdns';

interface StatusItem {
  status: string;
  queries: number;
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch last 7 days of status breakdown
  const { data: statusData } = await nextdnsFetch<{ data: StatusItem[] }>(
    `/profiles/${id}/analytics/status?from=-7d`
  );

  return (
    <main>
      <h1>Analytics</h1>
      <ul>
        {statusData.map((item) => (
          <li key={item.status}>
            {item.status}: {item.queries} queries
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Correct: Client component — time-series chart with swr**

```tsx
// ✅ components/StatusChart.tsx — Client Component for interactive charts
'use client';

import useSWR from 'swr';

interface SeriesPoint {
  timestamp: string;
  queries: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StatusChart({ profileId }: { profileId: string }) {
  const { data, isLoading } = useSWR(
    `/api/profiles/${profileId}/analytics/status;series?from=-7d`,
    fetcher,
    { refreshInterval: 60_000 } // refresh every 60 seconds
  );

  if (isLoading) return <p>Loading chart…</p>;

  const series: SeriesPoint[] = data?.data ?? [];

  return (
    <ul>
      {series.map((point) => (
        <li key={point.timestamp}>
          {point.timestamp}: {point.queries}
        </li>
      ))}
    </ul>
  );
}
```

**Incorrect: Supported `from` values**

```typescript
// ❌ Fetching analytics without a time range — returns all-time data (very slow)
nextdnsFetch(`/profiles/${id}/analytics/status`); // ❌ No from= param

// ❌ Fetching analytics directly from a Client Component
('use client');
useEffect(() => {
  fetch(`https://api.nextdns.io/profiles/${id}/analytics/status`, {
    headers: { 'X-Api-Key': '...' }, // ❌ Key in browser
  });
}, []);
```

### 2.2 API Key Proxy (BFF Pattern)

**Impact: HIGH ()**

Proxy all NextDNS API calls through Next.js Route Handlers to keep X-Api-Key server-side only

Proxy all NextDNS API calls through Next.js Route Handlers to keep X-Api-Key server-side only

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible

code. Next.js Route Handlers (`app/api/`) run exclusively on the server, making them the correct

place to attach the key before forwarding requests to `api.nextdns.io`.

- **One utility, one key location**: Use `lib/nextdns.ts` as the single place where the key is

  attached — never repeat `process.env.NEXTDNS_API_KEY` across Route Handler files.

- **No `NEXT_PUBLIC_` prefix**: Non-prefixed env vars in `.env.local` are server-only and never

  bundled into client JavaScript. Use `NEXTDNS_API_KEY`, not `NEXT_PUBLIC_NEXTDNS_API_KEY`.

- **Rotate keys without redeploying**: Keep the key in `.env.local` or a hosting secret store.

**Symptoms**: The utility throws `NEXTDNS_API_KEY is not set`.

**Solution**: Ensure the variable is defined in `.env.local` (development) or in your hosting

platform's environment secrets (production). Next.js does NOT auto-load `.env` files at runtime in

production — secrets must be set as OS-level env vars.

**Symptoms**: The key appears in browser DevTools → Application → JavaScript.

**Solution**: Remove the `NEXT_PUBLIC_` prefix and move all fetching logic to Route Handlers or

Server Components.

- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

- [Next.js — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

**Correct: Environment variable setup**

```bash
# .env.local  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Shared server utility**

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

**Correct: Profile list route handler**

```typescript
// ✅ app/api/profiles/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await nextdnsFetch('/profiles');
  return NextResponse.json(data);
}
```

**Correct: Dynamic profile route handler**

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

**Incorrect:**

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

### 2.3 Error Handling

**Impact: MEDIUM ()**

Map NextDNS API errors to user-friendly React and Next.js error UI

Map NextDNS API errors to user-friendly React and Next.js error UI

The NextDNS API returns errors in two formats:

- **HTTP 4xx/5xx** with `{ "errors": [...] }` — validation or auth errors.

- **HTTP 200 OK** with `{ "errors": [...] }` — user-level errors (for example, duplicate name).

Both must be handled explicitly. Next.js Route Handlers should return typed error responses, and

React components should display them via error boundaries or toast notifications.

- **Check `json.errors` first**: NextDNS returns user errors inside 200 responses — HTTP status

  alone is not sufficient.

- **Keep error messages user-friendly**: Translate codes like `invalid` into sentences like _"Domain

  format is invalid — use example.com without a trailing dot."_

- **Use `error.tsx` files per segment**: Next.js error boundaries are scoped — a profile page error

  won't crash the whole dashboard.

- **Log server-side errors**: Use `console.error` in Route Handlers to capture upstream failures

  without exposing details to the browser.

**Solution**: `error.tsx` must be a **Client Component** (`'use client'` at the top). Server

Components cannot be error boundaries in Next.js.

**Solution**: Ensure the Route Handler returns a JSON body with an `error` field:

- [Next.js — Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

- [Next.js — global-error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error)

- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)

**Correct: Route handler — return typed errors**

```typescript
// ✅ lib/nextdns.ts — throw structured errors from the fetcher
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
    cache: 'no-store',
  });

  const json = await res.json();

  // Both 4xx and 200 responses may contain errors
  if (json.errors?.length) {
    const first = json.errors[0];
    const status = res.ok ? 422 : res.status;
    const err = new Error(first.detail ?? first.code ?? 'NextDNS API error');
    (err as NodeJS.ErrnoException).code = String(status);
    throw err;
  }

  return json as T;
}
```

**Correct:**

```typescript
// ✅ app/api/profiles/route.ts — translate server errors to HTTP responses
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await nextdnsFetch('/profiles', { method: 'POST', body: JSON.stringify(body) });
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = Number((err as NodeJS.ErrnoException).code) || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

**Correct: Next.js error boundary — page-level errors**

```tsx
// ✅ app/profiles/[id]/error.tsx — Client Component, catches errors in the segment
'use client';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Failed to load profile</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Correct: Client component — toast on mutation failure**

```tsx
// ✅ components/ProfileActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProfileForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') }),
    });

    if (!res.ok) {
      const { error: message } = await res.json();
      setError(message ?? 'Failed to create profile');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Profile name" required />
      <button type="submit">Create</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

**Correct: Global error page**

```tsx
// ✅ app/global-error.tsx — catches root layout errors
'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Reload</button>
      </body>
    </html>
  );
}
```

**Incorrect:**

```tsx
// ❌ Swallowing errors silently in a Client Component
const res = await fetch('/api/profiles', { method: 'DELETE' });
// ❌ No error check — user gets no feedback if delete fails

// ❌ Checking only HTTP status — NextDNS also returns errors in 200 responses
// lib/nextdns.ts
if (!res.ok) throw new Error('error'); // ❌ Misses 200-with-errors case

// ❌ Exposing raw NextDNS error objects to the browser
return NextResponse.json(err, { status: 500 }); // ❌ May leak internal details
```

### 2.4 Profile Management UI

**Impact: MEDIUM ()**

Build profile list, create, update, and delete flows using Next.js App Router patterns

Build profile list, create, update, and delete flows using Next.js App Router patterns

In Next.js App Router, profile data is fetched in **Server Components** (no extra client JS, no API

key exposure). Mutations (create, update, delete) are triggered from **Client Components** via Route

Handlers. Server Actions are an alternative for forms.

- **Use `router.refresh()`** after mutations instead of full page reloads — it re-runs Server

  Component data fetching without a hard navigation.

- **Use Server Components for initial data**: Profile lists loaded at page render should come from

  Server Components, not `useEffect` hooks.

- **Use Server Actions for forms**: For create/update forms, Server Actions avoid writing a

  dedicated Route Handler.

**Solution**: Call `router.refresh()` after the mutation to revalidate Server Component data:

**Solution**: In Next.js 15, `params` in pages and Route Handlers is a **Promise**. Always await it:

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

**Correct: Route handlers (server-side)**

```typescript
// ✅ app/api/profiles/route.ts
import { nextdnsFetch } from '@/lib/nextdns';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await nextdnsFetch('/profiles');
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await nextdnsFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status: 201 });
}
```

**Correct:**

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

export async function DELETE(_req: Request, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  await nextdnsFetch(`/profiles/${id}`, { method: 'DELETE' });
  return new Response(null, { status: 204 });
}
```

**Correct: Server component — profile list page**

```tsx
// ✅ app/page.tsx — Server Component, no 'use client' needed
import { nextdnsFetch } from '@/lib/nextdns';
import type { NextDNSProfile } from '@/types/nextdns';
import ProfileActions from '@/components/ProfileActions';

export default async function ProfilesPage() {
  const { data: profiles } = await nextdnsFetch<{ data: NextDNSProfile[] }>('/profiles');

  return (
    <main>
      <h1>Profiles</h1>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            {profile.name} ({profile.id})
            <ProfileActions profileId={profile.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

**Correct: Client component — profile actions**

```tsx
// ✅ components/ProfileActions.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function ProfileActions({ profileId }: { profileId: string }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
    router.refresh(); // Re-fetch Server Component data
  }

  return (
    <button onClick={handleDelete} className="text-red-500">
      Delete
    </button>
  );
}
```

**Correct: Profile detail page**

```tsx
// ✅ app/profiles/[id]/page.tsx — Server Component
import { nextdnsFetch } from '@/lib/nextdns';
import type { NextDNSProfile } from '@/types/nextdns';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: profile } = await nextdnsFetch<{ data: NextDNSProfile }>(`/profiles/${id}`);

  return (
    <main>
      <h1>{profile.name}</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </main>
  );
}
```

**Incorrect:**

```tsx
// ❌ Fetching directly from api.nextdns.io in a Client Component
'use client'
const [profiles, setProfiles] = useState([])
useEffect(() => {
  fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': '...' }, // ❌ Key exposed to browser
  }).then((r) => r.json()).then((d) => setProfiles(d.data))
}, [])

// ❌ Adding 'use client' to a page just to fetch data — use Server Components instead
'use client'
export default function ProfilesPage() { ... } // ❌ Unnecessary client bundle
```

### 2.5 Project Setup

**Impact: HIGH ()**

Bootstrap a Next.js 15 App Router project configured to integrate with the NextDNS API

Bootstrap a Next.js 15 App Router project configured to integrate with the NextDNS API

A NextDNS Next.js frontend requires:

1. A Next.js 15 project with TypeScript and the App Router enabled

2. Server-only environment variables (no `NEXT_PUBLIC_` prefix) for the API key

3. A `lib/nextdns.ts` shared fetcher — used exclusively in Route Handlers and Server Components

4. Optional: shadcn/ui for components, SWR or React Query for Client Component data fetching

**Solution**: `RouteContext` is globally available after running `next dev` or `next build` (type

generation). Run:

**Solution**: Add `'server-only'` to guard the file from accidental client-side imports:

- [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation)

- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)

- [Next.js — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

- [shadcn/ui](https://ui.shadcn.com)

**Correct: Create the project**

```bash
# ✅ Bootstrap with create-next-app (TypeScript + App Router + Tailwind by default)
pnpm create next-app@latest nextdns-dashboard
cd nextdns-dashboard
```

**Correct: Install recommended packages**

```bash
# ✅ shadcn/ui — component library (buttons, cards, tables, toasts)
pnpm dlx shadcn@latest init

# ✅ SWR — lightweight Client Component data fetching
pnpm add swr

# ✅ Or React Query — more feature-rich alternative
pnpm add @tanstack/react-query
```

**Correct: Environment variables**

```bash
# .env.local  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Directory structure**

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

**Correct: Shared server utility**

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

**Correct: TypeScript types**

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

**Incorrect:**

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

### 2.6 Real-Time Log Streaming

**Impact: HIGH ()**

Proxy the NextDNS SSE log stream through a Next.js Route Handler and consume it in React

Proxy the NextDNS SSE log stream through a Next.js Route Handler and consume it in React

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from

the browser because `EventSource` does not support custom headers. The solution is a Next.js Route

Handler that opens the upstream SSE connection (with the key server-side) and returns a

`ReadableStream` to the browser.

- **Export `dynamic = 'force-dynamic'`** in the Route Handler: Prevents Next.js from statically

  caching the SSE route at build time.

- **Cap the log buffer**: SSE delivers logs continuously; `slice(0, 500)` prevents unbounded memory

  growth in the React state.

- **Clean up in `useEffect` return**: Always close the `EventSource` on component unmount to avoid

  memory leaks and orphaned server connections.

**Symptoms**: `EventSource` fires `onerror` immediately; no events arrive.

**Solution**: Ensure `export const dynamic = 'force-dynamic'` is at the top of the Route Handler

file. Also verify the upstream fetch responds with `Content-Type: text/event-stream`.

**Solution**: The `fetch` API on Node.js may return a `null` body for non-OK responses. Always check

`upstream.ok` before accessing `upstream.body`.

- [Next.js — Route Handlers: Streaming](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

**Correct: Route handler — sse proxy**

```typescript
// ✅ app/api/logs/stream/route.ts
export const dynamic = 'force-dynamic'; // Disable static caching for streaming routes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
    return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400 });
  }

  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) return new Response('Server misconfigured', { status: 500 });

  // Open the upstream SSE connection with the API key
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to NextDNS stream', { status: 502 });
  }

  // Pipe the upstream ReadableStream directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

**Correct: React client component — consume sse**

```tsx
// ✅ components/LogStream.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

export default function LogStream({ profileId }: { profileId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/logs/stream?profileId=${profileId}`);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setLogs((prev) => [entry, ...prev].slice(0, 500)); // newest first, cap at 500
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      setConnected(false);
      source.close();
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [profileId]);

  return (
    <div>
      <p>Status: {connected ? '🟢 Live' : '🔴 Disconnected'}</p>
      <ul>
        {logs.map((log) => (
          <li key={`${log.timestamp}-${log.domain}`}>
            <span>{log.timestamp}</span>
            <span className={log.status === 'blocked' ? 'text-red-500' : 'text-green-500'}>
              {log.status}
            </span>
            <span>{log.domain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Correct: Page — embed the stream component**

```tsx
// ✅ app/profiles/[id]/logs/page.tsx — Server Component wrapper
export default async function LogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Live Logs</h1>
      <LogStream profileId={id} />
    </main>
  );
}
```

**Incorrect:**

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
);

// ❌ Polling /api/logs every second instead of using SSE — wasteful and laggy
setInterval(() => fetchLogs(), 1000); // ❌
```

### 2.7 TanStack Query v5 Integration

**Impact: MEDIUM (Without proper Server Component prefetching, Client Components show a loading spinner on every page navigation instead of instant data from the server)**

Integrate TanStack Query v5 with Next.js 15 App Router for prefetching in Server Components and mutations in Client Components

Integrate TanStack Query v5 with Next.js 15 App Router for prefetching in Server Components and mutations in Client Components

TanStack Query v5 works alongside the Next.js App Router through the **hydration pattern**: Server

Components prefetch query data server-side, the dehydrated state is serialised into the HTML, and

Client Components rehydrate it to avoid a loading flash.

All actual NextDNS API calls still go through Route Handlers (`/api/*`) — TanStack Query fetches

from those, never directly from `api.nextdns.io`.

- [TanStack Query v5 — Next.js App Router Guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

- [TanStack Query v5 — Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)

- [NextDNS API — Pagination](https://nextdns.github.io/api/#pagination)

**Incorrect:**

```typescript
// ❌ Calling api.nextdns.io in a TanStack Query queryFn from a Client Component
useQuery({
  queryKey: ['profiles'],
  queryFn: () =>
    fetch('https://api.nextdns.io/profiles', {
      headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_KEY }, // ❌ Key exposed
    }).then(r => r.json()),
});

// ❌ Not wrapping prefetched queries in HydrationBoundary
// — Client Component will refetch on mount even though server already has the data
export default async function Page() {
  const qc = getQueryClient();
  await qc.prefetchQuery({ queryKey: ['profiles'], queryFn: ... });
  return <ProfileList />; // ❌ Missing <HydrationBoundary state={dehydrate(qc)}>
}
```

---

## 3. Astro

**Impact: MEDIUM**

### 3.1 Analytics Charts

**Impact: MEDIUM ()**

Fetch NextDNS time-series analytics and render them as charts in an Astro + React dashboard

Fetch NextDNS time-series analytics and render them as charts in an Astro + React dashboard

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.

- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an

  array of counts over time, suitable for line or bar charts.

In Astro, static summary data is fetched in `.astro` frontmatter (server-side). Interactive charts

with date pickers are React islands that call the Astro analytics API endpoint.

- **Always include `from=`**: Scoped time ranges are faster and return more relevant data.

- **Use `client:visible` for chart islands**: Charts are often below the fold — `client:visible`

  defers JavaScript loading until the component scrolls into view.

- **Fetch static summaries in `.astro` frontmatter**: For dashboard tiles that don't need

  interactivity, use server-side fetching for instant paint without any client JavaScript.

**Solution**: The `;series` suffix is part of the URL path — it must be URL-encoded or passed

verbatim. Some routing configurations may strip it. Verify the Astro dynamic route file name does

not interfere with the semicolon character.

**Solution**: SWR uses the URL as the cache key. Including `from` in the URL (as shown above)

ensures a fresh request is made whenever the selector value changes.

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)

- [Astro — Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

- [SWR Documentation](https://swr.vercel.app)

**Correct: Astro API endpoint — analytics proxy**

```typescript
// ✅ src/pages/api/profiles/[id]/analytics/[endpoint].ts
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../../../../lib/nextdns';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { id, endpoint } = params;
  if (!id || !endpoint) {
    return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();

  const data = await nextdnsFetch(`/profiles/${id}/analytics/${endpoint}${qs ? `?${qs}` : ''}`);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

**Correct: Astro page — server-side aggregated analytics**

```astro
---
// ✅ src/pages/profiles/[id]/analytics.astro
import { nextdnsFetch } from '../../../lib/nextdns'
import StatusChart from '../../../components/react/StatusChart'

const { id } = Astro.params
const { data: statusData } = await nextdnsFetch<{ data: Array<{ status: string; queries: number }> }>(
  `/profiles/${id}/analytics/status?from=-7d`
)
---

<html>
  <body>
    <h1>Analytics</h1>
    <ul>
      {statusData.map((item) => (
        <li>{item.status}: {item.queries} queries</li>
      ))}
    </ul>

    <!-- Interactive chart island with date range picker -->
    <StatusChart client:visible profileId={id} />
  </body>
</html>
```

**Correct: React island — interactive time-series chart**

```tsx
// ✅ src/components/react/StatusChart.tsx
import { useState } from 'react';
import useSWR from 'swr';

interface SeriesPoint {
  timestamp: string;
  queries: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  profileId: string;
}

export default function StatusChart({ profileId }: Props) {
  const [from, setFrom] = useState('-7d');

  const { data, isLoading } = useSWR(
    `/api/profiles/${profileId}/analytics/status;series?from=${from}`,
    fetcher,
    { refreshInterval: 60_000 }
  );

  const series: SeriesPoint[] = data?.data ?? [];

  return (
    <div>
      <label>
        Time range:
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="-1h">Last 1 hour</option>
          <option value="-24h">Last 24 hours</option>
          <option value="-7d">Last 7 days</option>
          <option value="-30d">Last 30 days</option>
        </select>
      </label>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {series.map((point) => (
            <li key={point.timestamp}>
              {point.timestamp}: {point.queries}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Incorrect: Supported `from` values**

```typescript
// ❌ Fetching analytics without a time range — returns all-time data (very slow)
nextdnsFetch(`/profiles/${id}/analytics/status`); // ❌ No from= param

// ❌ Calling api.nextdns.io directly from a React island
// src/components/react/StatusChart.tsx
useEffect(() => {
  fetch(`https://api.nextdns.io/profiles/${id}/analytics/status`, {
    headers: { 'X-Api-Key': import.meta.env.PUBLIC_NEXTDNS_API_KEY }, // ❌ Key exposed
  });
}, []);
```

### 3.2 API Key Proxy (BFF Pattern)

**Impact: HIGH ()**

Proxy all NextDNS API calls through Astro API endpoints to keep X-Api-Key server-side only

Proxy all NextDNS API calls through Astro API endpoints to keep X-Api-Key server-side only

The NextDNS `X-Api-Key` grants full account access. In Astro, any environment variable **without**

the `PUBLIC_` prefix is server-only and never bundled into the browser. Astro API endpoints

(`src/pages/api/`) run exclusively on the server, making them the correct place to attach the key

before forwarding requests to `api.nextdns.io`.

> **Requires SSR**: API endpoints with runtime data require an SSR adapter and either

> `output: 'server'` or `output: 'hybrid'` in `astro.config.mjs`.

- **One utility, one key location**: Use `src/lib/nextdns.ts` as the single place where the key is

  attached — never repeat `import.meta.env.NEXTDNS_API_KEY` across endpoint files.

- **`export const prerender = false`**: Required on every dynamic API endpoint when using

  `output: 'hybrid'` mode. Not needed in `output: 'server'` mode.

- **Rotate keys without redeploying**: Keep the key in `.env` or your hosting platform's secret

  store.

**Solution**: Verify the variable exists in `.env` and does **not** have the `PUBLIC_` prefix.

Non-`PUBLIC_` variables are only available in server-side code (Astro frontmatter, endpoints,

`src/lib/`). They are not accessible in client-side React components.

**Solution**: Ensure your Astro project uses `output: 'server'` or `output: 'hybrid'` with an SSR

adapter. Static builds do not support runtime API endpoints.

- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)

- [Astro — Environment Variables](https://docs.astro.build/en/guides/environment-variables/)

- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

**Correct: Environment variable setup**

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Shared server utility**

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

**Correct: Profile list endpoint**

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

**Correct: Dynamic profile endpoint**

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

**Incorrect:**

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

### 3.3 Error Handling

**Impact: MEDIUM ()**

Map NextDNS API errors to user-friendly Astro pages and React island notifications

Map NextDNS API errors to user-friendly Astro pages and React island notifications

The NextDNS API returns errors in two formats:

- **HTTP 4xx/5xx** with `{ "errors": [...] }` — validation or auth errors.

- **HTTP 200 OK** with `{ "errors": [...] }` — user-level errors (for example, duplicate profile name).

Both must be handled. Astro API endpoints should return typed error responses, and React islands

should surface them inline or via toast-style notifications.

- **Check `json.errors` before checking `res.ok`**: The NextDNS API can return user errors inside a

  200 response — `res.ok` is insufficient.

- **Return `{ error: message }` JSON from endpoints**: Consistent error shape lets React islands

  always read `const { error } = await res.json()`.

- **Use `Astro.redirect` for page-level 404s**: When a profile does not exist, redirect to the 404

  page rather than rendering an empty page.

- **Log server-side errors**: Use `console.error` in API endpoints to capture upstream failures

  without exposing details to the browser.

**Solution**: Ensure the API endpoint returns a JSON body and sets `Content-Type: application/json`

on the error response. Check the status code in the React component:

**Solution**: Uncaught errors in Astro frontmatter are surfaced as 500 errors. Use a `try/catch`

block and call `return Astro.redirect('/404')` or `return Astro.redirect('/500')` for handled

errors.

- [Astro — Error Pages](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page)

- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)

- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)

**Correct: API endpoint — return typed errors**

```typescript
// ✅ src/pages/api/profiles.ts — wrap nextdnsFetch with error translation
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../lib/nextdns';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

**Correct: Lib/nextdns.ts — check both HTTP errors and 200-with-errors**

```typescript
// ✅ src/lib/nextdns.ts — error-aware fetcher
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

  const json = await res.json();

  // Both 4xx and 200 responses may contain errors
  if (json.errors?.length) {
    const first = json.errors[0];
    throw new Error(first.detail ?? first.code ?? 'NextDNS API error');
  }

  return json as T;
}
```

**Correct: React island — inline error feedback**

```tsx
// ✅ src/components/react/CreateProfileForm.tsx
import { useState } from 'react';

export default function CreateProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') }),
    });

    if (!res.ok) {
      const { error: message } = await res.json();
      setError(message ?? 'Failed to create profile');
      return;
    }

    setSuccess(true);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Profile name" required />
      <button type="submit">Create</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Profile created!</p>}
    </form>
  );
}
```

**Correct: Astro error page — 404 and 500**

```astro
---
// ✅ src/pages/404.astro
---
<html>
  <body>
    <h1>404 — Page Not Found</h1>
    <a href="/">Go home</a>
  </body>
</html>
```

**Correct:**

```astro
---
// ✅ src/pages/500.astro (requires output: 'server' or 'hybrid')
const { error } = Astro.props
---
<html>
  <body>
    <h1>500 — Server Error</h1>
    <p>Something went wrong. Please try again later.</p>
  </body>
</html>
```

**Correct: Astro page — handle API errors in frontmatter**

```astro
---
// ✅ src/pages/profiles/[id].astro — redirect on 404
import { nextdnsFetch } from '../../lib/nextdns'

const { id } = Astro.params

let profile
try {
  const res = await nextdnsFetch<{ data: { id: string; name: string } }>(`/profiles/${id}`)
  profile = res.data
} catch {
  return Astro.redirect('/404')
}
---

<html>
  <body>
    <h1>{profile.name}</h1>
  </body>
</html>
```

**Incorrect:**

```typescript
// ❌ Checking only HTTP status — NextDNS also returns errors in 200 responses
if (!res.ok) throw new Error('error'); // ❌ Misses 200-with-errors case

// ❌ Swallowing errors silently
try {
  await fetch('/api/profiles', { method: 'DELETE' });
} catch {
  // ❌ User gets no feedback
}

// ❌ Exposing raw error objects from nextdnsFetch to the browser response
return new Response(JSON.stringify(err), { status: 500 }); // ❌ May leak internal details
```

### 3.4 Profile Management UI

**Impact: MEDIUM ()**

Build profile list, create, update, and delete flows using Astro pages and React islands

Build profile list, create, update, and delete flows using Astro pages and React islands

In Astro, page data is fetched in the `.astro` frontmatter (server-side, synchronous). React

components handle interactivity as **islands** — hydrated selectively with `client:*` directives.

Mutations (create, update, delete) are triggered from React components via Astro API endpoints.

- **Choose the right `client:*` directive**: Use `client:load` for above-the-fold interactive

  elements. Use `client:visible` for components lower on the page to defer JS loading.

- **Prefer `window.location.reload()` after mutations**: Astro pages are server-rendered, so

  reloading re-fetches fresh data from the server without a client-side router.

- **Keep React islands small**: Astro's island architecture is most efficient when React components

  handle only the interactive parts — let `.astro` handle the static markup.

**Solution**: Ensure the React component has a `client:load` (or similar) directive in the `.astro`

template. Without it, the component is static HTML and click handlers are never attached.

**Solution**: Astro pages are server-rendered. After a mutation, call `window.location.reload()` or

navigate programmatically to re-run the frontmatter data fetch.

- [Astro — Framework Components](https://docs.astro.build/en/guides/framework-components/)

- [Astro — Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

**Correct: API endpoints**

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

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const data = await nextdnsFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

**Correct:**

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

**Correct: Astro page — server-rendered profile list**

```astro
---
// ✅ src/pages/index.astro — frontmatter runs on the server
import { nextdnsFetch } from '../lib/nextdns'
import ProfileActions from '../components/react/ProfileActions'
import type { NextDNSProfile } from '../types/nextdns'

const { data: profiles } = await nextdnsFetch<{ data: NextDNSProfile[] }>('/profiles')
---

<html>
  <body>
    <h1>Profiles</h1>
    <ul>
      {profiles.map((profile) => (
        <li>
          {profile.name} ({profile.id})
          <!-- client:load hydrates the React component in the browser -->
          <ProfileActions client:load profileId={profile.id} />
        </li>
      ))}
    </ul>
  </body>
</html>
```

**Correct: React island — profile actions**

```tsx
// ✅ src/components/react/ProfileActions.tsx
import { useState } from 'react';

interface Props {
  profileId: string;
}

export default function ProfileActions({ profileId }: Props) {
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleted(true);
      window.location.reload(); // Reload to re-fetch server-rendered list
    }
  }

  if (deleted) return null;

  return (
    <button onClick={handleDelete} style={{ color: 'red' }}>
      Delete
    </button>
  );
}
```

**Correct: Astro page — profile detail**

```astro
---
// ✅ src/pages/profiles/[id].astro
import { nextdnsFetch } from '../../lib/nextdns'
import type { NextDNSProfile } from '../../types/nextdns'

const { id } = Astro.params
const { data: profile } = await nextdnsFetch<{ data: NextDNSProfile }>(`/profiles/${id}`)
---

<html>
  <body>
    <h1>{profile.name}</h1>
    <pre>{JSON.stringify(profile, null, 2)}</pre>
  </body>
</html>
```

**Incorrect:**

```astro
---
// ❌ No client directive — React component renders as static HTML, buttons are unresponsive
---
<ProfileActions profileId={profile.id} />

// ❌ Fetching from api.nextdns.io inside a React component
// src/components/react/Profiles.tsx
useEffect(() => {
  fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': import.meta.env.PUBLIC_NEXTDNS_API_KEY }, // ❌ Key exposed
  })
}, [])
```

### 3.5 Project Setup

**Impact: HIGH ()**

Bootstrap an Astro project with React integration configured to integrate with the NextDNS API

Bootstrap an Astro project with React integration configured to integrate with the NextDNS API

A NextDNS Astro + React frontend requires:

1. An Astro project with the `@astrojs/react` integration

2. An SSR adapter (Node.js, Netlify, Vercel, or Cloudflare) for API endpoints

3. Server-only environment variables (no `PUBLIC_` prefix) for the API key

4. A `src/lib/nextdns.ts` shared fetcher used in Astro frontmatter and API endpoints

**Solution**: Add the `client:*` directive to the React component in the `.astro` template:

Without a `client:*` directive, React components render as static HTML only (no JavaScript sent to

the browser).

**Solution**: Ensure `tsconfig.json` has `"jsx": "react-jsx"` and `"jsxImportSource": "react"`.

These are required when using React alongside Astro's own JSX syntax.

- [Astro — Installation](https://docs.astro.build/en/install-and-setup/)

- [Astro — React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)

- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)

- [Astro — Environment Variables](https://docs.astro.build/en/guides/environment-variables/)

**Correct: Create the project**

```bash
# ✅ Bootstrap with create-astro (TypeScript template recommended)
pnpm create astro@latest nextdns-dashboard
cd nextdns-dashboard

# ✅ Add React integration
pnpm astro add react

# ✅ Add Node.js adapter for SSR (or replace with netlify/vercel/cloudflare)
pnpm astro add node
```

**Correct: Install recommended packages**

```bash
# ✅ SWR — lightweight Client Component data fetching
pnpm add swr

# ✅ Or React Query — more feature-rich alternative
pnpm add @tanstack/react-query
```

**Correct: Astro.config.mjs**

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

**Correct: TSConfig.json**

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

**Correct: Environment variables**

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Directory structure**

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

**Correct: Shared server utility**

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

**Correct: TypeScript types**

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

**Incorrect:**

```typescript
// ❌ Importing src/lib/nextdns.ts in a React component — it won't have server env access
// src/components/react/Profiles.tsx
import { nextdnsFetch } from '../../lib/nextdns'; // ❌ React runs in browser

// ❌ Using output: 'static' with runtime API endpoints
// astro.config.mjs
export default defineConfig({ output: 'static' }); // ❌ API endpoints become build-time only
```

### 3.6 Real-Time Log Streaming

**Impact: HIGH ()**

Proxy the NextDNS SSE log stream through an Astro API endpoint and consume it in a React island

Proxy the NextDNS SSE log stream through an Astro API endpoint and consume it in a React island

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from

the browser because `EventSource` does not support custom headers. The solution is an Astro API

endpoint that opens the upstream SSE connection (with the key server-side) and returns a

`ReadableStream` to the browser.

- **Use `client:only="react"` for real-time components**: Components that depend on `EventSource`,

  `WebSocket`, or other browser-only APIs should use `client:only` to skip SSR entirely.

- **Cap the log buffer**: SSE delivers logs continuously; `slice(0, 500)` prevents unbounded memory

  growth in React state.

- **Clean up in `useEffect` return**: Always close `EventSource` on component unmount to avoid

  orphaned server connections.

**Symptoms**: Build or dev server logs show `EventSource is not defined`.

**Solution**: Use `client:only="react"` instead of `client:load` to ensure the component is never

rendered on the server.

**Solution**: Verify the upstream fetch returns `Content-Type: text/event-stream`. Test the endpoint

directly:

- [Astro — Endpoints: Streaming](https://docs.astro.build/en/guides/endpoints/)

- [Astro — Client Directives: client:only](https://docs.astro.build/en/reference/directives-reference/#clientonly)

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

**Correct: Astro API endpoint — sse proxy**

```typescript
// ✅ src/pages/api/logs/stream.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const profileId = url.searchParams.get('profileId');

  if (!profileId) {
    return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400 });
  }

  const apiKey = import.meta.env.NEXTDNS_API_KEY;
  if (!apiKey) return new Response('Server misconfigured', { status: 500 });

  // Open upstream SSE connection with the API key server-side
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to NextDNS stream', { status: 502 });
  }

  // Pipe the upstream ReadableStream directly to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
```

**Correct: React island — consume sse**

```tsx
// ✅ src/components/react/LogStream.tsx
import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

interface Props {
  profileId: string;
}

export default function LogStream({ profileId }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/logs/stream?profileId=${profileId}`);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setLogs((prev) => [entry, ...prev].slice(0, 500)); // newest first, cap at 500
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      setConnected(false);
      source.close();
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [profileId]);

  return (
    <div>
      <p>Status: {connected ? '🟢 Live' : '🔴 Disconnected'}</p>
      <ul>
        {logs.map((log) => (
          <li key={`${log.timestamp}-${log.domain}`}>
            <span>{log.timestamp}</span>
            <span style={{ color: log.status === 'blocked' ? 'red' : 'green' }}>{log.status}</span>
            <span>{log.domain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Correct: Astro page — embed the stream island**

```astro
---
// ✅ src/pages/profiles/[id]/logs.astro
import LogStream from '../../../components/react/LogStream'
const { id } = Astro.params
---

<html>
  <body>
    <h1>Live Logs</h1>
    <!-- client:only ensures EventSource is only created in the browser -->
    <LogStream client:only="react" profileId={id} />
  </body>
</html>
```

> **Why `client:only="react"`?** The `LogStream` component uses `useEffect` and `EventSource`, which

> are browser APIs. `client:only` skips server-side rendering entirely — preventing hydration errors

> from server/client mismatches on the log list.

**Incorrect:**

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
// src/components/react/LogStream.tsx
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
)

// ❌ Missing client directive — EventSource is a browser API, SSR will throw
<LogStream profileId={id} /> // ❌ Crashes on server render
```

### 3.7 Server Islands for Analytics Panels

**Impact: MEDIUM (Without server:defer, heavy analytics panels block the initial page render, causing visible layout shift and slow Time to First Byte on the NextDNS dashboard)**

Use Astro 5 Server Islands (`server:defer`) to lazy-load NextDNS analytics panels without blocking the initial page render

Use Astro 5 Server Islands (`server:defer`) to lazy-load NextDNS analytics panels without blocking the initial page render

Astro 5 introduced **Server Islands** — a pattern where individual components can be deferred to

load after the initial page HTML is sent to the browser. This is ideal for a NextDNS dashboard

where:

- The **profile list** (fast, needed immediately) renders at page load

- The **analytics panels** (slow, can take 1–3 seconds) load after without blocking

The `server:defer` directive tells Astro to render a placeholder immediately and fetch the component

HTML asynchronously from the server. The component still runs on the server (the API key is never

exposed), but its rendering is decoupled from the initial response.

For `output: 'hybrid'` (static by default), add `export const prerender = false` to pages that use

server islands.

| Approach | TTFB | Analytics visible | Layout shift |

|----------|------|------------------|--------------|

| Without server:defer | Slow (waits for all analytics) | At load | None |

| With server:defer | Fast (profile renders instantly) | ~1–3s later | Minimal (fallback placeholder) |

- **Always provide a `fallback` slot**: Without a fallback, users see blank space while the island

  loads, which is disorienting.

- **Use `aria-live="polite"` on fallbacks**: Screen readers announce when the content updates.

- **Defer only the slow panels**: Panels backed by fast API calls (profile name, basic settings) do

  not need `server:defer`.

- **Keep island components focused**: Each server island should fetch exactly the data it needs —

  avoid over-fetching inside a deferred component.

**Symptoms**: The page load time is unchanged after adding `server:defer`.

**Solution**: Confirm `output: 'server'` or `output: 'hybrid'` is set in `astro.config.mjs`. Server

Islands require an SSR runtime — they are not available in `output: 'static'` mode.

**Symptoms**: The deferred content appears to load synchronously.

**Solution**: This is expected if the server-side fetch is fast (under ~200ms). Add a small

artificial delay in development to see the fallback: `await new Promise(r => setTimeout(r, 1000))`.

Remove before deploying.

- [Astro — Server Islands](https://docs.astro.build/en/guides/server-islands/)

- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

**Correct: Analytics component as a server island**

```astro
---
// ✅ src/components/AnalyticsPanel.astro — runs on server, deferred
import { nextdnsFetch } from '../lib/nextdns';

interface Props {
  profileId: string;
  from?: string;
}

const { profileId, from = '-7d' } = Astro.props;

let statusData: Array<{ status: string; queries: number }> = [];
let error: string | null = null;

try {
  const res = await nextdnsFetch<{ data: typeof statusData }>(
    `/profiles/${profileId}/analytics/status?from=${from}`
  );
  statusData = res.data;
} catch (err) {
  error = err instanceof Error ? err.message : 'Failed to load analytics';
}
---

{error ? (
  <p class="text-red-500" role="alert">{error}</p>
) : (
  <ul>
    {statusData.map((item) => (
      <li>
        <span>{item.status}</span>
        <span>{item.queries.toLocaleString()} queries</span>
      </li>
    ))}
  </ul>
)}
```

**Correct: Dashboard page — defer analytics panels**

```astro
---
// ✅ src/pages/profiles/[id]/index.astro — profile list loads fast, analytics deferred
import { nextdnsFetch } from '../../../lib/nextdns';
import AnalyticsPanel from '../../../components/AnalyticsPanel.astro';
import TopDomainsPanel from '../../../components/TopDomainsPanel.astro';

const { id } = Astro.params;

// Fast fetch — needed for initial render
const { data: profile } = await nextdnsFetch<{ data: { id: string; name: string } }>(
  `/profiles/${id}`
);
---

<html>
  <head><title>{profile.name} — Dashboard</title></head>
  <body>
    <!-- Renders immediately (fast) -->
    <h1>{profile.name}</h1>
    <p>Profile ID: {id}</p>

    <!-- Deferred: rendered after initial HTML is sent -->
    <section>
      <h2>Query Status</h2>
      <AnalyticsPanel server:defer profileId={id} from="-7d">
        <!-- Fallback slot: shown while the island loads -->
        <div slot="fallback" aria-live="polite" role="status">
          Loading analytics…
        </div>
      </AnalyticsPanel>
    </section>

    <section>
      <h2>Top Blocked Domains</h2>
      <TopDomainsPanel server:defer profileId={id} from="-7d">
        <div slot="fallback" aria-live="polite" role="status">
          Loading top domains…
        </div>
      </TopDomainsPanel>
    </section>
  </body>
</html>
```

**Correct: Top domains panel component**

```astro
---
// ✅ src/components/TopDomainsPanel.astro
import { nextdnsFetch } from '../lib/nextdns';

interface Props {
  profileId: string;
  from?: string;
}

const { profileId, from = '-7d' } = Astro.props;

const res = await nextdnsFetch<{
  data: Array<{ domain: string; queries: number }>;
}>(`/profiles/${profileId}/analytics/domains?status=blocked&from=${from}&limit=10`);

const domains = res.data;
---

<table>
  <thead>
    <tr>
      <th scope="col">Domain</th>
      <th scope="col">Blocked queries</th>
    </tr>
  </thead>
  <tbody>
    {domains.map((d) => (
      <tr>
        <td>{d.domain}</td>
        <td>{d.queries.toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Correct: Multiple deferred islands with different time ranges**

```astro
---
// ✅ Defer multiple panels independently — they load in parallel
const { id } = Astro.params;
---

<AnalyticsPanel server:defer profileId={id} from="-1h">
  <p slot="fallback" aria-live="polite">Loading 1h stats…</p>
</AnalyticsPanel>

<AnalyticsPanel server:defer profileId={id} from="-24h">
  <p slot="fallback" aria-live="polite">Loading 24h stats…</p>
</AnalyticsPanel>

<AnalyticsPanel server:defer profileId={id} from="-7d">
  <p slot="fallback" aria-live="polite">Loading 7d stats…</p>
</AnalyticsPanel>
```

**Incorrect:**

```astro
---
// ❌ Do NOT call api.nextdns.io from a React island (client-side)
// src/components/react/AnalyticsPanel.tsx
import { useEffect } from 'react';
useEffect(() => {
  fetch('https://api.nextdns.io/profiles/abc123/analytics/status', {
    headers: { 'X-Api-Key': import.meta.env.PUBLIC_KEY }, // ❌ Key exposed
  });
}, []);
---

<AnalyticsPanel server:defer profileId={id} />
```

---

## 4. SvelteKit

**Impact: MEDIUM**

### 4.1 Analytics Charts (SvelteKit)

**Impact: MEDIUM ()**

Fetch NextDNS analytics data in `+page.server.ts` and render interactive charts in Svelte components

Fetch NextDNS analytics data in `+page.server.ts` and render interactive charts in Svelte components

The NextDNS API provides query statistics and time-series analytics endpoints under

`/profiles/{id}/analytics`. Data must be fetched server-side (in `+page.server.ts`) because the API

key is required. Charting libraries (for example, Chart.js via `svelte-chartjs`) render on the client after

hydration.

- **Parallel fetching**: Use `Promise.all` in `load` to fetch multiple analytics endpoints

  simultaneously, reducing total latency.

- **Search params for time range**: Pass `from` as a URL search param so the browser can change the

  range without a new navigation (use `$page.url.searchParams` reactively in the component).

- **`$derived`**: Use Svelte 5's `$derived` rune to reactively transform `data` into chart datasets

  whenever the parent `data` prop updates.

- **Lazy chart registration**: Register only the Chart.js components you use to keep bundle size

  small.

**Symptoms**: Chart canvas is blank after client-side route navigation.

**Solution**: Chart.js instances are not automatically destroyed on navigation. Use `svelte-chartjs`

which handles this automatically, or destroy the chart instance in `onDestroy`.

**Solution**: Use `goto` from `$app/navigation` with `invalidate()` to refetch server data without a

full reload:

- [SvelteKit — Load Functions](https://kit.svelte.dev/docs/load)

- [svelte-chartjs](https://www.chartjs.org/docs/latest/)

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

**Correct: Fetch analytics server-side**

```typescript
// ✅ src/routes/profiles/[id]/analytics/+page.server.ts
import { nextdnsFetch } from '$lib/server/nextdns';
import type { PageServerLoad } from './$types';

interface QueryStat {
  name: string;
  queries: number;
}

export const load: PageServerLoad = async ({ params, url }) => {
  const from = url.searchParams.get('from') ?? '30d';

  const [topDomains, summary] = await Promise.all([
    nextdnsFetch<{ data: QueryStat[] }>(`/profiles/${params.id}/analytics/topDomains?from=${from}`),
    nextdnsFetch<{ data: { queries: number; blocked: number } }>(
      `/profiles/${params.id}/analytics/status?from=${from}`
    ),
  ]);

  return {
    topDomains: topDomains.data,
    summary: summary.data,
    from,
  };
};
```

**Correct: Render charts in a Svelte component**

```svelte
<script lang="ts">
  import { Bar } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import type { PageProps } from './$types';

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  let { data }: PageProps = $props();

  const chartData = $derived({
    labels: data.topDomains.map((d) => d.name),
    datasets: [
      {
        label: 'Queries',
        data: data.topDomains.map((d) => d.queries),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  });
</script>

<h2>Summary</h2>
<p>Total: {data.summary.queries} · Blocked: {data.summary.blocked}</p>

<h2>Top Domains</h2>
<Bar data={chartData} />
```

**Correct: Install charting dependency**

```bash
pnpm add svelte-chartjs chart.js
```

**Incorrect:**

```svelte
<script>
  const res = await fetch('https://api.nextdns.io/profiles/abc123/analytics/topDomains', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed in browser
  });
</script>
```

### 4.2 API Key Proxy (BFF Pattern)

**Impact: HIGH ()**

Proxy all NextDNS API calls through SvelteKit `+server.ts` routes to keep X-Api-Key server-side only

Proxy all NextDNS API calls through SvelteKit `+server.ts` routes to keep X-Api-Key server-side only

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible

code. SvelteKit `+server.ts` files run exclusively on the server, making them the correct place to

attach the key before forwarding requests to `api.nextdns.io`. Environment variables imported from

`$env/static/private` are stripped from client bundles at build time.

- **`$env/static/private`**: SvelteKit enforces this at build time — importing private vars in

  client-accessible modules is a build error, not just a runtime warning.

- **`src/lib/server/`**: Any file under `$lib/server/` cannot be imported by client code; SvelteKit

  throws an error if attempted.

- **`$env/dynamic/private`**: Use `import { env } from '$env/dynamic/private'` when env vars change

  at runtime (for example, Docker/Kubernetes secrets) instead of at build time.

**Symptoms**: Build error mentioning `$env/static/private` or `$lib/server/`.

**Solution**: Move all server-only imports to `+server.ts`, `+page.server.ts`, or

`+layout.server.ts` files. Never import them from `+page.ts` (which runs on client and server).

**Symptoms**: The utility throws `NEXTDNS_API_KEY is not set`.

**Solution**: Add the variable to `.env` (development) or your hosting platform's secret store. Run

`pnpm dev` after editing `.env` — SvelteKit reads it at startup.

- [SvelteKit — Routing: +server](https://kit.svelte.dev/docs/routing#server)

- [SvelteKit — \$env/static/private](https://kit.svelte.dev/docs/modules#$env-static-private)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

**Correct: Environment variable setup**

```bash
# .env  (gitignored — add to .gitignore)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Shared server utility**

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

**Correct: API route for profile list**

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

**Correct: Dynamic profile route**

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

**Incorrect:**

```typescript
// ❌ Never import private env vars in .svelte files or +page.ts (shared client/server code)
// src/routes/+page.ts  ← runs on both server and client
import { NEXTDNS_API_KEY } from '$env/static/private'; // ❌ Build error
```

**Incorrect:**

```typescript
// ❌ Never call api.nextdns.io directly from a component script
<script>
  // ❌ This runs in the browser — key would be exposed
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' },
  });
</script>
```

### 4.3 Error Handling (SvelteKit)

**Impact: MEDIUM ()**

Map NextDNS API errors to SvelteKit error responses and Svelte component-level feedback

Map NextDNS API errors to SvelteKit error responses and Svelte component-level feedback

SvelteKit provides two error mechanisms:

1. **`error(status, message)`** from `@sveltejs/kit` — throws an HTTP error in server code, rendered

   by the nearest `+error.svelte` boundary.

2. **`fail(status, data)`** — returns a typed failure from a form action, displayed inline.

For `+server.ts` API routes, throw `error()` on failure. For form actions, use `fail()` to return

validation errors without triggering the error boundary.

- **`error()` in server code, `fail()` in form actions**: `error()` triggers the `+error.svelte`

  boundary; `fail()` returns inline validation data without leaving the current page.

- **Map HTTP status codes**: Translate 401 → auth error, 404 → not found, 5xx → upstream error with

  a generic message (avoid leaking internal details).

- **`+error.svelte` per segment**: Place `+error.svelte` files at each route segment to provide

  context-aware error messages.

**Symptoms**: The `+error.svelte` file exists but is not rendered on error.

**Solution**: Ensure you're throwing `error()` (from `@sveltejs/kit`), not returning a plain object.

The `error()` helper throws an `HttpError` that SvelteKit catches.

**Solution**: Pass an object as the second argument: `error(404, { message: 'Not found' })`, not

just a string — the string form only sets `message` automatically in some SvelteKit versions.

- [SvelteKit — Errors](https://kit.svelte.dev/docs/errors)

- [SvelteKit — Form Actions](https://kit.svelte.dev/docs/form-actions)

- [NextDNS API — Error Responses](https://nextdns.github.io/api/)

**Correct: Error boundary page**

```svelte
<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error?.message ?? 'An unexpected error occurred'}</h1>
<a href="/">Back to home</a>
```

**Correct: Throw errors in server routes**

```typescript
// ✅ src/routes/api/profiles/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const data = await nextdnsFetch(`/profiles/${params.id}`);
    return json(data);
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('404')) error(404, { message: 'Profile not found' });
    if (message.includes('401')) error(401, { message: 'Invalid API key' });

    error(502, { message: `Upstream error: ${message}` });
  }
};
```

**Correct: Inline errors from form actions**

```typescript
// ✅ src/routes/profiles/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name') as string;

    if (!name?.trim()) {
      return fail(400, { message: 'Profile name is required' });
    }

    try {
      await nextdnsFetch('/profiles', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    } catch (err) {
      return fail(502, { message: (err as Error).message });
    }
  },
};
```

**Correct: Display form action errors**

```svelte
<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

{#if form?.message}
  <div class="alert alert-error">{form.message}</div>
{/if}

<form method="POST" action="?/create">
  <input name="name" required />
  <button type="submit">Create</button>
</form>
```

**Correct: Handle errors in load functions**

```typescript
// ✅ src/routes/profiles/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const profile = await nextdnsFetch(`/profiles/${params.id}`);
    return { profile };
  } catch (err) {
    error(404, { message: 'Profile not found' });
  }
};
```

**Incorrect:**

```typescript
// ❌ Never return error data as a regular object — it won't trigger the error boundary
export const load = async () => {
  return { error: 'Failed to load' }; // ❌ Page renders with partial data, no error boundary
};
```

**Incorrect:**

```typescript
// ❌ Never swallow errors silently
try {
  await nextdnsFetch('/profiles');
} catch {
  // ❌ User sees nothing, page looks broken
}
```

### 4.4 Log Streaming via SSE (SvelteKit)

**Impact: MEDIUM ()**

Proxy the NextDNS real-time log stream through a SvelteKit `+server.ts` route and consume it in a

Proxy the NextDNS real-time log stream through a SvelteKit `+server.ts` route and consume it in a

Svelte component

The NextDNS API exposes a Server-Sent Events (SSE) stream at `/logs/stream`. The API key must be

added on the server side. A SvelteKit `+server.ts` route proxies the upstream SSE stream as a

`ReadableStream` response. The Svelte component connects to the SvelteKit route (no key in URL) and

parses incoming `data:` events.

- **Pipe the upstream body**: Pass `upstream.body` directly to `new Response()` to avoid buffering

  the entire stream in memory.

- **Reconnect on error**: `EventSource` auto-reconnects but not always reliably. Add a manual

  `setTimeout` fallback in `onerror`.

- **`onDestroy` cleanup**: Always close the `EventSource` when the Svelte component is destroyed to

  prevent memory leaks.

- **Limit buffer size**: Cap the `logs` array (for example, last 200 entries) to avoid unbounded memory

  growth in long-running sessions.

**Symptoms**: `onerror` fires within 1 second, no log entries appear.

**Solution**: Check that the upstream request headers include `Accept: text/event-stream`. Some

platforms (for example, Cloudflare Workers) buffer SSE responses — use the streaming adapter.

**Symptoms**: Build or hydration error referencing `EventSource`.

**Solution**: `EventSource` is browser-only. Wrap the call in `onMount` or ensure it only runs in

the browser:

- [SvelteKit — +server.js (API Routes)](https://kit.svelte.dev/docs/routing#server)

- [MDN — EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#logs)

**Correct: Sse proxy route**

```typescript
// ✅ src/routes/api/profiles/[id]/logs/stream/+server.ts
import { NEXTDNS_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  if (!NEXTDNS_API_KEY) error(500, 'NEXTDNS_API_KEY is not configured');

  const upstream = await fetch(`https://api.nextdns.io/profiles/${params.id}/logs/stream`, {
    headers: {
      'X-Api-Key': NEXTDNS_API_KEY,
      Accept: 'text/event-stream',
    },
  });

  if (!upstream.ok) error(upstream.status, 'Failed to connect to log stream');
  if (!upstream.body) error(502, 'No response body from upstream');

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
```

**Correct: Svelte component consuming sse**

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';

  let { data } = $props<{ data: { profileId: string } }>();

  let logs = $state<string[]>([]);
  let es: EventSource | null = null;

  function connect() {
    es = new EventSource(`/api/profiles/${data.profileId}/logs/stream`);

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        logs = [JSON.stringify(entry), ...logs.slice(0, 199)];
      } catch {
        // skip malformed events
      }
    };

    es.onerror = () => {
      es?.close();
      // Reconnect after 3 s
      setTimeout(connect, 3000);
    };
  }

  connect();

  onDestroy(() => es?.close());
</script>

<h1>Live Logs</h1>

<ul>
  {#each logs as entry (entry)}
    <li><code>{entry}</code></li>
  {/each}
</ul>
```

**Incorrect:**

```svelte
<script>
  const es = new EventSource(
    `https://api.nextdns.io/profiles/${id}/logs/stream?apikey=YOUR_API_KEY`, // ❌ Key in URL
  );
</script>
```

### 4.5 Profile Management UI (SvelteKit)

**Impact: MEDIUM ()**

Build NextDNS profile list, create, update, and delete flows using SvelteKit load functions and form

Build NextDNS profile list, create, update, and delete flows using SvelteKit load functions and form

actions

SvelteKit separates server-only data loading (`+page.server.ts`) from shared loading (`+page.ts`).

For NextDNS profile management, always use `+page.server.ts` because it accesses

`$env/static/private` and proxies API calls. Form actions in `+page.server.ts` handle mutations

(create, update, delete) without requiring a separate API route.

- **`+page.server.ts` for all NextDNS data**: Server load functions run only on the server and can

  safely import `$env/static/private`.

- **Form actions over fetch**: Use SvelteKit form actions for mutations — they work without

  JavaScript and support progressive enhancement via `use:enhance`.

- **`use:enhance`**: Import from `$app/forms` to enable client-side form submission without

  full-page reload.

**Solution**: Import `form` from `PageProps` and display `form?.message` in the template:

- [SvelteKit — Load Functions](https://kit.svelte.dev/docs/load)

- [SvelteKit — Form Actions](https://kit.svelte.dev/docs/form-actions)

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

**Correct: Load profiles on the server**

```typescript
// ✅ src/routes/profiles/+page.server.ts
import { nextdnsFetch } from '$lib/server/nextdns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const data = await nextdnsFetch<{ data: Array<{ id: string; name: string }> }>('/profiles');
  return { profiles: data.data };
};
```

**Correct: Display profiles in a Svelte component**

```svelte
<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<h1>Profiles</h1>

<ul>
  {#each data.profiles as profile (profile.id)}
    <li>
      <a href="/profiles/{profile.id}">{profile.name}</a>
    </li>
  {/each}
</ul>
```

**Correct: Form actions for create and delete**

```typescript
// ✅ src/routes/profiles/+page.server.ts  (extended with actions)
import { fail, redirect } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const data = await nextdnsFetch<{ data: Array<{ id: string; name: string }> }>('/profiles');
  return { profiles: data.data };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name') as string;

    if (!name?.trim()) return fail(400, { message: 'Name is required' });

    await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    redirect(303, '/profiles');
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;

    await nextdnsFetch(`/profiles/${id}`, { method: 'DELETE' });

    redirect(303, '/profiles');
  },
};
```

**Correct: Form markup for create**

```svelte
<form method="POST" action="?/create">
  <input name="name" placeholder="Profile name" required />
  <button type="submit">Create</button>
</form>
```

**Incorrect:**

```typescript
// ❌ Never use +page.ts for data that requires private env vars
// +page.ts runs in the browser during client navigation
import { NEXTDNS_API_KEY } from '$env/static/private'; // ❌ Build error
```

**Incorrect:**

```svelte
<script>
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed in client bundle
  });
</script>
```

### 4.6 SSE Alternatives: Polling and Long-Polling

**Impact: MEDIUM (On platforms that buffer SSE responses (Cloudflare Workers, some edge runtimes), the real-time log stream never reaches the browser without an alternative strategy)**

Implement polling-based log fetching for platforms where SSE streaming is not supported

Implement polling-based log fetching for platforms where SSE streaming is not supported

Server-Sent Events (SSE) require long-lived HTTP connections. Some deployment platforms buffer

responses before forwarding them to the client:

- **Cloudflare Workers** (default): buffers responses unless you use `TransformStream`

- **Vercel Edge Functions**: 30-second request timeout limits SSE duration

- **Some shared hosting**: does not support chunked transfer encoding

When SSE is not viable, the alternative is **polling**: the client calls `GET /api/profiles/{id}/logs`

on a regular interval and displays the freshest data. For near-real-time results, use **short

intervals** (5–10 seconds). For less time-sensitive dashboards, use longer intervals (30–60 seconds).

If you need true SSE on Cloudflare Workers, use `TransformStream` to prevent response buffering:

| Aspect | Polling | SSE |

|--------|---------|-----|

| Platform support | Universal | Requires streaming runtime |

| Latency | ~10s | ~1s |

| Server load | Higher (per-interval requests) | Lower (one persistent connection) |

| Implementation complexity | Low | Medium |

| Good for | Edge runtimes, simple dashboards | Real-time log viewers |

- **Use `from=-5m` on the first poll** to show recent data without fetching the entire log history.

- **Use the `stream.id` from log responses** as the cursor for subsequent polls to avoid duplicate

  entries.

- **Show a clear "last updated" timestamp** to let users know when data was last refreshed.

- **Implement manual refresh button**: Let users trigger an immediate refresh without waiting for

  the interval.

- [NextDNS API — Logs](https://nextdns.github.io/api/#logs)

- [SvelteKit — Server Routes](https://kit.svelte.dev/docs/routing#server)

- [Cloudflare Workers — Streams](https://developers.cloudflare.com/workers/runtime-apis/streams/)

- [MDN — TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)

### 4.7 SvelteKit Project Setup

**Impact: HIGH ()**

Bootstrap a SvelteKit project with TypeScript, an SSR adapter, and secure environment variable

Bootstrap a SvelteKit project with TypeScript, an SSR adapter, and secure environment variable

handling for NextDNS API integration

SvelteKit requires an **adapter** to deploy to a target platform. The adapter determines how server

routes (`+server.ts`) run — `@sveltejs/adapter-node` for Node.js servers, platform-specific adapters

for Vercel, Netlify, Cloudflare, and more Without a server-capable adapter, `+server.ts` routes cannot

run and API key security is broken.

**Solution**: Ensure `src/routes/api/profiles/+server.ts` exists (with the `+server` prefix) and

exports at least one handler (`GET`, `POST`, and more).

**Solution**: Platform-specific secret management is required in production. For Vercel, add secrets

in Project Settings → Environment Variables. For Docker, pass `--env-file .env`.

- [SvelteKit — Project Structure](https://kit.svelte.dev/docs/project-structure)

- [SvelteKit — Adapters](https://kit.svelte.dev/docs/adapters)

- [SvelteKit — \$env/static/private](https://kit.svelte.dev/docs/modules#$env-static-private)

- [NextDNS API Reference](https://nextdns.github.io/api/)

**Correct: Create a new project**

```bash
# ✅ Bootstrap with TypeScript enabled
pnpm dlx sv create my-nextdns-app
cd my-nextdns-app
pnpm install
```

When prompted: select **SvelteKit minimal** template and enable **TypeScript**.

**Correct: Install adapter**

```bash
# ✅ Node.js adapter (for self-hosted / Docker deployments)
pnpm add -D @sveltejs/adapter-node
```

**Correct: `Svelte.config.js`**

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

**Correct: Environment variables**

```bash
# .env  (gitignored)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

Add `.env` to `.gitignore`:

**Correct:**

```bash
echo ".env" >> .gitignore
```

**Correct: Directory structure**

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

**Correct: Verify server-only protection**

```typescript
// src/lib/server/nextdns.ts
// ✅ Any file under src/lib/server/ cannot be imported by client code
import { NEXTDNS_API_KEY } from '$env/static/private';
```

**Incorrect:**

```bash
# ❌ Do NOT use adapter-static — it generates a pure static site with no server routes
pnpm add @sveltejs/adapter-static
```

**Incorrect:**

```javascript
// ❌ Never set fallback in adapter-static config — it disables server routes
adapter: adapter({ fallback: 'index.html' });
```

---

## 5. React Router

**Impact: MEDIUM**

### 5.1 Analytics Charts (React Router v7)

**Impact: MEDIUM ()**

Fetch NextDNS analytics data in a React Router v7 `loader` and render interactive charts in React

Fetch NextDNS analytics data in a React Router v7 `loader` and render interactive charts in React

components

The NextDNS API provides query statistics and time-series analytics endpoints under

`/profiles/{id}/analytics`. Data must be fetched in a `loader` function (server-side) because the

API key is required. The component receives `loaderData` as a prop. Charting libraries such as

Recharts or Chart.js render on the client after hydration.

- **`Promise.all` in loader**: Fetch multiple analytics endpoints concurrently to minimize page load

  time.

- **`request.url` for search params**: Use `new URL(request.url).searchParams` in the loader to read

  query parameters like `from` without client-side JavaScript.

- **`Form method="get"`**: Use a GET form for filter changes — React Router re-runs the loader with

  the new query string without a full-page reload in SPA mode.

- **`useNavigation`**: Show a loading indicator while the loader refetches with new params.

**Symptoms**: `ResponsiveContainer` returns 0 width on SSR.

**Solution**: Recharts requires a DOM-measured container. Use `suppressHydrationWarning` on the

container or wrap in a client-only component that renders after mount.

**Solution**: Use `<Form method="get" replace>` to replace the history entry instead of pushing a

new one, keeping the URL clean.

- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)

- [Recharts Documentation](https://recharts.org)

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)

**Correct: Fetch analytics in a loader**

```typescript
// ✅ app/routes/profiles.$id.analytics.tsx
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id.analytics';

interface QueryStat {
  name: string;
  queries: number;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') ?? '30d';

  const [topDomains, summary] = await Promise.all([
    nextdnsFetch<{ data: QueryStat[] }>(`/profiles/${params.id}/analytics/topDomains?from=${from}`),
    nextdnsFetch<{ data: { queries: number; blocked: number } }>(
      `/profiles/${params.id}/analytics/status?from=${from}`
    ),
  ]);

  return { topDomains: topDomains.data, summary: summary.data, from };
}
```

**Correct: Render with recharts**

```typescript
// ✅ app/routes/profiles.$id.analytics.tsx  (continued)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Form, useNavigation } from 'react-router';

export default function AnalyticsPage({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div>
      <h1>Analytics</h1>

      <Form method="get">
        <select name="from" defaultValue={loaderData.from}>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <button type="submit">Apply</button>
      </Form>

      {isLoading && <p>Loading...</p>}

      <p>
        Total: {loaderData.summary.queries} · Blocked: {loaderData.summary.blocked}
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={loaderData.topDomains}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="queries" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Correct: Install recharts**

```bash
pnpm add recharts
```

**Incorrect:**

```typescript
// ❌ Never use clientLoader to fetch NextDNS analytics — exposes the API key
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(
    `https://api.nextdns.io/profiles/${params.id}/analytics/topDomains`,
    { headers: { 'X-Api-Key': import.meta.env.VITE_NEXTDNS_API_KEY } } // ❌
  );
  return res.json();
}
```

### 5.2 API Key Proxy (BFF Pattern)

**Impact: HIGH ()**

Proxy all NextDNS API calls through React Router v7 resource routes to keep X-Api-Key server-side

Proxy all NextDNS API calls through React Router v7 resource routes to keep X-Api-Key server-side

only

The NextDNS `X-Api-Key` grants full account access. It must **never** appear in browser-visible

code. React Router v7 resource routes (route modules without a default component export) run

exclusively on the server and are the correct place to attach the key before forwarding requests to

`api.nextdns.io`. Environment variables without the `VITE_` prefix are never included in client

bundles.

- **`.server.ts` suffix**: Vite (used by React Router v7) strips files ending in `.server.ts` from

  client bundles, preventing accidental imports of server-only code.

- **`process.env` in loaders/actions**: Server code (loaders, actions, resource routes) runs only on

  the server and has access to `process.env`. Never pass env vars to client components as props.

- **`ssr: true`**: Ensure `react-router.config.ts` sets `ssr: true`; otherwise resource routes are

  not executed on the server.

**Solution**: Add the variable to `.env` (development) or the platform's secret store (production).

Variables without the `VITE_` prefix are server-only and require restart to pick up.

**Solution**: Verify the route is registered in `app/routes.ts` and the file has no default

component export — a default export turns it into a UI route, not a resource route.

- [React Router v7 — Resource Routes](https://reactrouter.com/how-to/resource-routes)

- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

**Correct: Environment variable setup**

```bash
# .env  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Shared server utility**

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

**Correct: Register resource routes**

```typescript
// ✅ app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('api/profiles', 'routes/api.profiles.ts'),
  route('api/profiles/:id', 'routes/api.profiles.$id.ts'),
] satisfies RouteConfig;
```

**Correct: Profiles resource route**

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

**Correct: Dynamic profile resource route**

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

**Incorrect:**

```typescript
// ❌ Never prefix the API key with VITE_ — it gets bundled into the client JS
// .env
VITE_NEXTDNS_API_KEY = YOUR_API_KEY; // ❌ Visible in browser source via import.meta.env
```

**Incorrect:**

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

### 5.3 Data Revalidation Strategies (React Router v7)

**Impact: MEDIUM (Without shouldRevalidate or fetcher-based mutations, every navigation triggers a full loader re-run, causing unnecessary API calls and UI flicker)**

Control when React Router v7 re-runs loaders and implement background mutations with fetchers

Control when React Router v7 re-runs loaders and implement background mutations with fetchers

By default, React Router re-runs all active loaders after every action. For a NextDNS dashboard

with multiple panels (profile list, analytics, recent logs), this can mean 3–4 unnecessary API

calls per user interaction. Fine-tuning revalidation reduces API usage and prevents UI flicker.

Three tools are available:

1. **`shouldRevalidate`** — skip a loader re-run when it is not needed.

2. **`fetcher`** — trigger mutations without navigating, enabling inline updates.

3. **`defer` + `<Await>`** — render the page immediately with static data while analytics loads in

   the background.

Use `fetcher.submit` for mutations that should not navigate away from the current page:

Render the profile list immediately while analytics loads in the background:

- [React Router v7 — Data loading](https://reactrouter.com/start/framework/data-loading)

- [React Router v7 — Fetchers](https://reactrouter.com/api/hooks/useFetcher)

- [React Router v7 — Defer and Await](https://reactrouter.com/api/utils/data)

- [React Router v7 — Await](https://reactrouter.com/api/components/Await)

**Incorrect:**

```typescript
// ❌ Returning true from shouldRevalidate unconditionally — defeats its purpose
export function shouldRevalidate() {
  return true; // ❌ Same as not having shouldRevalidate at all
}

// ❌ Using navigate() instead of fetcher for inline mutations
// navigate() triggers a full navigation and re-runs all loaders
import { useNavigate } from 'react-router';
const navigate = useNavigate();
await deleteProfile(id);
navigate('.'); // ❌ Use fetcher.submit instead
```

### 5.4 Error Handling (React Router v7)

**Impact: MEDIUM ()**

Map NextDNS API errors to React Router v7 error boundaries and inline component feedback

Map NextDNS API errors to React Router v7 error boundaries and inline component feedback

React Router v7 provides two error-handling mechanisms:

1. **`ErrorBoundary` export** in a route module — catches errors thrown by `loader` or `action` and

   renders a fallback UI. In Framework Mode, `ErrorBoundary` receives `error` as a typed prop via

   `Route.ErrorBoundaryProps`.

2. **Returning error data** from `action` — returns a typed object (no throw) for inline form

   validation errors, available as `actionData` in the component.

Throw errors in `loader` for unrecoverable failures. Return error objects from `action` for

recoverable validation failures.

- **`throw data()` in `loader`, return in `action`**: Thrown errors trigger `ErrorBoundary`;

  returned objects are available as `actionData` for inline feedback.

- **`isRouteErrorResponse`**: Use this helper to distinguish between `data()` throws and unexpected

  JavaScript errors in `ErrorBoundary`.

- **Nested error boundaries**: Each route segment can have its own `ErrorBoundary`, isolating

  failures to that segment without crashing the entire layout.

- **`Route.ErrorBoundaryProps`**: In Framework Mode, use the auto-generated type for the `error`

  prop instead of the `useRouteError()` hook (which is for Data Mode).

**Symptoms**: Loader throws but the app shows a blank page instead of the error boundary.

**Solution**: Ensure `ErrorBoundary` is exported from the **same route module** as the `loader`, not

just from `root.tsx`.

**Solution**: Ensure the `action` returns a plain object (not `undefined`) on error. Returning

`null` is valid for success; returning `{ error: '...' }` gives `actionData` to the component.

- [React Router v7 — Error Boundaries](https://reactrouter.com/how-to/error-boundary)

- [React Router v7 — Actions](https://reactrouter.com/start/framework/actions)

- [React Router v7 — `data()` utility](https://reactrouter.com/api/utils/data)

- [NextDNS API — Error Responses](https://nextdns.github.io/api/)

**Correct: Route-level error boundary (framework mode)**

```typescript
// ✅ app/routes/profiles.$id.tsx
import { data, isRouteErrorResponse } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const result = await nextdnsFetch<{ data: { id: string; name: string } }>(
      `/profiles/${params.id}`,
    );
    return { profile: result.data };
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('404')) {
      // Use data() to throw typed responses with status codes
      throw data('Profile not found', { status: 404 });
    }
    if (message.includes('401')) {
      throw data('Invalid API key', { status: 401 });
    }
    throw data('Upstream error', { status: 502 });
  }
}

// In Framework Mode, ErrorBoundary receives error as a typed prop (not useRouteError hook)
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status}: {error.statusText}
        </h1>
        <p>{error.data}</p>
        <a href="/profiles">Back to profiles</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>{(error as Error).message}</p>
    </div>
  );
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.profile.name}</h1>
    </div>
  );
}
```

**Correct: Inline action error (form validation)**

```typescript
// ✅ app/routes/profiles.tsx  (action returns error, does not throw)
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = form.get('name') as string;

  if (!name?.trim()) {
    // Return (not throw) — renders as actionData in the component
    return { error: 'Profile name is required' };
  }

  try {
    await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return null;
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export default function ProfilesPage({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      {actionData?.error && <p className="error">{actionData.error}</p>}
      {/* form... */}
    </div>
  );
}
```

**Correct: Root error boundary (catch-all)**

```typescript
// ✅ app/root.tsx  (add ErrorBoundary to the root route)
import { isRouteErrorResponse, Links, Meta, Scripts } from 'react-router';
import type { Route } from './+types/root';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Something went wrong</h1>
        {isRouteErrorResponse(error) ? (
          <p>
            {error.status}: {error.data}
          </p>
        ) : (
          <p>{(error as Error).message}</p>
        )}
        <Scripts />
      </body>
    </html>
  );
}
```

**Incorrect:**

```typescript
// ❌ Never swallow errors in loaders — the component will receive undefined loaderData
export async function loader({ params }: Route.LoaderArgs) {
  try {
    return await nextdnsFetch(`/profiles/${params.id}`);
  } catch {
    return null; // ❌ Component renders with null, no error UI shown
  }
}
```

**Incorrect:**

```typescript
// ❌ Never throw from an action when you want inline validation errors
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (!form.get('name')) {
    throw data('Name required', { status: 400 }); // ❌ Triggers ErrorBoundary, leaves the page
  }
}
```

**Incorrect:**

```typescript
// ❌ In Framework Mode, do NOT use useRouteError() hook — use the typed prop instead
import { useRouteError } from 'react-router'; // ❌ Data Mode hook
export function ErrorBoundary() {
  const error = useRouteError(); // ❌ Use Route.ErrorBoundaryProps instead
}
```

### 5.5 Log Streaming via SSE (React Router v7)

**Impact: MEDIUM ()**

Proxy the NextDNS real-time log stream through a React Router v7 resource route and consume it in a

Proxy the NextDNS real-time log stream through a React Router v7 resource route and consume it in a

React component

The NextDNS API exposes a Server-Sent Events (SSE) stream at `/logs/stream`. The API key must be

added on the server side. A React Router v7 resource route (a route module without a default

component export) proxies the upstream SSE stream as a `ReadableStream` response. The React

component connects to the local resource route URL and parses incoming `data:` events.

- **Resource route for SSE proxy**: A route module without a default component export acts as an API

  endpoint — `loader` handles GET (SSE stream) cleanly.

- **Pipe `upstream.body`**: Pass the `ReadableStream` directly to avoid buffering.

- **Cleanup in `useEffect`**: Return a cleanup function that closes the `EventSource` to prevent

  memory leaks on navigation.

- **Cap log buffer**: Limit the `logs` state array to the last 200 entries.

**Symptoms**: `onerror` fires within seconds; no log events received.

**Solution**: Verify `Accept: text/event-stream` is sent to the upstream. Also ensure your

deployment platform does not buffer streaming responses (Vercel: use Edge Functions; Cloudflare: set

`Transfer-Encoding: chunked`).

**Solution**: `EventSource` is browser-only. Place the `new EventSource(...)` call inside

`useEffect` (client-only lifecycle) — never call it at module level or during SSR.

- [React Router v7 — Resource Routes](https://reactrouter.com/how-to/resource-routes)

- [MDN — EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#logs)

**Correct: Sse proxy resource route**

```typescript
// ✅ app/routes/api.profiles.$id.logs.stream.ts
// No default export = resource route
import { NEXTDNS_API_KEY } from '~/lib/nextdns.server';
import type { Route } from './+types/api.profiles.$id.logs.stream';

// Re-export constant to avoid re-importing everywhere
// app/lib/nextdns.server.ts should export NEXTDNS_API_KEY too
export async function loader({ params }: Route.LoaderArgs) {
  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) {
    return new Response('NEXTDNS_API_KEY is not configured', { status: 500 });
  }

  const upstream = await fetch(`https://api.nextdns.io/profiles/${params.id}/logs/stream`, {
    headers: {
      'X-Api-Key': apiKey,
      Accept: 'text/event-stream',
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to log stream', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

**Correct: Register the stream route**

```typescript
// ✅ app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('profiles/:id', 'routes/profiles.$id.tsx'),
  route('api/profiles/:id/logs/stream', 'routes/api.profiles.$id.logs.stream.ts'),
] satisfies RouteConfig;
```

**Correct: React component consuming sse**

```typescript
// ✅ app/routes/profiles.$id.logs.tsx
import { useEffect, useRef, useState } from 'react';
import type { Route } from './+types/profiles.$id.logs';

export async function loader({ params }: Route.LoaderArgs) {
  return { profileId: params.id };
}

export default function LogsPage({ loaderData }: Route.ComponentProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource(`/api/profiles/${loaderData.profileId}/logs/stream`);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
          setLogs((prev) => [JSON.stringify(entry), ...prev.slice(0, 199)]);
        } catch {
          // skip malformed events
        }
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => esRef.current?.close();
  }, [loaderData.profileId]);

  return (
    <div>
      <h1>Live Logs</h1>
      <ul>
        {logs.map((entry, i) => (
          <li key={i}>
            <code>{entry}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Incorrect:**

```typescript
// ❌ Never open an EventSource directly to api.nextdns.io from a React component
useEffect(() => {
  const es = new EventSource(
    `https://api.nextdns.io/profiles/${id}/logs/stream?apikey=YOUR_API_KEY` // ❌ Key in URL
  );
}, []);
```

### 5.6 Profile Management UI (React Router v7)

**Impact: MEDIUM ()**

Build NextDNS profile list, create, update, and delete flows using React Router v7 `loader` and

Build NextDNS profile list, create, update, and delete flows using React Router v7 `loader` and

`action` functions

React Router v7 uses `loader` (server-side data fetching) and `action` (server-side mutations) in

route modules. All NextDNS API calls must go through `loader`/`action` because they run only on the

server and have access to `process.env.NEXTDNS_API_KEY`. The component receives `loaderData` as a

prop automatically typed by the framework.

- **`loader` for GET, `action` for mutations**: This is the React Router v7 convention. `loader`

  runs on GET requests; `action` handles POST, PATCH, DELETE, PUT form submissions.

- **`Form` component over `fetch`**: Use the `<Form>` component from `react-router` for mutations —

  it progressively enhances and triggers `action` on submit.

- **Intent pattern**: A single `action` can handle multiple operations using a hidden `intent` field

  — avoids creating separate routes for each mutation.

- **Typed props**: Use `Route.ComponentProps`, `Route.LoaderArgs`, `Route.ActionArgs` from

  `./+types/<route-name>` for full type safety.

**Symptoms**: Component re-renders but `loaderData` is empty after the `action` runs.

**Solution**: React Router automatically re-runs the `loader` after an `action` completes

(revalidation). Ensure your `action` returns `null` or a valid object — throwing an error prevents

revalidation.

- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)

- [React Router v7 — Actions](https://reactrouter.com/start/framework/actions)

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

**Correct: Profile list route with loader**

```typescript
// ✅ app/routes/profiles.tsx
import { Form, Link } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles';

interface Profile {
  id: string;
  name: string;
}

export async function loader(_: Route.LoaderArgs) {
  const data = await nextdnsFetch<{ data: Profile[] }>('/profiles');
  return { profiles: data.data };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'delete') {
    const id = form.get('id') as string;
    await nextdnsFetch(`/profiles/${id}`, { method: 'DELETE' });
    return null;
  }

  if (intent === 'create') {
    const name = form.get('name') as string;
    if (!name?.trim()) {
      return { error: 'Profile name is required' };
    }
    await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return null;
  }
}

export default function ProfilesPage({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Profiles</h1>

      {actionData?.error && <p className="error">{actionData.error}</p>}

      <Form method="post">
        <input name="name" placeholder="New profile name" required />
        <button name="intent" value="create" type="submit">
          Create
        </button>
      </Form>

      <ul>
        {loaderData.profiles.map((profile) => (
          <li key={profile.id}>
            <Link to={`/profiles/${profile.id}`}>{profile.name}</Link>
            <Form method="post" style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={profile.id} />
              <button name="intent" value="delete" type="submit">
                Delete
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Correct: Individual profile route**

```typescript
// ✅ app/routes/profiles.$id.tsx
import { Form } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  const profile = await nextdnsFetch<{ data: { id: string; name: string } }>(
    `/profiles/${params.id}`,
  );
  return { profile: profile.data };
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.profile.name}</h1>
      <p>ID: {loaderData.profile.id}</p>
    </div>
  );
}
```

**Incorrect:**

```typescript
// ❌ Never use clientLoader for NextDNS API calls — runs in the browser
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(`https://api.nextdns.io/profiles/${params.id}`, {
    headers: { 'X-Api-Key': import.meta.env.VITE_NEXTDNS_API_KEY }, // ❌ Key exposed
  });
  return res.json();
}
```

### 5.7 React Router v7 Project Setup

**Impact: HIGH ()**

Bootstrap a React Router v7 project with SSR enabled, TypeScript, and secure environment variable

Bootstrap a React Router v7 project with SSR enabled, TypeScript, and secure environment variable

handling for NextDNS API integration

React Router v7 is a full-stack React framework (evolved from Remix). It uses **Vite** as its build

tool and supports multiple rendering modes: SSR, CSR, and static pre-rendering. For NextDNS

integration, **SSR must be enabled** so that `loader` and `action` functions run on the server where

`process.env.NEXTDNS_API_KEY` is available.

**Symptoms**: Network tab shows requests to `api.nextdns.io` from the browser.

**Solution**: Set `ssr: true` in `react-router.config.ts`. Without SSR, React Router falls back to

client-side data loading which exposes the API key.

**Solution**: Run `pnpm typecheck` or `pnpm dev` once — React Router auto-generates type files

under `app/routes/+types/` based on your route config.

- [React Router v7 — Getting Started](https://reactrouter.com/start/framework/installation)

- [React Router v7 — Rendering Modes](https://reactrouter.com/start/framework/rendering)

- [React Router v7 — Route Configuration](https://reactrouter.com/start/framework/routing)

- [NextDNS API Reference](https://nextdns.github.io/api/)

**Correct: Create a new project**

```bash
# ✅ Bootstrap with official CLI
pnpm create react-router@latest my-nextdns-app
cd my-nextdns-app
pnpm install
```

Select **TypeScript** when prompted.

**Correct: `React-router.config.ts`**

```typescript
// ✅ react-router.config.ts — SSR must be true
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true, // Required: enables server-side loaders and actions
} satisfies Config;
```

**Correct: Environment variables**

```bash
# .env  (gitignored by default)
NEXTDNS_API_KEY=YOUR_API_KEY
NEXTDNS_PROFILE_ID=abc123
```

**Correct:**

```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

**Correct: Directory structure**

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

**Correct: Server utility**

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

**Correct: Start development server**

```bash
pnpm dev
# Opens http://localhost:5173
```

**Incorrect:**

```typescript
// ❌ Never set ssr: false — disables server loaders, API keys leak to the browser
export default {
  ssr: false, // ❌
} satisfies Config;
```

**Incorrect:**

```bash
# ❌ Never prefix secrets with VITE_ — they are bundled into the client
VITE_NEXTDNS_API_KEY=YOUR_API_KEY  # ❌
```

---

