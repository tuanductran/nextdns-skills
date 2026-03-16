---
title: 'Server Islands for Analytics Panels'
impact: MEDIUM
impactDescription: 'Without server:defer, heavy analytics panels block the initial page render, causing visible layout shift and slow Time to First Byte on the NextDNS dashboard'
type: capability
tags:
  - astro
  - server islands
  - defer
  - analytics
  - performance
  - lazy loading
  - streaming
---

<!-- @case-police-ignore Api -->

# Server islands for analytics panels

Use Astro 5 Server Islands (`server:defer`) to lazy-load NextDNS analytics panels without blocking the initial page render

## Overview

Astro 5 introduced **Server Islands** — a pattern where individual components can be deferred to
load after the initial page HTML is sent to the browser. This is ideal for a NextDNS dashboard
where:

- The **profile list** (fast, needed immediately) renders at page load
- The **analytics panels** (slow, can take 1–3 seconds) load after without blocking

The `server:defer` directive tells Astro to render a placeholder immediately and fetch the component
HTML asynchronously from the server. The component still runs on the server (the API key is never
exposed), but its rendering is decoupled from the initial response.

## Correct usage

### Analytics component as a server island

```astro
---
// ✅ src/components/AnalyticsPanel.astro — runs on server, deferred
import { nextdnsFetch } from '../lib/nextdns';

interface Props {
  profileId: string;
  from?: string;
}

const { profileId, from = '-7d' } = Astro.props;

let statusData: Array<{ status: string; queries: number }> = [];
let error: string | null = null;

try {
  const res = await nextdnsFetch<{ data: typeof statusData }>(
    `/profiles/${profileId}/analytics/status?from=${from}`
  );
  statusData = res.data;
} catch (err) {
  error = err instanceof Error ? err.message : 'Failed to load analytics';
}
---

{error ? (
  <p class="text-red-500" role="alert">{error}</p>
) : (
  <ul>
    {statusData.map((item) => (
      <li>
        <span>{item.status}</span>
        <span>{item.queries.toLocaleString()} queries</span>
      </li>
    ))}
  </ul>
)}
```

### Dashboard page — defer analytics panels

```astro
---
// ✅ src/pages/profiles/[id]/index.astro — profile list loads fast, analytics deferred
import { nextdnsFetch } from '../../../lib/nextdns';
import AnalyticsPanel from '../../../components/AnalyticsPanel.astro';
import TopDomainsPanel from '../../../components/TopDomainsPanel.astro';

const { id } = Astro.params;

// Fast fetch — needed for initial render
const { data: profile } = await nextdnsFetch<{ data: { id: string; name: string } }>(
  `/profiles/${id}`
);
---

<html>
  <head><title>{profile.name} — Dashboard</title></head>
  <body>
    <!-- Renders immediately (fast) -->
    <h1>{profile.name}</h1>
    <p>Profile ID: {id}</p>

    <!-- Deferred: rendered after initial HTML is sent -->
    <section>
      <h2>Query Status</h2>
      <AnalyticsPanel server:defer profileId={id} from="-7d">
        <!-- Fallback slot: shown while the island loads -->
        <div slot="fallback" aria-live="polite" role="status">
          Loading analytics…
        </div>
      </AnalyticsPanel>
    </section>

    <section>
      <h2>Top Blocked Domains</h2>
      <TopDomainsPanel server:defer profileId={id} from="-7d">
        <div slot="fallback" aria-live="polite" role="status">
          Loading top domains…
        </div>
      </TopDomainsPanel>
    </section>
  </body>
</html>
```

### Top domains panel component

```astro
---
// ✅ src/components/TopDomainsPanel.astro
import { nextdnsFetch } from '../lib/nextdns';

interface Props {
  profileId: string;
  from?: string;
}

const { profileId, from = '-7d' } = Astro.props;

const res = await nextdnsFetch<{
  data: Array<{ domain: string; queries: number }>;
}>(`/profiles/${profileId}/analytics/domains?status=blocked&from=${from}&limit=10`);

const domains = res.data;
---

<table>
  <thead>
    <tr>
      <th scope="col">Domain</th>
      <th scope="col">Blocked queries</th>
    </tr>
  </thead>
  <tbody>
    {domains.map((d) => (
      <tr>
        <td>{d.domain}</td>
        <td>{d.queries.toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Multiple deferred islands with different time ranges

```astro
---
// ✅ Defer multiple panels independently — they load in parallel
const { id } = Astro.params;
---

<!-- All three islands fetch in parallel on the server -->
<AnalyticsPanel server:defer profileId={id} from="-1h">
  <p slot="fallback" aria-live="polite">Loading 1h stats…</p>
</AnalyticsPanel>

<AnalyticsPanel server:defer profileId={id} from="-24h">
  <p slot="fallback" aria-live="polite">Loading 24h stats…</p>
</AnalyticsPanel>

<AnalyticsPanel server:defer profileId={id} from="-7d">
  <p slot="fallback" aria-live="polite">Loading 7d stats…</p>
</AnalyticsPanel>
```

## Enabling server islands in Astro config

```javascript
// ✅ astro.config.mjs — server:defer requires SSR
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  // Server islands require output: 'server' or 'hybrid'
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
```

For `output: 'hybrid'` (static by default), add `export const prerender = false` to pages that use
server islands.

## Do NOT Use

```astro
---
// ❌ Do NOT call api.nextdns.io from a React island (client-side)
// src/components/react/AnalyticsPanel.tsx
import { useEffect } from 'react';
useEffect(() => {
  fetch('https://api.nextdns.io/profiles/abc123/analytics/status', {
    headers: { 'X-Api-Key': import.meta.env.PUBLIC_KEY }, // ❌ Key exposed
  });
}, []);
---

<!-- ❌ Missing fallback slot — page shows blank area while loading -->
<AnalyticsPanel server:defer profileId={id} />
<!-- ❌ No fallback: users see empty space with no loading indication -->
```

## Performance benefits

| Approach | TTFB | Analytics visible | Layout shift |
|----------|------|------------------|--------------|
| Without server:defer | Slow (waits for all analytics) | At load | None |
| With server:defer | Fast (profile renders instantly) | ~1–3s later | Minimal (fallback placeholder) |

## Best practices

- **Always provide a `fallback` slot**: Without a fallback, users see blank space while the island
  loads, which is disorienting.
- **Use `aria-live="polite"` on fallbacks**: Screen readers announce when the content updates.
- **Defer only the slow panels**: Panels backed by fast API calls (profile name, basic settings) do
  not need `server:defer`.
- **Keep island components focused**: Each server island should fetch exactly the data it needs —
  avoid over-fetching inside a deferred component.

## Troubleshooting

### Issue: `server:defer` has no effect — analytics still block page load

**Symptoms**: The page load time is unchanged after adding `server:defer`.

**Solution**: Confirm `output: 'server'` or `output: 'hybrid'` is set in `astro.config.mjs`. Server
Islands require an SSR runtime — they are not available in `output: 'static'` mode.

### Issue: fallback slot is never shown

**Symptoms**: The deferred content appears to load synchronously.

**Solution**: This is expected if the server-side fetch is fast (under ~200ms). Add a small
artificial delay in development to see the fallback: `await new Promise(r => setTimeout(r, 1000))`.
Remove before deploying.

## Reference

- [Astro — Server Islands](https://docs.astro.build/en/guides/server-islands/)
- [Astro — On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [NextDNS API — Analytics](https://nextdns.github.io/api/#analytics)
