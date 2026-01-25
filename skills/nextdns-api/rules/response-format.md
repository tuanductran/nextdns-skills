---
title: Response Format
impact: MEDIUM
impactDescription: Parse API response structure correctly
type: efficiency
tags: response format, data, meta, errors, response structure
---

# Response Format

**Impact: MEDIUM** - Understand and parse API response structure

## Standard Response Format

All API responses with `200` or `400` status follow one of these formats:

### Success Response

```javascript
{
  "data": {...},  // or [...], depending on the endpoint
  "meta": {...}   // optional
}
```

### Error Response

```javascript
{
  "errors": [...]
}
```

## Data Types

### Object Response

Single object endpoints return an object in `data`:

```javascript
// GET /profiles/abc123
{
  "data": {
    "id": "abc123",
    "name": "My Profile",
    "security": {...},
    "privacy": {...}
  }
}

// GET /profiles/abc123/security
{
  "data": {
    "cryptojacking": true,
    "typosquatting": true,
    "tlds": [...]
  }
}
```

### Array Response

List endpoints return an array in `data`:

```javascript
// GET /profiles/abc123/analytics/domains
{
  "data": [
    {
      "domain": "example.com",
      "queries": 1234
    },
    {
      "domain": "google.com",
      "queries": 5678
    }
  ],
  "meta": {
    "pagination": {
      "cursor": "abc123"
    }
  }
}
```

## Meta Section

The `meta` section contains additional information:

### Pagination

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

### Time Series

```javascript
{
  "data": [...],
  "meta": {
    "series": {
      "times": [
        "2021-03-08T16:51:36.623Z",
        "2021-03-09T16:51:36.623Z"
      ],
      "interval": 86400
    },
    "pagination": {
      "cursor": "jS8sl16m"
    }
  }
}
```

### Stream ID

```javascript
{
  "data": [...],
  "meta": {
    "stream": {
      "id": "64v32d9r6rwkcctg6cu38e9g60"
    }
  }
}
```

## Parsing Responses

```javascript
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': process.env.NEXTDNS_API_KEY,
      ...options.headers
    }
  });

  const result = await response.json();

  // Check for errors
  if (result.errors) {
    throw new Error(`API Error: ${JSON.stringify(result.errors)}`);
  }

  // Return data and meta
  return {
    data: result.data,
    meta: result.meta
  };
}

// Usage
const { data, meta } = await makeRequest(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d'
);

console.log('Domains:', data);
console.log('Next cursor:', meta?.pagination?.cursor);
```

## TypeScript Types

```typescript
interface SuccessResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      cursor: string | null;
    };
    series?: {
      times: string[];
      interval: number;
    };
    stream?: {
      id: string;
    };
  };
}

interface ErrorResponse {
  errors: Array<{
    code: string;
    detail: string;
    source: {
      parameter?: string;
      pointer?: string;
    };
  }>;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Usage
async function fetchDomains(profileId: string): Promise<Domain[]> {
  const response = await fetch(
    `https://api.nextdns.io/profiles/${profileId}/analytics/domains`,
    { headers: { 'X-API-Key': process.env.NEXTDNS_API_KEY! } }
  );

  const result: ApiResponse<Domain[]> = await response.json();

  if ('errors' in result) {
    throw new Error(`API Error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

interface Domain {
  domain: string;
  root?: string;
  queries: number;
}
```

## Response Wrapper

```javascript
class NextDNSResponse {
  constructor(response) {
    this.raw = response;
    this.data = response.data;
    this.meta = response.meta;
    this.errors = response.errors;
  }

  hasErrors() {
    return !!this.errors;
  }

  hasMore() {
    return !!this.meta?.pagination?.cursor;
  }

  getNextCursor() {
    return this.meta?.pagination?.cursor;
  }

  getStreamId() {
    return this.meta?.stream?.id;
  }

  getSeriesTimes() {
    return this.meta?.series?.times || [];
  }

  getSeriesInterval() {
    return this.meta?.series?.interval;
  }

  getData() {
    if (this.hasErrors()) {
      throw new Error(`Response has errors: ${JSON.stringify(this.errors)}`);
    }
    return this.data;
  }
}

// Usage
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

const wrapped = new NextDNSResponse(response);

if (wrapped.hasErrors()) {
  console.error('Errors:', wrapped.errors);
} else {
  console.log('Data:', wrapped.getData());
  if (wrapped.hasMore()) {
    console.log('Next cursor:', wrapped.getNextCursor());
  }
}
```

## Common Patterns

### Extract Data

```javascript
const { data } = await fetch(url, { headers }).then(r => r.json());
```

### Extract Data and Cursor

```javascript
const { data, meta } = await fetch(url, { headers }).then(r => r.json());
const cursor = meta?.pagination?.cursor;
```

### Check for Errors

```javascript
const result = await fetch(url, { headers }).then(r => r.json());
if (result.errors) {
  throw new Error('API Error');
}
const data = result.data;
```

## Do NOT Use

```javascript
// ❌ Accessing data directly without checking errors
const response = await fetch(url).then(r => r.json());
const data = response.data;  // Might not exist if there are errors

// ❌ Assuming data is always an array
const items = response.data.map(...);  // Might be an object

// ✅ Correct
const result = await fetch(url).then(r => r.json());
if (result.errors) {
  throw new Error('API Error');
}
const data = result.data;
if (Array.isArray(data)) {
  const items = data.map(...);
}
```

## Reference

- [NextDNS API - Response Format](https://nextdns.github.io/api/#response-format)
