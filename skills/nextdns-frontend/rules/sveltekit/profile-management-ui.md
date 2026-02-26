---
title: 'Profile Management UI (SvelteKit)'
impact: MEDIUM
impactDescription:
  'Using +page.ts instead of +page.server.ts for data loading leaks API calls to the browser and may
  expose authentication context'
type: capability
tags:
  - profile
  - crud
  - load function
  - form actions
  - svelte
  - page.server.ts
---

<!-- @case-police-ignore Api -->

# Profile Management UI (SvelteKit)

Build NextDNS profile list, create, update, and delete flows using SvelteKit load functions and form
actions

## Overview

SvelteKit separates server-only data loading (`+page.server.ts`) from shared loading (`+page.ts`).
For NextDNS profile management, always use `+page.server.ts` because it accesses
`$env/static/private` and proxies API calls. Form actions in `+page.server.ts` handle mutations
(create, update, delete) without requiring a separate API route.

## Correct Usage

### Load profiles on the server

```typescript
// ✅ src/routes/profiles/+page.server.ts
import { nextdnsFetch } from '$lib/server/nextdns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const data = await nextdnsFetch<{ data: Array<{ id: string; name: string }> }>('/profiles');
  return { profiles: data.data };
};
```

### Display profiles in a Svelte component

```svelte
<!-- ✅ src/routes/profiles/+page.svelte -->
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

### Form actions for create and delete

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

### Form markup for create

```svelte
<!-- ✅ src/routes/profiles/+page.svelte  (add to existing markup) -->
<form method="POST" action="?/create">
  <input name="name" placeholder="Profile name" required />
  <button type="submit">Create</button>
</form>
```

## Do NOT Use

```typescript
// ❌ Never use +page.ts for data that requires private env vars
// +page.ts runs in the browser during client navigation
import { NEXTDNS_API_KEY } from '$env/static/private'; // ❌ Build error
```

```svelte
<!-- ❌ Never call api.nextdns.io directly from component <script> -->
<script>
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed in client bundle
  });
</script>
```

## Best Practices

- **`+page.server.ts` for all NextDNS data**: Server load functions run only on the server and can
  safely import `$env/static/private`.
- **Form actions over fetch**: Use SvelteKit form actions for mutations — they work without
  JavaScript and support progressive enhancement via `use:enhance`.
- **`use:enhance`**: Import from `$app/forms` to enable client-side form submission without
  full-page reload.

## Troubleshooting

### Issue: `fail()` result not shown in the UI

**Solution**: Import `form` from `PageProps` and display `form?.message` in the template:

```svelte
<script lang="ts">
  let { data, form }: PageProps = $props();
</script>

{#if form?.message}
  <p class="error">{form.message}</p>
{/if}
```

## Reference

- [SvelteKit — Load Functions](https://kit.svelte.dev/docs/load)
- [SvelteKit — Form Actions](https://kit.svelte.dev/docs/form-actions)
- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
