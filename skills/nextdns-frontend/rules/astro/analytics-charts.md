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
  - astro
  - react island
  - dashboard
  - visualization
---

<!-- @case-police-ignore Api -->

# Analytics charts

Fetch NextDNS time-series analytics and render them as charts in an Astro + React dashboard

## Overview

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.
- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an
  array of counts over time, suitable for line or bar charts.

In Astro, static summary data is fetched in `.astro` frontmatter (server-side). Interactive charts
with date pickers are React islands that call the Astro analytics API endpoint.

## Correct usage

### Astro API endpoint — analytics proxy

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

### Astro page — server-side aggregated analytics

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

### React island — interactive time-series chart

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

### Key analytics endpoints

| Endpoint                    | Description                                |
| --------------------------- | ------------------------------------------ |
| `/analytics/status`         | Query counts grouped by block/allow status |
| `/analytics/status;series`  | Status counts over time (line chart)       |
| `/analytics/domains`        | Top queried domains                        |
| `/analytics/domains;series` | Domain query trend over time               |
| `/analytics/trackers`       | Top tracker categories blocked             |
| `/analytics/countries`      | Query origin countries                     |

### Supported `from` values

| Value  | Meaning       |
| ------ | ------------- |
| `-1h`  | Last 1 hour   |
| `-24h` | Last 24 hours |
| `-7d`  | Last 7 days   |
| `-30d` | Last 30 days  |
| `-1y`  | Last 1 year   |

## Do NOT Use

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

## Best practices

- **Always include `from=`**: Scoped time ranges are faster and return more relevant data.
- **Use `client:visible` for chart islands**: Charts are often below the fold — `client:visible`
  defers JavaScript loading until the component scrolls into view.
- **Fetch static summaries in `.astro` frontmatter**: For dashboard tiles that don't need
  interactivity, use server-side fetching for instant paint without any client JavaScript.

## Troubleshooting

### Issue: analytics endpoint returns 404 for `;series` paths

**Solution**: The `;series` suffix is part of the URL path — it must be URL-encoded or passed
verbatim. Some routing configurations may strip it. Verify the Astro dynamic route file name does
not interfere with the semicolon character.

### Issue: swr returns stale data after changing the date range selector

**Solution**: SWR uses the URL as the cache key. Including `from` in the URL (as shown above)
ensures a fresh request is made whenever the selector value changes.

## Reference

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [Astro — Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [SWR Documentation](https://swr.vercel.app)
