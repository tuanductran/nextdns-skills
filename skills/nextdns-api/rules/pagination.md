---
title: 'Pagination'
impact: HIGH
impactDescription: 'Correctly paginate through API responses'
type: capability
tags:
  - pagination
  - cursor
  - limit
  - next page
  - page size
---

# Pagination

Properly paginate through large result sets

## How Pagination Works

Most endpoints that return arrays use cursor-based pagination:

```javascript
{
  "data": [...],
  "meta": {
    "pagination": {
      "cursor": "j2k3zl3b4v"  // null when no more pages
    }
  }
}
```

## Basic Pagination

```javascript
// First page
const response = await fetch('https://api.nextdns.io/profiles/abc123/analytics/domains?limit=50', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' },
});

const data = await response.json();

// Next page
if (data.meta.pagination.cursor) {
  const nextPage = await fetch(
    `https://api.nextdns.io/profiles/abc123/analytics/domains?limit=50&cursor=${data.meta.pagination.cursor}`,
    { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
  );
}
```

## Limit Parameter

Control results per page:

```javascript
// Default limit (varies by endpoint)
limit: 10; // Most analytics endpoints

limit: 100; // Logs endpoint

// Minimum and maximum
limit: 1; // Minimum for analytics
limit: 500; // Maximum for analytics

limit: 10; // Minimum for logs
limit: 1000; // Maximum for logs
```

## Fetch All Pages

```javascript
async function fetchAllPages(url, apiKey) {
  let allData = [];
  let cursor = null;

  do {
    const requestUrl = new URL(url);
    if (cursor) {
      requestUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(requestUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    allData = allData.concat(data.data);
    cursor = data.meta?.pagination?.cursor;
  } while (cursor);

  return allData;
}

// Usage
const allDomains = await fetchAllPages(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d&limit=100',
  process.env.NEXTDNS_API_KEY
);
```

## Fetch with Progress

```javascript
async function fetchAllPagesWithProgress(url, apiKey, onProgress) {
  let allData = [];
  let cursor = null;
  let page = 0;

  do {
    page++;
    const requestUrl = new URL(url);
    if (cursor) {
      requestUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(requestUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    allData = allData.concat(data.data);
    cursor = data.meta?.pagination?.cursor;

    // Report progress
    if (onProgress) {
      onProgress({
        page,
        itemsInPage: data.data.length,
        totalItems: allData.length,
        hasMore: !!cursor,
      });
    }
  } while (cursor);

  return allData;
}

// Usage
const domains = await fetchAllPagesWithProgress(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-30d&limit=100',
  process.env.NEXTDNS_API_KEY,
  (progress) => {
    console.log(`Page ${progress.page}: ${progress.totalItems} items loaded...`);
  }
);
```

## Fetch with Limit

Stop after a certain number of items:

```javascript
async function fetchUpToLimit(url, apiKey, maxItems) {
  let allData = [];
  let cursor = null;

  do {
    const requestUrl = new URL(url);
    if (cursor) {
      requestUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(requestUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    allData = allData.concat(data.data);
    cursor = data.meta?.pagination?.cursor;

    // Stop if we've reached the limit
    if (allData.length >= maxItems) {
      allData = allData.slice(0, maxItems);
      break;
    }
  } while (cursor);

  return allData;
}

// Get top 1000 domains
const top1000 = await fetchUpToLimit(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d&limit=500',
  process.env.NEXTDNS_API_KEY,
  1000
);
```

## Async Iterator

```javascript
async function* paginateEndpoint(url, apiKey) {
  let cursor = null;

  do {
    const requestUrl = new URL(url);
    if (cursor) {
      requestUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(requestUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    yield data.data;

    cursor = data.meta?.pagination?.cursor;
  } while (cursor);
}

// Usage
for await (const page of paginateEndpoint(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d&limit=100',
  process.env.NEXTDNS_API_KEY
)) {
  console.log(`Processing ${page.length} items...`);
  // Process each page
  page.forEach((domain) => {
    console.log(domain.domain, domain.queries);
  });
}
```

## Paginated Endpoints

These endpoints support pagination:

- `/profiles/:profile/analytics/status`
- `/profiles/:profile/analytics/domains`
- `/profiles/:profile/analytics/reasons`
- `/profiles/:profile/analytics/ips`
- `/profiles/:profile/analytics/devices`
- `/profiles/:profile/analytics/protocols`
- `/profiles/:profile/analytics/queryTypes`
- `/profiles/:profile/analytics/ipVersions`
- `/profiles/:profile/analytics/dnssec`
- `/profiles/:profile/analytics/encryption`
- `/profiles/:profile/analytics/destinations`
- `/profiles/:profile/logs`
- `/profiles/:profile/denylist`
- `/profiles/:profile/allowlist`

## Do NOT Use

```javascript
// ❌ Using page numbers
url.searchParams.set('page', '2'); // Not supported

// ❌ Using offset
url.searchParams.set('offset', '100'); // Not supported

// ❌ Hardcoding cursor values
cursor: 'page2'; // Must use cursor from API response

// ❌ Reusing old cursors
const oldCursor = 'abc123'; // Cursors expire

// ✅ Correct - use cursor from response
cursor: data.meta.pagination.cursor;
```

## Cursor Behavior

- **Opaque**: Cursors are opaque strings, don't try to parse or modify them
- **Temporary**: Cursors may expire after some time
- **Null**: `cursor` is `null` when there are no more pages
- **Sequential**: Must request pages in order, can't skip pages

## Performance Tips

1. **Use appropriate page size**: Balance between number of requests and memory usage
2. **Don't fetch all pages** if you only need top results
3. **Cache results** when appropriate
4. **Use streaming** for real-time data instead of polling
5. **Implement rate limiting** to avoid hitting API limits
6. **Handle errors gracefully** and retry failed pages

## Rate Limiting

Be mindful of rate limits when paginating:

```javascript
async function fetchAllPagesWithRateLimit(url, apiKey, delayMs = 100) {
  let allData = [];
  let cursor = null;

  do {
    const requestUrl = new URL(url);
    if (cursor) {
      requestUrl.searchParams.set('cursor', cursor);
    }

    const response = await fetch(requestUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    allData = allData.concat(data.data);
    cursor = data.meta?.pagination?.cursor;

    // Delay between requests
    if (cursor) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  } while (cursor);

  return allData;
}
```

## Reference

- [NextDNS API - Pagination](https://nextdns.github.io/api/#pagination)
