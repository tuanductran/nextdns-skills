---
title: 'Error Handling (SvelteKit)'
impact: MEDIUM
impactDescription:
  'Unhandled API errors crash pages or silently swallow failures; SvelteKit error boundaries and the
  error() helper must be used correctly to surface useful feedback'
type: efficiency
tags:
  - error handling
  - error boundary
  - +error.svelte
  - error()
  - api errors
  - notifications
---

<!-- @case-police-ignore Api -->

# Error Handling (SvelteKit)

Map NextDNS API errors to SvelteKit error responses and Svelte component-level feedback

## Overview

SvelteKit provides two error mechanisms:

1. **`error(status, message)`** from `@sveltejs/kit` — throws an HTTP error in server code, rendered
   by the nearest `+error.svelte` boundary.
2. **`fail(status, data)`** — returns a typed failure from a form action, displayed inline.

For `+server.ts` API routes, throw `error()` on failure. For form actions, use `fail()` to return
validation errors without triggering the error boundary.

## Correct Usage

### Error boundary page

```svelte
<!-- ✅ src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error?.message ?? 'An unexpected error occurred'}</h1>
<a href="/">Back to home</a>
```

### Throw errors in server routes

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

### Inline errors from form actions

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

### Display form action errors

```svelte
<!-- ✅ src/routes/profiles/+page.svelte -->
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

### Handle errors in load functions

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

## Do NOT Use

```typescript
// ❌ Never return error data as a regular object — it won't trigger the error boundary
export const load = async () => {
  return { error: 'Failed to load' }; // ❌ Page renders with partial data, no error boundary
};
```

```typescript
// ❌ Never swallow errors silently
try {
  await nextdnsFetch('/profiles');
} catch {
  // ❌ User sees nothing, page looks broken
}
```

## Best Practices

- **`error()` in server code, `fail()` in form actions**: `error()` triggers the `+error.svelte`
  boundary; `fail()` returns inline validation data without leaving the current page.
- **Map HTTP status codes**: Translate 401 → auth error, 404 → not found, 5xx → upstream error with
  a generic message (avoid leaking internal details).
- **`+error.svelte` per segment**: Place `+error.svelte` files at each route segment to provide
  context-aware error messages.

## Troubleshooting

### Issue: Error boundary not triggered — page renders blank

**Symptoms**: The `+error.svelte` file exists but is not rendered on error.

**Solution**: Ensure you're throwing `error()` (from `@sveltejs/kit`), not returning a plain object.
The `error()` helper throws an `HttpError` that SvelteKit catches.

### Issue: `page.error` is `null` in `+error.svelte`

**Solution**: Pass an object as the second argument: `error(404, { message: 'Not found' })`, not
just a string — the string form only sets `message` automatically in some SvelteKit versions.

## Reference

- [SvelteKit — Errors](https://kit.svelte.dev/docs/errors)
- [SvelteKit — Form Actions](https://kit.svelte.dev/docs/form-actions)
- [NextDNS API — Error Responses](https://nextdns.github.io/api/)
