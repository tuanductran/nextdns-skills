---
title: "Logs Streaming"
impact: "HIGH"
impactDescription: "Stream DNS logs in real-time using Server-Sent Events"
type: "capability"
tags: "SSE, real-time, streaming, Server-sent events, live logs, EventSource"
---
# Logs Streaming

**Impact: HIGH** - Stream DNS logs in real-time using Server-Sent Events (SSE)

## Endpoint

```http
GET /profiles/:profile/logs/stream
```

## Basic Usage

```javascript
const eventSource = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream',
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY'
    }
  }
);

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log('New DNS query:', log);
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

## Event Format

Each event contains:

```javascript
// Event
id: 64v32d9r6rwkcctg6cu38e9g60
data: {"timestamp":"2021-03-16T04:40:30.344Z","domain":"g.whatsapp.net","root":"whatsapp.net","encrypted":true,"protocol":"DNS-over-HTTPS","clientIp":"2a01:e0a:2cd:87a0:5540:d573:57cd:aa1d","client":"apple-profile","device":{"id":"8TD1G","name":"Romain's iPhone","model":"iPhone 12 Pro Max"},"status":"default","reasons":[]}
```

## Resume from Last Event

Use the `id` parameter to resume from where you left off:

```javascript
const lastEventId = '64v32d9r6rwkcctg6cu38e9g60';

const eventSource = new EventSource(
  `https://api.nextdns.io/profiles/abc123/logs/stream?id=${lastEventId}`,
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY'
    }
  }
);
```

## Stitch Recent Logs with Stream

Get the stream ID from the regular logs endpoint:

```javascript
// 1. Get recent logs
const recentLogs = await fetch(
  'https://api.nextdns.io/profiles/abc123/logs?limit=100',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// 2. Get stream ID from metadata
const streamId = recentLogs.meta.stream.id;

// 3. Start streaming from that ID
const eventSource = new EventSource(
  `https://api.nextdns.io/profiles/abc123/logs/stream?id=${streamId}`,
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY'
    }
  }
);

// Now you have all recent logs + new logs without duplicates or gaps
```

## Query Parameters

All parameters from `/logs` endpoint are supported except:

- `from` (not applicable for streaming)
- `to` (not applicable for streaming)
- `sort` (always newest first)
- `limit` (streams continuously)
- `cursor` (use `id` instead)

### Supported Parameters

```javascript
// Filter by device
const url = new URL('https://api.nextdns.io/profiles/abc123/logs/stream');
url.searchParams.set('device', '8TD1G');

// Filter by status
url.searchParams.set('status', 'blocked');

// Search for domain
url.searchParams.set('search', 'facebook');

// Raw logs
url.searchParams.set('raw', '1');

const eventSource = new EventSource(url.toString(), {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Complete Example - React

```javascript
import { useEffect, useState } from 'react';

function LogsStream({ profileId, apiKey }) {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = new URL(`https://api.nextdns.io/profiles/${profileId}/logs/stream`);
    
    const eventSource = new EventSource(url.toString(), {
      headers: {
        'X-API-Key': apiKey
      }
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Stream connected');
    };

    eventSource.onmessage = (event) => {
      const log = JSON.parse(event.data);
      setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [profileId, apiKey]);

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            {log.timestamp} - {log.domain} - {log.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Complete Example - Node.js

```javascript
import EventSource from 'eventsource';

function streamLogs(profileId, apiKey, options = {}) {
  const url = new URL(`https://api.nextdns.io/profiles/${profileId}/logs/stream`);
  
  // Add filters
  if (options.device) url.searchParams.set('device', options.device);
  if (options.status) url.searchParams.set('status', options.status);
  if (options.search) url.searchParams.set('search', options.search);
  if (options.id) url.searchParams.set('id', options.id);
  
  const eventSource = new EventSource(url.toString(), {
    headers: {
      'X-API-Key': apiKey
    }
  });

  eventSource.onopen = () => {
    console.log('Stream connected');
  };

  eventSource.onmessage = (event) => {
    const log = JSON.parse(event.data);
    
    // Process log
    if (log.status === 'blocked') {
      console.log(`Blocked: ${log.domain}`);
    }
    
    // Store last event ID for resuming
    if (event.lastEventId) {
      // Save to database or file
      saveLastEventId(event.lastEventId);
    }
  };

  eventSource.onerror = (error) => {
    console.error('Stream error:', error);
    
    // Reconnect with last known ID
    const lastId = getLastEventId();
    if (lastId) {
      setTimeout(() => {
        streamLogs(profileId, apiKey, { ...options, id: lastId });
      }, 5000);
    }
  };

  return eventSource;
}

// Usage
const stream = streamLogs('abc123', process.env.NEXTDNS_API_KEY, {
  status: 'blocked'
});

// Stop streaming
// stream.close();
```

## Filtering Blocked Domains

```javascript
const eventSource = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?status=blocked',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  
  console.log(`Blocked: ${log.domain}`);
  console.log(`Reasons: ${log.reasons.map(r => r.name).join(', ')}`);
};
```

## Monitor Specific Device

```javascript
const eventSource = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?device=8TD1G',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log(`Device query: ${log.domain}`);
};
```

## Error Handling and Reconnection

```javascript
function createReconnectingStream(profileId, apiKey, options = {}) {
  let eventSource;
  let lastEventId = options.id;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;

  function connect() {
    const url = new URL(`https://api.nextdns.io/profiles/${profileId}/logs/stream`);
    if (lastEventId) url.searchParams.set('id', lastEventId);
    
    eventSource = new EventSource(url.toString(), {
      headers: { 'X-API-Key': apiKey }
    });

    eventSource.onopen = () => {
      console.log('Stream connected');
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event) => {
      lastEventId = event.lastEventId;
      const log = JSON.parse(event.data);
      
      // Your log processing here
      console.log(log);
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      eventSource.close();
      
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(connect, delay);
      }
    };
  }

  connect();

  return {
    close: () => eventSource?.close()
  };
}
```

## Do NOT Use

```javascript
// ❌ Using fetch instead of EventSource
fetch('https://api.nextdns.io/profiles/abc123/logs/stream')

// ❌ Not handling reconnection
eventSource.onerror = () => {}  // Stream will die

// ❌ Not saving last event ID
// You'll miss events during reconnection

// ✅ Correct
const eventSource = new EventSource(url);
eventSource.onmessage = (event) => {
  saveLastEventId(event.lastEventId);
};
```

## Browser Compatibility

EventSource is supported in all modern browsers. For older browsers or Node.js, use:

```bash
pnpm install eventsource
```

```javascript
import EventSource from 'eventsource';
```

## Reference

- [NextDNS API - Streaming](https://nextdns.github.io/api/#streaming)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
