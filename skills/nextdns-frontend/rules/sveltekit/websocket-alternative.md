---
title: 'SSE Alternatives: Polling and Long-Polling'
impact: MEDIUM
impactDescription: 'On platforms that buffer SSE responses (Cloudflare Workers, some edge runtimes), the real-time log stream never reaches the browser without an alternative strategy'
type: capability
tags:
  - polling
  - long-polling
  - sveltekit
  - cloudflare
  - edge
  - real-time
  - streaming alternative
  - sse fallback
---

<!-- @case-police-ignore Api -->

# SSE alternatives: polling and long-polling

Implement polling-based log fetching for platforms where SSE streaming is not supported

## Overview

Server-Sent Events (SSE) require long-lived HTTP connections. Some deployment platforms buffer
responses before forwarding them to the client:

- **Cloudflare Workers** (default): buffers responses unless you use `TransformStream`
- **Vercel Edge Functions**: 30-second request timeout limits SSE duration
- **Some shared hosting**: does not support chunked transfer encoding

When SSE is not viable, the alternative is **polling**: the client calls `GET /api/profiles/{id}/logs`
on a regular interval and displays the freshest data. For near-real-time results, use **short
intervals** (5–10 seconds). For less time-sensitive dashboards, use longer intervals (30–60 seconds).

## Polling implementation

### SvelteKit API route — logs endpoint

```typescript
// ✅ src/routes/api/profiles/[id]/logs/+server.ts
import { json, error } from '@sveltejs/kit';
import { nextdnsFetch } from '$lib/server/nextdns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
  const limit = url.searchParams.get('limit') ?? '50';
  const cursor = url.searchParams.get('cursor');

  try {
    const params_obj = new URLSearchParams({ limit, sort: 'desc' });
    if (cursor) params_obj.set('cursor', cursor);

    const data = await nextdnsFetch(
      `/profiles/${params.id}/logs?${params_obj}`
    );
    return json(data);
  } catch (err) {
    error(502, { message: (err as Error).message });
  }
};
```

### Svelte component — polling with setInterval

```svelte
<!-- ✅ src/routes/profiles/[id]/logs/+page.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  interface LogEntry {
    timestamp: string;
    domain: string;
    status: 'default' | 'blocked' | 'allowed' | 'error';
    encrypted: boolean;
    protocol: string;
  }

  let logs = $state<LogEntry[]>([]);
  let cursor = $state<string | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  const POLL_INTERVAL_MS = 10_000; // 10 seconds

  async function fetchLatestLogs() {
    isLoading = true;
    error = null;

    try {
      const params = new URLSearchParams({ limit: '50' });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(
        `/api/profiles/${data.profileId}/logs?${params}`
      );

      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        throw new Error(message ?? `HTTP ${res.status}`);
      }

      const json = await res.json();

      // Prepend new entries (newest-first display)
      const newLogs: LogEntry[] = json.data ?? [];
      logs = [...newLogs, ...logs].slice(0, 500);

      // Save cursor for next poll to avoid re-fetching old entries
      cursor = json.meta?.stream?.id ?? null;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }

  // Initial fetch
  fetchLatestLogs();

  // Set up polling
  const intervalId = setInterval(fetchLatestLogs, POLL_INTERVAL_MS);

  onDestroy(() => clearInterval(intervalId));
</script>

<div>
  <div>
    {#if isLoading}
      <span aria-live="polite" role="status">⟳ Refreshing…</span>
    {:else}
      <span>Auto-refresh every {POLL_INTERVAL_MS / 1000}s</span>
    {/if}

    {#if error}
      <p class="text-red-500">{error}</p>
    {/if}
  </div>

  <ul>
    {#each logs as log (log.timestamp + log.domain)}
      <li>
        <span>{log.timestamp}</span>
        <span class:text-red-500={log.status === 'blocked'}>{log.status}</span>
        <span>{log.domain}</span>
      </li>
    {/each}
  </ul>
</div>
```

## Cloudflare Workers SSE (with TransformStream)

If you need true SSE on Cloudflare Workers, use `TransformStream` to prevent response buffering:

```typescript
// ✅ src/routes/api/profiles/[id]/logs/stream/+server.ts
// Cloudflare Workers-compatible SSE using TransformStream
import { NEXTDNS_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const upstream = await fetch(
    `https://api.nextdns.io/profiles/${params.id}/logs/stream`,
    { headers: { 'X-Api-Key': NEXTDNS_API_KEY } }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream error', { status: 502 });
  }

  // TransformStream prevents Cloudflare from buffering the response
  const { readable, writable } = new TransformStream();
  upstream.body.pipeTo(writable);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      // Cloudflare-specific: disable response buffering
      'X-Accel-Buffering': 'no',
    },
  });
};
```

## Choosing between polling and SSE

| Aspect | Polling | SSE |
|--------|---------|-----|
| Platform support | Universal | Requires streaming runtime |
| Latency | ~10s | ~1s |
| Server load | Higher (per-interval requests) | Lower (one persistent connection) |
| Implementation complexity | Low | Medium |
| Good for | Edge runtimes, simple dashboards | Real-time log viewers |

## Best practices

- **Use `from=-5m` on the first poll** to show recent data without fetching the entire log history.
- **Use the `stream.id` from log responses** as the cursor for subsequent polls to avoid duplicate
  entries.
- **Show a clear "last updated" timestamp** to let users know when data was last refreshed.
- **Implement manual refresh button**: Let users trigger an immediate refresh without waiting for
  the interval.

## Reference

- [NextDNS API — Logs](https://nextdns.github.io/api/#logs)
- [SvelteKit — Server Routes](https://kit.svelte.dev/docs/routing#server)
- [Cloudflare Workers — Streaming](https://developers.cloudflare.com/workers/examples/streaming-responses/)
