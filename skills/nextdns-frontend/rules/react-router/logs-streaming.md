---
title: 'Log Streaming via SSE (React Router v7)'
impact: MEDIUM
impactDescription:
  'Opening the NextDNS log stream directly from the browser exposes the API key; streaming must be
  proxied through a React Router resource route'
type: capability
tags:
  - logs
  - streaming
  - sse
  - server-sent events
  - resource route
  - readable stream
  - real-time
---

<!-- @case-police-ignore Api -->

# Log Streaming via SSE (React Router v7)

Proxy the NextDNS real-time log stream through a React Router v7 resource route and consume it in a
React component

## Overview

The NextDNS API exposes a Server-Sent Events (SSE) stream at `/logs/stream`. The API key must be
added on the server side. A React Router v7 resource route (a route module without a default
component export) proxies the upstream SSE stream as a `ReadableStream` response. The React
component connects to the local resource route URL and parses incoming `data:` events.

## Correct Usage

### SSE proxy resource route

```typescript
// ✅ app/routes/api.profiles.$id.logs.stream.ts
// No default export = resource route
import { NEXTDNS_API_KEY } from '~/lib/nextdns.server';
import type { Route } from './+types/api.profiles.$id.logs.stream';

// Re-export constant to avoid re-importing everywhere
// app/lib/nextdns.server.ts should export NEXTDNS_API_KEY too
export async function loader({ params }: Route.LoaderArgs) {
  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) {
    return new Response('NEXTDNS_API_KEY is not configured', { status: 500 });
  }

  const upstream = await fetch(`https://api.nextdns.io/profiles/${params.id}/logs/stream`, {
    headers: {
      'X-Api-Key': apiKey,
      Accept: 'text/event-stream',
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to log stream', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### Register the stream route

```typescript
// ✅ app/routes.ts
import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('profiles/:id', 'routes/profiles.$id.tsx'),
  route('api/profiles/:id/logs/stream', 'routes/api.profiles.$id.logs.stream.ts'),
] satisfies RouteConfig;
```

### React component consuming SSE

```typescript
// ✅ app/routes/profiles.$id.logs.tsx
import { useEffect, useRef, useState } from 'react';
import type { Route } from './+types/profiles.$id.logs';

export async function loader({ params }: Route.LoaderArgs) {
  return { profileId: params.id };
}

export default function LogsPage({ loaderData }: Route.ComponentProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource(`/api/profiles/${loaderData.profileId}/logs/stream`);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
          setLogs((prev) => [JSON.stringify(entry), ...prev.slice(0, 199)]);
        } catch {
          // skip malformed events
        }
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => esRef.current?.close();
  }, [loaderData.profileId]);

  return (
    <div>
      <h1>Live Logs</h1>
      <ul>
        {logs.map((entry, i) => (
          <li key={i}>
            <code>{entry}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Do NOT Use

```typescript
// ❌ Never open an EventSource directly to api.nextdns.io from a React component
useEffect(() => {
  const es = new EventSource(
    `https://api.nextdns.io/profiles/${id}/logs/stream?apikey=YOUR_API_KEY` // ❌ Key in URL
  );
}, []);
```

## Best Practices

- **Resource route for SSE proxy**: A route module without a default component export acts as an API
  endpoint — `loader` handles GET (SSE stream) cleanly.
- **Pipe `upstream.body`**: Pass the `ReadableStream` directly to avoid buffering.
- **Cleanup in `useEffect`**: Return a cleanup function that closes the `EventSource` to prevent
  memory leaks on navigation.
- **Cap log buffer**: Limit the `logs` state array to the last 200 entries.

## Troubleshooting

### Issue: Stream closes immediately after opening

**Symptoms**: `onerror` fires within seconds; no log events received.

**Solution**: Verify `Accept: text/event-stream` is sent to the upstream. Also ensure your
deployment platform does not buffer streaming responses (Vercel: use Edge Functions; Cloudflare: set
`Transfer-Encoding: chunked`).

### Issue: `EventSource` causes hydration mismatch

**Solution**: `EventSource` is browser-only. Place the `new EventSource(...)` call inside
`useEffect` (client-only lifecycle) — never call it at module level or during SSR.

## Reference

- [React Router v7 — Resource Routes](https://reactrouter.com/how-to/resource-routes)
- [MDN — EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [NextDNS API — Log Streaming](https://nextdns.github.io/api/#logs)
