---
title: 'Analytics Charts'
impact: MEDIUM
impactDescription:
  'Fetching analytics without date range parameters returns all-time data, causing slow responses
  and misleading charts'
type: capability
tags:
  - analytics
  - charts
  - time series
  - vue
  - dashboard
  - visualization
---

<!-- @case-police-ignore Api -->

# Analytics charts

Fetch NextDNS time-series analytics and render them as charts in a Nuxt dashboard

## Overview

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.
- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an
  array of counts over time, suitable for line or bar charts.

Both shapes are fetched through a Nuxt server route to keep the API key server-side.

## Correct usage

### Server routes

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

### Composable — aggregated analytics

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

### Status donut chart (aggregated)

```vue
<!-- ✅ app/components/StatusChart.vue -->
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

### Query trend line chart (time series)

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

### Top blocked domains table

```vue
<!-- ✅ app/components/TopBlockedDomains.vue -->
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

## Do NOT Use

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

## Best practices

- **Always pass `from`**: Omitting the date range returns all-time data, which is slow and can
  overwhelm a chart.
- **Use `;series` for trend charts**: Aggregated endpoints return a single number — time series
  returns arrays for plotting over time.
- **Cache analytics responses**: Analytics data does not change in real-time. Use Nuxt's
  `getCachedData` or `useAsyncData` with `dedupe: 'defer'` to avoid redundant fetches.
- **Limit to `limit=10`** for top-N tables to keep response sizes small.

## Troubleshooting

### Issue: time-series chart has misaligned x-axis

**Symptoms**: The number of data points in `queries` does not match `meta.series.times`.

**Solution**: Both arrays have the same length by design. Ensure you are reading from
`data.meta.series.times` (not constructing timestamps manually).

### Issue: analytics endpoint returns empty `data` array

**Symptoms**: No queries are shown even though the profile is active.

**Solution**: Verify the `from` date range covers a period where the profile was in use. Check the
profile's logs to confirm queries were made.

## Reference

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
- [NextDNS API — Time Series](https://nextdns.github.io/api/#time-series)
- [Nuxt 4 — useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch)
