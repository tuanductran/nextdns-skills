---
title: 'Log Streaming via SSE (SvelteKit)'
impact: MEDIUM
impactDescription:
  'Opening the NextDNS log stream directly from the browser exposes the API key; streaming must be
  proxied through a SvelteKit +server.ts route'
type: capability
tags:
  - logs
  - streaming
  - sse
  - server-sent events
  - readable stream
  - real-time
---

<!-- @case-police-ignore Api -->

# Log streaming via sse SvelteKit

Proxy the NextDNS real-time log stream through a SvelteKit `+server.ts` route and consume it in a
Svelte component

## Overview

The NextDNS API exposes a Server-Sent Events (SSE) stream at `/logs/stream`. The API key must be
added on the server side. A SvelteKit `+server.ts` route proxies the upstream SSE stream as a
`ReadableStream` response. The Svelte component connects to the SvelteKit route (no key in URL) and
parses incoming `data:` events.

## Correct usage

### Sse proxy route

```typescript
// ✅ src/routes/api/profiles/[id]/logs/stream/+server.ts
import { NEXTDNS_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  if (!NEXTDNS_API_KEY) error(500, 'NEXTDNS_API_KEY is not configured');

  const upstream = await fetch(`https://api.nextdns.io/profiles/${params.id}/logs/stream`, {
    headers: {
      'X-Api-Key': NEXTDNS_API_KEY,
      Accept: 'text/event-stream',
    },
  });

  if (!upstream.ok) error(upstream.status, 'Failed to connect to log stream');
  if (!upstream.body) error(502, 'No response body from upstream');

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
```

### Svelte component consuming sse

```svelte
<!-- ✅ src/routes/profiles/[id]/logs/+page.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';

  let { data } = $props<{ data: { profileId: string } }>();

  let logs = $state<string[]>([]);
  let es: EventSource | null = null;

  function connect() {
    es = new EventSource(`/api/profiles/${data.profileId}/logs/stream`);

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        logs = [JSON.stringify(entry), ...logs.slice(0, 199)];
      } catch {
        // skip malformed events
      }
    };

    es.onerror = () => {
      es?.close();
      // Reconnect after 3 s
      setTimeout(connect, 3000);
    };
  }

  connect();

  onDestroy(() => es?.close());
</script>

<h1>Live Logs</h1>

<ul>
  {#each logs as entry (entry)}
    <li><code>{entry}</code></li>
  {/each}
</ul>
```

## Do NOT Use

```svelte
<!-- ❌ Never open an EventSource directly to api.nextdns.io from Svelte components -->
<script>
  const es = new EventSource(
    `https://api.nextdns.io/profiles/${id}/logs/stream?apikey=YOUR_API_KEY`, // ❌ Key in URL
  );
</script>
```

## Best practices

- **Pipe the upstream body**: Pass `upstream.body` directly to `new Response()` to avoid buffering
  the entire stream in memory.
- **Reconnect on error**: `EventSource` auto-reconnects but not always reliably. Add a manual
  `setTimeout` fallback in `onerror`.
- **`onDestroy` cleanup**: Always close the `EventSource` when the Svelte component is destroyed to
  prevent memory leaks.
- **Limit buffer size**: Cap the `logs` array (for example, last 200 entries) to avoid unbounded memory
  growth in long-running sessions.

## Troubleshooting

### Issue: stream closes immediately after connection

**Symptoms**: `onerror` fires within 1 second, no log entries appear.

**Solution**: Check that the upstream request headers include `Accept: text/event-stream`. Some
platforms (for example, Cloudflare Workers) buffer SSE responses — use the streaming adapter.

### Issue: `eventsource` is NOT defined (ssr)

**Symptoms**: Build or hydration error referencing `EventSource`.

**Solution**: `EventSource` is browser-only. Wrap the call in `onMount` or ensure it only runs in
the browser:

```typescript
import { browser } from '$app/environment';
if (browser) connect();
```

## Reference

- [SvelteKit — +server.js (API Routes)](https://kit.svelte.dev/docs/routing#server)
- [MDN — EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#logs)
