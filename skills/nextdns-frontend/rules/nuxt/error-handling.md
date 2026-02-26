---
title: 'Error Handling'
impact: MEDIUM
impactDescription:
  'Unhandled API errors silently fail or show raw JSON to users, breaking the UI feedback loop'
type: capability
tags:
  - error handling
  - notifications
  - createError
  - nuxt ui
  - toast
  - api errors
---

<!-- @case-police-ignore Api -->

# Error Handling

Map NextDNS API errors to user-friendly Nuxt UI notifications

## Overview

The NextDNS API returns errors in two formats:

- **400 Bad Request** with `{ "errors": [...] }` — validation errors (invalid input).
- **200 OK** with `{ "errors": [...] }` — user-level errors (e.g., duplicate profile name).

Both must be handled explicitly. Nuxt server routes should translate upstream errors into H3 errors,
and Vue components should display them via Nuxt UI toasts.

## Correct Usage

### Server route — translate upstream errors

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

### Vue composable — handle errors from useFetch

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

### Global error handler for useFetch

```vue
<!-- ✅ Handle errors inline with useFetch -->
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

### 404 and 401 handling in server routes

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

## Do NOT Use

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

## Best Practices

- **Always check `json.errors`**: The NextDNS API returns user errors inside a 200 response — HTTP
  status alone is not sufficient.
- **Use Nuxt UI `useToast`**: Toast notifications are non-blocking and keep the UI usable after
  transient errors.
- **Provide actionable messages**: Translate error codes like `invalid` into sentences like _"Domain
  format is invalid — use example.com without a trailing dot."_
- **Log server-side errors**: Use `console.error` in server routes to capture upstream failures
  without exposing details to the browser.

## Troubleshooting

### Issue: `useToast` is undefined in a composable

**Solution**: `useToast` requires `@nuxt/ui`. Ensure the module is installed and added to
`nuxt.config.ts`. Also wrap your `app.vue` with `<UApp>` which provides the toast provider:

```vue
<!-- app.vue -->
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

### Issue: Error details not surfaced from server route to browser

**Solution**: When using `createError`, pass details in the `data` field — Nuxt serialises it to the
client:

```typescript
throw createError({ statusCode: 422, message: 'Validation failed', data: json.errors });
// Client: error.value.data contains the full errors array
```

## Reference

- [Nuxt 4 — Error Handling](https://nuxt.com/docs/4.x/getting-started/error-handling)
- [Nuxt UI — Toast](https://ui.nuxt.com/components/toast)
- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)
