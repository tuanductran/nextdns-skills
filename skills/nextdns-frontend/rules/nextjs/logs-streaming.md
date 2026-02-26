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
---

<!-- @case-police-ignore Api -->

# Real-Time Log Streaming

Proxy the NextDNS SSE log stream through a Next.js Route Handler and consume it in React

## Overview

The NextDNS `/logs/stream` endpoint uses Server-Sent Events (SSE). The API key cannot be sent from
the browser because `EventSource` does not support custom headers. The solution is a Next.js Route
Handler that opens the upstream SSE connection (with the key server-side) and returns a
`ReadableStream` to the browser.

```text
Browser EventSource → /api/logs/stream (Next.js) → api.nextdns.io/logs/stream (X-Api-Key)
```

## Correct Usage

### Route Handler — SSE proxy

```typescript
// ✅ app/api/logs/stream/route.ts
export const dynamic = 'force-dynamic'; // Disable static caching for streaming routes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
    return new Response(JSON.stringify({ error: 'profileId required' }), { status: 400 });
  }

  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) return new Response('Server misconfigured', { status: 500 });

  // Open the upstream SSE connection with the API key
  const upstream = await fetch(`https://api.nextdns.io/profiles/${profileId}/logs/stream`, {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to NextDNS stream', { status: 502 });
  }

  // Pipe the upstream ReadableStream directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### React Client Component — consume SSE

```tsx
// ✅ components/LogStream.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  domain: string;
  status: 'default' | 'blocked' | 'allowed' | 'error';
  reasons: Array<{ id: string; name: string }>;
  encrypted: boolean;
  protocol: string;
}

export default function LogStream({ profileId }: { profileId: string }) {
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
            <span className={log.status === 'blocked' ? 'text-red-500' : 'text-green-500'}>
              {log.status}
            </span>
            <span>{log.domain}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Page — embed the stream component

```tsx
// ✅ app/profiles/[id]/logs/page.tsx — Server Component wrapper
export default async function LogsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Live Logs</h1>
      <LogStream profileId={id} />
    </main>
  );
}
```

## Do NOT Use

```typescript
// ❌ Opening EventSource directly to api.nextdns.io — no way to send X-Api-Key
const source = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?apiKey=YOUR_API_KEY'
  // ❌ API key in URL — visible in browser history, server logs, and network tab
);

// ❌ Polling /api/logs every second instead of using SSE — wasteful and laggy
setInterval(() => fetchLogs(), 1000); // ❌
```

## Best Practices

- **Export `dynamic = 'force-dynamic'`** in the Route Handler: Prevents Next.js from statically
  caching the SSE route at build time.
- **Cap the log buffer**: SSE delivers logs continuously; `slice(0, 500)` prevents unbounded memory
  growth in the React state.
- **Clean up in `useEffect` return**: Always close the `EventSource` on component unmount to avoid
  memory leaks and orphaned server connections.

## Troubleshooting

### Issue: Route Handler returns immediately instead of streaming

**Symptoms**: `EventSource` fires `onerror` immediately; no events arrive.

**Solution**: Ensure `export const dynamic = 'force-dynamic'` is at the top of the Route Handler
file. Also verify the upstream fetch responds with `Content-Type: text/event-stream`.

```bash
# Test the Route Handler directly
curl -N "http://localhost:3000/api/logs/stream?profileId=abc123"
```

### Issue: `upstream.body` is `null`

**Solution**: The `fetch` API on Node.js may return a `null` body for non-OK responses. Always check
`upstream.ok` before accessing `upstream.body`.

## Reference

- [Next.js — Route Handlers: Streaming](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#streaming)
- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
