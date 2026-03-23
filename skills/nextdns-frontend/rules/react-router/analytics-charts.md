---
title: 'Analytics Charts (React Router v7)'
impact: MEDIUM
impactDescription:
  'Fetching analytics data from the client exposes the API key; all NextDNS analytics requests must
  be made in server loaders'
type: capability
tags:
  - analytics
  - charts
  - time series
  - dashboard
  - visualization
  - loader
---

<!-- @case-police-ignore Api -->

# Analytics charts React router v7)

Fetch NextDNS analytics data in a React Router v7 `loader` and render interactive charts in React
components

## Overview

The NextDNS API provides query statistics and time-series analytics endpoints under
`/profiles/{id}/analytics`. Data must be fetched in a `loader` function (server-side) because the
API key is required. The component receives `loaderData` as a prop. Charting libraries such as
Recharts or Chart.js render on the client after hydration.

## Correct usage

### Fetch analytics in a loader

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

### Render with recharts

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

### Install recharts

```bash
pnpm add recharts
```

## Do NOT Use

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

## Best practices

- **`Promise.all` in loader**: Fetch multiple analytics endpoints concurrently to minimize page load
  time.
- **`request.url` for search params**: Use `new URL(request.url).searchParams` in the loader to read
  query parameters like `from` without client-side JavaScript.
- **`Form method="get"`**: Use a GET form for filter changes — React Router re-runs the loader with
  the new query string without a full-page reload in SPA mode.
- **`useNavigation`**: Show a loading indicator while the loader refetches with new params.

## Troubleshooting

### Issue: chart is blank on first render but shows data after interaction

**Symptoms**: `ResponsiveContainer` returns 0 width on SSR.

**Solution**: Recharts requires a DOM-measured container. Use `suppressHydrationWarning` on the
container or wrap in a client-only component that renders after mount.

### Issue: `from` search param resets on navigation

**Solution**: Use `<Form method="get" replace>` to replace the history entry instead of pushing a
new one, keeping the URL clean.

## Reference

- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)
- [Recharts Documentation](https://recharts.org)
- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
