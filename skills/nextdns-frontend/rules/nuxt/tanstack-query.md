---
title: 'TanStack Query (Vue Query) Integration'
impact: MEDIUM
impactDescription: 'Without mutation invalidation, the UI shows stale profile data after create or delete operations'
type: efficiency
tags:
  - tanstack query
  - vue query
  - nuxt
  - composable
  - cache
  - mutation
  - optimistic update
  - pagination
---

<!-- @case-police-ignore Api -->

# TanStack Query (Vue query) integration

Use TanStack Query (Vue Query) in a Nuxt 4 project for advanced data fetching with caching, mutations, and infinite pagination for NextDNS data

## Overview

While Nuxt's built-in `useFetch` is sufficient for simple cases, TanStack Query (Vue Query) provides
more powerful primitives for:

- **Automatic cache invalidation** after mutations
- **Optimistic updates** for instant UI feedback on delete/create
- **Infinite queries** for paginating through large log or analytics datasets
- **Background refetching** and stale-while-revalidate patterns

All API calls still go through Nuxt server routes — Vue Query fetches from `/api/*`, never directly
from `api.nextdns.io`.

## Setup

### Install dependencies

```bash
pnpm add @tanstack/vue-query
```

### Configure the plugin

```typescript
// ✅ plugins/vue-query.ts
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,      // 30 seconds
        gcTime: 5 * 60_000,     // 5 minutes
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
});
```

## Fetching profiles with caching

```typescript
// ✅ app/composables/useProfilesQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';

interface Profile {
  id: string;
  name: string;
}

interface ProfileListResponse {
  data: Profile[];
}

export function useProfilesQuery() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async (): Promise<Profile[]> => {
      const res = await $fetch<ProfileListResponse>('/api/profiles');
      return res.data;
    },
    staleTime: 60_000, // Cache for 1 minute
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) =>
      $fetch(`/api/profiles/${profileId}`, { method: 'DELETE' }),

    // Optimistic update — remove from cache immediately
    onMutate: async (profileId) => {
      await queryClient.cancelQueries({ queryKey: ['profiles'] });

      const previous = queryClient.getQueryData<Profile[]>(['profiles']);

      queryClient.setQueryData<Profile[]>(
        ['profiles'],
        (old) => old?.filter((p) => p.id !== profileId) ?? []
      );

      return { previous };
    },

    // Rollback on error
    onError: (_err, _profileId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['profiles'], context.previous);
      }
    },

    // Always refetch after settlement
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      $fetch('/api/profiles', { method: 'POST', body: { name } }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
```

### Profile list page using Vue Query

```vue
<!-- ✅ app/pages/index.vue -->
<script setup lang="ts">
import {
  useProfilesQuery,
  useDeleteProfileMutation,
  useCreateProfileMutation,
} from '~/composables/useProfilesQuery';

const { data: profiles, isLoading, error } = useProfilesQuery();
const deleteMutation = useDeleteProfileMutation();
const createMutation = useCreateProfileMutation();

const newName = ref('');

async function handleCreate() {
  if (!newName.value.trim()) return;
  await createMutation.mutateAsync(newName.value);
  newName.value = '';
}
</script>

<template>
  <div>
    <h1>Profiles</h1>

    <div v-if="isLoading" aria-live="polite" role="status">Loading profiles…</div>
    <div v-else-if="error" class="text-red-500">{{ error.message }}</div>

    <ul v-else>
      <li v-for="profile in profiles" :key="profile.id">
        {{ profile.name }}
        <button
          :disabled="deleteMutation.isPending.value"
          @click="deleteMutation.mutate(profile.id)"
        >
          Delete
        </button>
      </li>
    </ul>

    <form @submit.prevent="handleCreate">
      <input v-model="newName" placeholder="New profile name" required />
      <button type="submit" :disabled="createMutation.isPending.value">
        Create
      </button>
    </form>
  </div>
</template>
```

## Infinite query for log pagination

```typescript
// ✅ app/composables/useLogsInfiniteQuery.ts
import { useInfiniteQuery } from '@tanstack/vue-query';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: string;
}

interface LogResponse {
  data: LogEntry[];
  meta: { pagination: { cursor: string | null } };
}

export function useLogsInfiniteQuery(profileId: Ref<string>) {
  return useInfiniteQuery({
    queryKey: computed(() => ['logs', profileId.value]),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '100' });
      if (pageParam) params.set('cursor', pageParam as string);

      return $fetch<LogResponse>(
        `/api/profiles/${profileId.value}/logs?${params}`
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta.pagination.cursor ?? undefined,
  });
}
```

```vue
<!-- ✅ app/pages/profiles/[id]/logs.vue -->
<script setup lang="ts">
const route = useRoute();
const profileId = computed(() => route.params.id as string);

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useLogsInfiniteQuery(profileId);

const allLogs = computed(
  () => data.value?.pages.flatMap((page) => page.data) ?? []
);
</script>

<template>
  <div>
    <ul>
      <li v-for="log in allLogs" :key="log.timestamp + log.domain">
        {{ log.timestamp }} — {{ log.domain }} — {{ log.status }}
      </li>
    </ul>

    <button
      v-if="hasNextPage"
      :disabled="isFetchingNextPage"
      @click="fetchNextPage"
    >
      {{ isFetchingNextPage ? 'Loading…' : 'Load more' }}
    </button>
  </div>
</template>
```

## Do NOT Use

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

## Reference

- [TanStack Query — Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Nuxt 4 — Server Routes](https://nuxt.com/docs/4.x/directory-structure/server)
- [NextDNS API — Pagination](https://nextdns.github.io/api/#pagination)
