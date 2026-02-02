---
title: "Logs Management"
impact: "HIGH"
impactDescription: "Query, filter, and search DNS logs"
type: "capability"
tags: "logs, filtering, search, raw logs, deduplication, query logs"
---
# Logs Management

**Impact: HIGH** - Query and filter DNS logs for debugging and analysis

## Get Logs

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/logs?from=-1h&limit=100',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

const logs = await response.json();
```

## Query Parameters

### Date Range

```javascript
// Last hour
from: '-1h'

// Last 24 hours
from: '-24h'

// Specific time range
from: '2024-01-15T00:00:00Z'
to: '2024-01-15T23:59:59Z'
```

### Sorting

```javascript
// Newest first (default)
sort: 'desc'

// Oldest first
sort: 'asc'
```

### Pagination

```javascript
// Results per page (10-1000, default: 100)
limit: 100

// Next page
cursor: 'abc123xyz'
```

### Device Filtering

```javascript
// Specific device
device: '8TD1G'

// All unidentified devices
device: '__UNIDENTIFIED__'
```

### Status Filtering

```javascript
// Only blocked queries
status: 'blocked'

// Only allowed queries
status: 'allowed'

// Default (not blocked or allowed)
status: 'default'

// Errors
status: 'error'
```

### Search

```javascript
// Search for domain
search: 'facebook'  // Matches facebook.com, facebook.hello.com, etc.

// Search for specific domain
search: 'facebook.com'
```

### Raw Logs

```javascript
// Deduplicated, navigational queries only (default)
raw: false

// All DNS queries, no deduplication
raw: true
```

## Response Format

```javascript
{
  "data": [
    {
      "timestamp": "2021-03-18T03:00:10.338Z",
      "domain": "21-courier.push.apple.com",
      "root": "apple.com",
      "tracker": "apple",
      "encrypted": true,
      "protocol": "DNS-over-HTTPS",
      "clientIp": "2a01:e0a:2cd:87a0:1b23:2832:57cd:aa1d",
      "client": "apple-profile",
      "device": {
        "id": "8TD1G",
        "name": "Romain's iPhone",
        "model": "iPhone 12 Pro Max"
      },
      "status": "default",
      "reasons": []
    },
    {
      "timestamp": "2021-03-18T02:56:14.182Z",
      "domain": "sb.scorecardresearch.com",
      "root": "scorecardresearch.com",
      "tracker": "scorecard_research_beacon",
      "encrypted": false,
      "protocol": "UDP",
      "clientIp": "91.172.51.28",
      "status": "blocked",
      "reasons": [
        {
          "id": "blocklist:nextdns-recommended",
          "name": "NextDNS Ads & Trackers Blocklist"
        },
        {
          "id": "blocklist:oisd",
          "name": "oisd"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "cursor": "next_page_cursor"
    },
    "stream": {
      "id": "64v32d9r6rwkcctg6cu38e9g60"
    }
  }
}
```

## Complete Example

```javascript
async function getLogs(profileId, options = {}) {
  const url = new URL(`https://api.nextdns.io/profiles/${profileId}/logs`);
  
  // Date range
  if (options.from) url.searchParams.set('from', options.from);
  if (options.to) url.searchParams.set('to', options.to);
  
  // Filtering
  if (options.device) url.searchParams.set('device', options.device);
  if (options.status) url.searchParams.set('status', options.status);
  if (options.search) url.searchParams.set('search', options.search);
  
  // Options
  if (options.sort) url.searchParams.set('sort', options.sort);
  if (options.raw !== undefined) url.searchParams.set('raw', options.raw ? '1' : '0');
  
  // Pagination
  if (options.limit) url.searchParams.set('limit', options.limit.toString());
  if (options.cursor) url.searchParams.set('cursor', options.cursor);
  
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.NEXTDNS_API_KEY }
  });
  
  return response.json();
}

// Usage examples
const blockedLogs = await getLogs('abc123', {
  status: 'blocked',
  from: '-24h',
  limit: 100
});

const deviceLogs = await getLogs('abc123', {
  device: '8TD1G',
  from: '-1h'
});

const searchLogs = await getLogs('abc123', {
  search: 'google',
  from: '-7d'
});

const rawLogs = await getLogs('abc123', {
  raw: true,
  from: '-1h',
  limit: 1000
});
```

## Paginate Through All Logs

```javascript
async function getAllLogs(profileId, options = {}) {
  let allLogs = [];
  let cursor = null;
  
  do {
    const response = await getLogs(profileId, {
      ...options,
      cursor,
      limit: 1000  // Max per request
    });
    
    allLogs = allLogs.concat(response.data);
    cursor = response.meta?.pagination?.cursor;
  } while (cursor);
  
  return allLogs;
}

// Get all blocked logs from last 24 hours
const allBlocked = await getAllLogs('abc123', {
  status: 'blocked',
  from: '-24h'
});
```

## Raw vs Deduplicated Logs

### Deduplicated (default, `raw=false`)

- Only navigational query types (A, AAAA, HTTPS)
- Automatically deduplicated
- Noise filtered out (Chrome random lookups, etc.)
- Clearer overview of network access

### Raw (`raw=true`)

- All DNS queries
- All query types (A, AAAA, CNAME, TXT, MX, etc.)
- No deduplication
- Includes all noise
- Useful for debugging

## Common Use Cases

### Find all blocked domains for a device

```javascript
const blocked = await getLogs('abc123', {
  device: '8TD1G',
  status: 'blocked',
  from: '-24h'
});

const domains = [...new Set(blocked.data.map(log => log.domain))];
```

### Search for specific domain

```javascript
const facebookLogs = await getLogs('abc123', {
  search: 'facebook',
  from: '-7d'
});
```

### Get unidentified device queries

```javascript
const unidentified = await getLogs('abc123', {
  device: '__UNIDENTIFIED__',
  from: '-24h'
});
```

### Debug DNS issues

```javascript
const debugLogs = await getLogs('abc123', {
  raw: true,
  search: 'problematic-domain.com',
  from: '-1h'
});
```

## Do NOT Use

```javascript
// ❌ Limit out of range
limit: 5000  // Max is 1000

// ❌ Invalid status
status: 'deny'  // Use 'blocked'

// ❌ Wrong parameter for raw
raw: 'true'  // Use boolean or '1'/'0'

// ✅ Correct
raw: true
raw: '1'
```

## Performance Tips

1. **Use smaller time ranges** for faster queries
2. **Filter by device** when possible to reduce data
3. **Use status filtering** to narrow results
4. **Start with deduplicated logs** (`raw=false`) for overview
5. **Use raw logs** only when debugging specific issues
6. **Implement pagination** for large result sets
7. **Cache results** when appropriate

## Reference

- [NextDNS API - Logs](https://nextdns.github.io/api/#logs)
