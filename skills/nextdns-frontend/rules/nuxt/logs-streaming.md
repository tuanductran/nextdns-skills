---
title: 'Real-Time Log Streaming'
impact: HIGH
impactDescription:
  'Connecting EventSource directly to api.nextdns.io from the browser exposes the API key in every
  SSE request URL or header'
type: capability
tags:
  - logs
  - streaming
  - sse
  - event source
  - real-time
  - server-sent events
---

<!-- @case-police-ignore Api -->

# Real-time log streaming

Proxy the NextDNS SSE log stream through a Nuxt server route and consume it in Vue

## Overview

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from
the browser because SSE via `EventSource` does not support custom headers. The solution is a Nuxt
server route that opens the upstream SSE connection (with the key server-side) and pipes the stream
to the browser.

```text
Browser EventSource → /api/logs/stream (Nuxt) → api.nextdns.io/logs/stream (X-Api-Key)
```

## Correct usage

### Server route — sse proxy

```typescript
// ✅ server/api/logs/stream.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const profileId = query.profileId as string;

  if (!profileId) throw createError({ statusCode: 400, message: 'profileId required' });

  // Set SSE response headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Open upstream SSE connection with the API key
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': config.nextdnsApiKey },
  });

  if (!upstream.body) throw createError({ statusCode: 502, message: 'No stream body' });

  // Pipe the upstream stream directly to the browser response
  return sendStream(event, upstream.body);
});
```

### Vue composable — consume sse

```typescript
// ✅ app/composables/useLogStream.ts
import type { Ref } from 'vue';

export interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

export function useLogStream(profileId: Ref<string>) {
  const logs = ref<LogEntry[]>([]);
  const connected = ref(false);
  let source: EventSource | null = null;

  function connect() {
    if (source) source.close();

    source = new EventSource(`/api/logs/stream?profileId=${profileId.value}`);

    source.onopen = () => {
      connected.value = true;
    };

    source.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        logs.value.unshift(entry); // newest first
        if (logs.value.length > 500) logs.value.pop(); // cap at 500 entries
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      connected.value = false;
      source?.close();
    };
  }

  function disconnect() {
    source?.close();
    source = null;
    connected.value = false;
  }

  // Reconnect when profile changes
  watch(profileId, connect, { immediate: true });

  onUnmounted(disconnect);

  return { logs, connected, connect, disconnect };
}
```

### Log stream page

```vue
<!-- ✅ app/pages/profiles/[id]/logs.vue -->
<script setup lang="ts">
const route = useRoute();
const profileId = computed(() => route.params.id as string);
const { logs, connected } = useLogStream(profileId);
</script>

<template>
  <div>
    <p>Status: {{ connected ? '🟢 Live' : '🔴 Disconnected' }}</p>
    <ul>
      <li v-for="log in logs" :key="log.timestamp + log.domain">
        <span>{{ log.timestamp }}</span>
        <span :class="log.status === 'blocked' ? 'text-red-500' : 'text-green-500'">
          {{ log.status }}
        </span>
        <span>{{ log.domain }}</span>
      </li>
    </ul>
  </div>
</template>
```

## Do NOT Use

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
);

// ❌ Polling /api/logs every second instead of using SSE — wasteful and laggy
setInterval(() => fetchLogs(), 1000);
```

## Best practices

- **Cap the in-memory log buffer**: SSE delivers logs continuously; limit the array to prevent
  unbounded memory growth (500 entries is a good default).
- **Handle reconnection**: `EventSource` auto-reconnects on disconnect, but implement a manual
  reconnect UI for when the user navigates away and returns.
- **Use the `id` field to resume streams**: The `/logs/stream` endpoint supports an `id` query param
  to resume from the last received event — pass `event.lastEventId` when reconnecting.

## Troubleshooting

### Issue: stream connects but no events arrive

**Symptoms**: `EventSource` opens successfully but no `onmessage` events fire.

**Solution**: Verify the upstream NextDNS SSE connection is healthy by testing the server route
directly:

```bash
curl -N "http://localhost:3000/api/logs/stream?profileId=abc123"
```

### Issue: `sendstream` is NOT defined

**Solution**: `sendStream` is a Nuxt H3 utility. Ensure you are using Nuxt 4.x and import is
resolved automatically in server routes.

## Reference

- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)
- [Nuxt 4 — sendStream (H3)](https://h3.unjs.io/utils/response#sendstreamevent-stream)
- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
