---
title: 'Profile Management UI'
impact: MEDIUM
impactDescription:
  'Direct mutation without optimistic updates causes jarring UI flicker and inconsistent state'
type: capability
tags:
  - profile
  - crud
  - useFetch
  - composable
  - vue
  - nuxt
---

<!-- @case-police-ignore Api -->

# Profile management UI

Build profile list, create, update, and delete flows with Nuxt 4 composables

## Overview

Profile management in a Nuxt frontend relies on calling the Nuxt server routes (which proxy to the
NextDNS API) via `useFetch` or `$fetch`. Keep data-fetching logic in composables and UI in pages.

## Correct usage

### Composable — profile crud

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

### Profile list page

```vue
<!-- ✅ app/pages/index.vue -->
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

### Profile detail page

```vue
<!-- ✅ app/pages/profiles/[id].vue -->
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

### Server routes

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

## Do NOT Use

```typescript
// ❌ Calling api.nextdns.io directly from a composable
const { data } = await useFetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed to browser
});

// ❌ Mutating profiles array without refreshing from server on create/update
profiles.value.push({ id: 'unknown', name }); // ❌ ID is server-generated
```

## Best practices

- **Always use server-generated IDs**: After `createProfile`, call `fetchProfiles()` to get the real
  ID assigned by NextDNS — never assume or generate IDs client-side.
- **Use `useState` for shared profile state**: Prevents redundant fetches across components on the
  same page.
- **Guard deletions with confirmation dialogs**: Profile deletion is irreversible and clears all
  associated logs.

## Troubleshooting

### Issue: `usefetch` returns stale data after mutation

**Solution**: Call `refreshNuxtData()` or re-fetch explicitly after mutations:

```typescript
const { refresh } = await useFetch('/api/profiles');
await deleteProfile(id);
await refresh();
```

## Reference

- [Nuxt 4 — useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt 4 — useState](https://nuxt.com/docs/4.x/api/composables/use-state)
- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
