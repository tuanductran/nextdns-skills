---
title: 'Analytics Charts (SvelteKit)'
impact: MEDIUM
impactDescription:
  'Fetching analytics data from client-side code exposes the API key; all NextDNS analytics requests
  must go through server load functions'
type: capability
tags:
  - analytics
  - charts
  - time series
  - dashboard
  - visualization
  - page.server.ts
---

<!-- @case-police-ignore Api -->

# Analytics charts SvelteKit

Fetch NextDNS analytics data in `+page.server.ts` and render interactive charts in Svelte components

## Overview

The NextDNS API provides query statistics and time-series analytics endpoints under
`/profiles/{id}/analytics`. Data must be fetched server-side (in `+page.server.ts`) because the API
key is required. Charting libraries (for example, Chart.js via `svelte-chartjs`) render on the client after
hydration.

## Correct usage

### Fetch analytics server-side

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

### Render charts in a Svelte component

```svelte
<!-- ✅ src/routes/profiles/[id]/analytics/+page.svelte -->
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

### Install charting dependency

```bash
npm install svelte-chartjs chart.js
```

## Do NOT Use

```svelte
<!-- ❌ Never fetch analytics directly from a Svelte component's script -->
<script>
  const res = await fetch('https://api.nextdns.io/profiles/abc123/analytics/topDomains', {
    headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // ❌ Key exposed in browser
  });
</script>
```

## Best practices

- **Parallel fetching**: Use `Promise.all` in `load` to fetch multiple analytics endpoints
  simultaneously, reducing total latency.
- **Search params for time range**: Pass `from` as a URL search param so the browser can change the
  range without a new navigation (use `$page.url.searchParams` reactively in the component).
- **`$derived`**: Use Svelte 5's `$derived` rune to reactively transform `data` into chart datasets
  whenever the parent `data` prop updates.
- **Lazy chart registration**: Register only the Chart.js components you use to keep bundle size
  small.

## Troubleshooting

### Issue: chart does NOT render after navigation

**Symptoms**: Chart canvas is blank after client-side route navigation.

**Solution**: Chart.js instances are not automatically destroyed on navigation. Use `svelte-chartjs`
which handles this automatically, or destroy the chart instance in `onDestroy`.

### Issue: `from` query param causes full-page reload

**Solution**: Use `goto` from `$app/navigation` with `invalidate()` to refetch server data without a
full reload:

```svelte
<script>
  import { goto, invalidate } from '$app/navigation';

  async function changeRange(from: string) {
    await goto(`?from=${from}`, { keepFocus: true });
    await invalidate('app:analytics');
  }
</script>
```

## Reference

- [SvelteKit — Load Functions](https://kit.svelte.dev/docs/load)
- [svelte-chartjs](https://www.chartjs.org/docs/latest/)
- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
