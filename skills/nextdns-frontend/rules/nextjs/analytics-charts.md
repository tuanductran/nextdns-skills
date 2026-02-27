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
  - server component
  - dashboard
  - visualization
---

<!-- @case-police-ignore Api -->

# Analytics charts

Fetch NextDNS time-series analytics and render them as charts in a Next.js dashboard

## Overview

The NextDNS analytics API provides two shapes of data:

- **Aggregated** — for example, `/analytics/status` returns a total count per status.
- **Time series** — append `;series` to any endpoint (for example, `/analytics/status;series`) to get an
  array of counts over time, suitable for line or bar charts.

Both shapes are fetched through a Next.js Route Handler (or directly in a Server Component) to keep
the API key server-side.

## Correct usage

### Route handler — analytics proxy

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

### Server component — aggregated analytics

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

### Client component — time-series chart with swr

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

// ❌ Fetching analytics directly from a Client Component
('use client');
useEffect(() => {
  fetch(`https://api.nextdns.io/profiles/${id}/analytics/status`, {
    headers: { 'X-Api-Key': '...' }, // ❌ Key in browser
  });
}, []);
```

## Best practices

- **Always include `from=`**: Scoped time ranges are faster and return more relevant data.
- **Cache Server Component fetches**: For dashboard-level data, set `next: { revalidate: 60 }` in
  `nextdnsFetch` options to cache results for 60 seconds.
- **Use Client Components for interactive date pickers**: Allow users to change the time range
  without a full page navigation by fetching from Route Handlers in Client Components.

## Troubleshooting

### Issue: analytics endpoint returns 404

**Symptoms**: `nextdnsFetch` throws a `NextDNS error 404`.

**Solution**: Verify the endpoint path. The `;series` suffix is part of the URL path segment, not a
query parameter. Example: `/analytics/status;series` (correct) vs `/analytics/status?series`
(incorrect).

### Issue: time-series data has gaps

**Symptoms**: The series array is missing some time points.

**Solution**: NextDNS only returns data points where at least one query occurred. Gaps indicate
zero-query intervals, which is normal. Fill them client-side when rendering charts.

## Reference

- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
- [Next.js — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [SWR Documentation](https://swr.vercel.app)
