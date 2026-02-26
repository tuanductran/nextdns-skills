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
  - readable stream
  - real-time
  - server-sent events
  - react island
---

<!-- @case-police-ignore Api -->

# Real-Time Log Streaming

Proxy the NextDNS SSE log stream through an Astro API endpoint and consume it in a React island

## Overview

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from
the browser because `EventSource` does not support custom headers. The solution is an Astro API
endpoint that opens the upstream SSE connection (with the key server-side) and returns a
`ReadableStream` to the browser.

```text
Browser EventSource → /api/logs/stream (Astro) → api.nextdns.io/logs/stream (X-Api-Key)
```

## Correct Usage

### Astro API endpoint — SSE proxy

```typescript
// ✅ src/pages/api/logs/stream.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const profileId = url.searchParams.get('profileId');

  if (!profileId) {
    return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400 });
  }

  const apiKey = import.meta.env.NEXTDNS_API_KEY;
  if (!apiKey) return new Response('Server misconfigured', { status: 500 });

  // Open upstream SSE connection with the API key server-side
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to NextDNS stream', { status: 502 });
  }

  // Pipe the upstream ReadableStream directly to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
```

### React island — consume SSE

```tsx
// ✅ src/components/react/LogStream.tsx
import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

interface Props {
  profileId: string;
}

export default function LogStream({ profileId }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/logs/stream?profileId=${profileId}`);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setLogs((prev) => [entry, ...prev].slice(0, 500)); // newest first, cap at 500
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      setConnected(false);
      source.close();
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [profileId]);

  return (
    <div>
      <p>Status: {connected ? '🟢 Live' : '🔴 Disconnected'}</p>
      <ul>
        {logs.map((log) => (
          <li key={`${log.timestamp}-${log.domain}`}>
            <span>{log.timestamp}</span>
            <span style={{ color: log.status === 'blocked' ? 'red' : 'green' }}>{log.status}</span>
            <span>{log.domain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Astro page — embed the stream island

```astro
---
// ✅ src/pages/profiles/[id]/logs.astro
import LogStream from '../../../components/react/LogStream'
const { id } = Astro.params
---

<html>
  <body>
    <h1>Live Logs</h1>
    <!-- client:only ensures EventSource is only created in the browser -->
    <LogStream client:only="react" profileId={id} />
  </body>
</html>
```

> **Why `client:only="react"`?** The `LogStream` component uses `useEffect` and `EventSource`, which
> are browser APIs. `client:only` skips server-side rendering entirely — preventing hydration errors
> from server/client mismatches on the log list.

## Do NOT Use

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
// src/components/react/LogStream.tsx
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
)

// ❌ Missing client directive — EventSource is a browser API, SSR will throw
<LogStream profileId={id} /> // ❌ Crashes on server render
```

## Best Practices

- **Use `client:only="react"` for real-time components**: Components that depend on `EventSource`,
  `WebSocket`, or other browser-only APIs should use `client:only` to skip SSR entirely.
- **Cap the log buffer**: SSE delivers logs continuously; `slice(0, 500)` prevents unbounded memory
  growth in React state.
- **Clean up in `useEffect` return**: Always close `EventSource` on component unmount to avoid
  orphaned server connections.

## Troubleshooting

### Issue: `EventSource` causes a server-side rendering error

**Symptoms**: Build or dev server logs show `EventSource is not defined`.

**Solution**: Use `client:only="react"` instead of `client:load` to ensure the component is never
rendered on the server.

### Issue: Endpoint returns immediately instead of streaming

**Solution**: Verify the upstream fetch returns `Content-Type: text/event-stream`. Test the endpoint
directly:

```bash
curl -N "http://localhost:4321/api/logs/stream?profileId=abc123"
```

## Reference

- [Astro — Endpoints: Streaming](https://docs.astro.build/en/guides/endpoints/)
- [Astro — Client Directives: client:only](https://docs.astro.build/en/reference/directives-reference/#clientonly)
- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)
- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
