---
title: 'Rate Limiting and Retry Strategy'
impact: MEDIUM
impactDescription: 'Without proper retry logic, transient API errors cause permanent failures in automation scripts and dashboards'
type: efficiency
tags:
  - rate limiting
  - retry
  - exponential backoff
  - error recovery
  - resilience
  - 429
  - 500
---

<!-- @case-police-ignore Api -->

# Rate limiting and retry strategy

Implement resilient API calls with exponential backoff to handle transient errors gracefully

## Overview

The NextDNS API enforces rate limits and occasionally returns transient server errors (HTTP 429 and
HTTP 500). Scripts that call the API in tight loops — such as syncing profiles, bulk log analysis,
or real-time dashboards — must implement retry logic with exponential backoff to avoid permanent
failures from temporary issues.

Key behaviours to handle:

- **429 Too Many Requests** — you have exceeded the rate limit; wait before retrying.
- **500 Internal Server Error** — transient upstream error; safe to retry with backoff.
- **400 / 404 / 422** — permanent client errors; never retry these automatically.

## Correct usage

### Retry utility with exponential backoff

```javascript
// ✅ Generic retry wrapper for NextDNS API calls
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const PERMANENT_ERROR_STATUS = new Set([400, 401, 403, 404, 422]);

async function nextdnsApiFetch(url, options = {}, maxRetries = 4) {
  const headers = {
    'X-Api-Key': process.env.NEXTDNS_API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    // Permanent client errors — do not retry
    if (PERMANENT_ERROR_STATUS.has(response.status)) {
      const detail = data?.errors?.[0]?.detail ?? response.statusText;
      throw new Error(`[${response.status}] ${detail}`);
    }

    // User errors in 200 response — do not retry
    if (data.errors?.length) {
      const detail = data.errors[0].detail ?? data.errors[0].code;
      throw new Error(`[API Error] ${detail}`);
    }

    // Success
    if (response.ok) return data;

    // Retryable error
    if (RETRYABLE_STATUS.has(response.status) && attempt < maxRetries) {
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 30_000);
      console.warn(`Attempt ${attempt + 1} failed (${response.status}). Retrying in ${Math.round(delay)}ms…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    throw new Error(`[${response.status}] ${response.statusText}`);
  }
}
```

### TypeScript version

```typescript
// ✅ Typed retry utility
const RETRYABLE: ReadonlySet<number> = new Set([429, 500, 502, 503, 504]);
const PERMANENT: ReadonlySet<number> = new Set([400, 401, 403, 404, 422]);

interface ApiError {
  code: string;
  detail?: string;
  source?: { parameter?: string; pointer?: string };
}

class NextDNSApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: ApiError[]
  ) {
    super(message);
    this.name = 'NextDNSApiError';
  }
}

async function nextdnsFetch<T>(
  path: string,
  options?: RequestInit,
  maxRetries = 4
): Promise<T> {
  const apiKey = process.env.NEXTDNS_API_KEY;
  if (!apiKey) throw new Error('NEXTDNS_API_KEY is not set');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(`https://api.nextdns.io${path}`, {
      ...options,
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    const json = await res.json().catch(() => ({})) as { data?: T; errors?: ApiError[] };

    if (PERMANENT.has(res.status)) {
      throw new NextDNSApiError(json.errors?.[0]?.detail ?? res.statusText, res.status, json.errors);
    }

    if (json.errors?.length) {
      throw new NextDNSApiError(json.errors[0].detail ?? json.errors[0].code, res.status, json.errors);
    }

    if (res.ok) return json as T;

    if (RETRYABLE.has(res.status) && attempt < maxRetries) {
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 30_000);
      await new Promise<void>((r) => setTimeout(r, delay));
      continue;
    }

    throw new NextDNSApiError(res.statusText, res.status);
  }

  throw new NextDNSApiError('Max retries exceeded', 0);
}
```

### Respect `Retry-After` header

```javascript
// ✅ Honour the Retry-After header from 429 responses
async function fetchWithRespectfulBackoff(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : 60_000; // Default: 1 minute

    console.warn(`Rate limited. Waiting ${waitMs / 1000}s before retry.`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    // Retry once after honouring the header
    return fetch(url, options);
  }

  return response;
}
```

## Do NOT Use

```javascript
// ❌ Retrying all errors including permanent client errors
async function naiveRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res.json();
      // ❌ Retries 400/404 errors — they will never succeed
    } catch {
      // ❌ Swallows the reason for failure
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

// ❌ Fixed delay instead of exponential backoff — hammers the API
for (let i = 0; i < 5; i++) {
  await fetch(url, options);
  await new Promise(r => setTimeout(r, 1000)); // ❌ Always 1s, not exponential
}

// ❌ No jitter — synchronized retries from multiple clients worsen congestion
const delay = 1000 * 2 ** attempt; // ❌ Add Math.random() * 500 for jitter
```

## Best practices

- **Retry only idempotent requests**: GET, DELETE, and PATCH with the same payload are safe to
  retry. Retrying a POST that creates a resource may create duplicates — check for 409 Conflict
  before retrying POST.
- **Log all retry attempts**: Include attempt number, status code, and delay in logs to detect
  systematic rate limit issues.
- **Cap maximum delay at 30 seconds**: Exponential backoff grows quickly — cap it to avoid
  indefinite hangs in scheduled tasks.
- **Set a global request timeout**: Wrap `fetch` in an `AbortController` with a 10-second timeout
  to prevent requests from hanging indefinitely.

## Troubleshooting

### Issue: systematic 429 errors in bulk scripts

**Symptoms**: Scripts processing many profiles hit 429 repeatedly.

**Solution**: Add deliberate inter-request delays (100–300ms) between sequential API calls in loops:

```javascript
for (const profileId of profileIds) {
  await processProfile(profileId);
  await new Promise(r => setTimeout(r, 200)); // ✅ 200ms pause between calls
}
```

### Issue: random 500 errors that self-resolve

**Symptoms**: Intermittent 500 errors that succeed on the next attempt.

**Solution**: This is expected transient behaviour. The exponential backoff in `nextdnsFetch` above
handles this automatically. Do not alert on single 500 errors — only alert after all retries
exhausted.

## Reference

- [NextDNS API — Error Handling](https://nextdns.github.io/api/#handling-errors)
- [MDN — HTTP 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
