# NextDNS API Skills

**Version 1.0.0**  
NextDNS Skills  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring NextDNS API integration and management. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Best practices and guidelines for NextDNS API integration and management, ordered by impact.

---

## Table of Contents

1. [Capability rules](#1-capability-rules) — **MEDIUM**
   - 1.1 [Account Management](#11-account-management)
   - 1.2 [Allowlist and Denylist](#12-allowlist-and-denylist)
   - 1.3 [Analytics Endpoints](#13-analytics-endpoints)
   - 1.4 [Analytics Query Parameters](#14-analytics-query-parameters)
   - 1.5 [Authentication](#15-authentication)
   - 1.6 [Date Formats](#16-date-formats)
   - 1.7 [DNS Rewrites](#17-dns-rewrites)
   - 1.8 [Error Handling](#18-error-handling)
   - 1.9 [Logs Clear](#19-logs-clear)
   - 1.10 [Logs Management](#110-logs-management)
   - 1.11 [Logs Streaming](#111-logs-streaming)
   - 1.12 [Nested Endpoints](#112-nested-endpoints)
   - 1.13 [Pagination](#113-pagination)
   - 1.14 [Parental Control](#114-parental-control)
   - 1.15 [Privacy Settings](#115-privacy-settings)
   - 1.16 [Profile Copy and Duplication](#116-profile-copy-and-duplication)
   - 1.17 [Profile Management](#117-profile-management)
   - 1.18 [Profile Settings](#118-profile-settings)
   - 1.19 [Security Settings](#119-security-settings)
   - 1.20 [Time Series Data](#120-time-series-data)
2. [Efficiency rules](#2-efficiency-rules) — **MEDIUM**
   - 2.1 [Logs Download](#21-logs-download)
   - 2.2 [Rate Limiting and Retry Strategy](#22-rate-limiting-and-retry-strategy)
   - 2.3 [Response Format](#23-response-format)

---

## 1. Capability rules

**Impact: MEDIUM**

### 1.1 Account Management

**Impact: MEDIUM (Querying account info and usage quota without this rule causes incorrect dashboard metrics and missing plan limit displays)**

Retrieve account information, usage quota, and profile list for dashboard display

Retrieve account information, usage quota, and profile list for dashboard display

The NextDNS API exposes account-level endpoints that sit above individual profiles. These endpoints

provide your current plan, monthly query usage (for example, "41,734 / 300,000"), the list of all

profiles owned by the account, and basic account metadata. Use these when building a dashboard that

must display billing context or enumerate all available profiles.

- **Always verify profile ownership**: Before acting on a profile ID (from a URL param or form

  input), call `GET /profiles/{id}` to confirm it belongs to the authenticated account.

- **Cache the profile list**: The list changes infrequently. Cache for 60 seconds to avoid

  redundant API calls on every page navigation.

- **Use the profile `name` for display**: The `id` is opaque and short. Use `name` in all UI labels

  and log it alongside `id` for debugging.

- **Handle empty accounts**: A freshly created API key will return an empty `data: []` array from

  `GET /profiles`. Render a "Create your first profile" empty state instead of an error.

**Symptoms**: The API returns `{ "data": [] }` but profiles are visible in the NextDNS dashboard.

**Solution**: Verify you are using the API key that belongs to the same account. API keys are

per-account — a key from a sub-account or a different login will not see profiles owned by another

account.

**Solution**: The `X-Api-Key` header must be present on every request. The key is found at the

bottom of the NextDNS account page: `https://my.nextdns.io/account`.

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)

- [NextDNS Account Page](https://my.nextdns.io/account)

**Correct: Get all profiles**

```javascript
// ✅ List all profiles associated with the account
const response = await fetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
// data: [{ "id": "abc123", "name": "Home Network" }, ...]
```

**Correct:**

```python
# ✅ Python equivalent
import requests

response = requests.get(
    'https://api.nextdns.io/profiles',
    headers={'X-Api-Key': 'YOUR_API_KEY'},
)
profiles = response.json()['data']
```

**Correct: Create a profile**

```javascript
// ✅ Create a new profile (returns the new profile id)
const response = await fetch('https://api.nextdns.io/profiles', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Work Laptop' }),
});

const { data } = await response.json();
const newProfileId = data.id; // e.g. "def456"
```

**Correct: Paginate through all profiles**

```javascript
// ✅ If you have many profiles, use cursor-based pagination
async function getAllProfiles(apiKey) {
  const profiles = [];
  let cursor = null;

  do {
    const url = new URL('https://api.nextdns.io/profiles');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
    });
    const result = await response.json();

    if (result.errors) throw new Error(result.errors[0].detail);

    profiles.push(...result.data);
    cursor = result.meta?.pagination?.cursor ?? null;
  } while (cursor);

  return profiles;
}

const allProfiles = await getAllProfiles('YOUR_API_KEY');
console.log(`Total profiles: ${allProfiles.length}`);
```

**Correct: TypeScript types**

```typescript
// ✅ Type definitions for account-level data
interface Profile {
  id: string;
  name: string;
  fingerprint?: string;
}

interface ProfileListResponse {
  data: Profile[];
  meta?: {
    pagination?: { cursor: string | null };
  };
}

async function listProfiles(): Promise<Profile[]> {
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': process.env.NEXTDNS_API_KEY ?? '' },
  });
  const json: ProfileListResponse = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json.data;
}
```

**Incorrect:**

```javascript
// ❌ Hardcoding a profile ID without fetching the list first
// — the ID may not belong to the authenticated account
const profileId = 'abc123'; // ❌ Assume nothing; always verify via GET /profiles

// ❌ Ignoring pagination — accounts with many profiles will silently lose data
const { data } = await fetch('https://api.nextdns.io/profiles', { headers }).then(r => r.json());
return data; // ❌ Returns first page only (default limit: 10)
```

### 1.2 Allowlist and Denylist

**Impact: HIGH (Manage domain allowlists and denylists for custom filtering)**

Manage custom domain allow/deny lists

Manage custom domain allow/deny lists

Domains can include:

- Block specific malicious domains not in blocklists

- Block distracting websites (social media during work hours)

- Block specific ad servers

- Block tracking domains

- Unblock false positives from blocklists

- Allow work-critical domains that might be blocked

- Allow specific services needed by apps

- Override parental controls for specific trusted sites

Allowlist has **higher priority** than denylist and all other blocking rules:

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

**Incorrect:**

```javascript
// ❌ Using array of strings
{
  denylist: ["bad1.com", "bad2.com"]
}

// ❌ Using "blocked" or "allowed" properties
{
  denylist: [
    { id: "bad.com", blocked: true } // ❌
  ]
}

// ✅ Correct format
{
  denylist: [
    { id: "bad.com", active: true }
  ],
  allowlist: [
    { id: "good.com", active: true }
  ]
}
```

### 1.3 Analytics Endpoints

**Impact: HIGH (Access various analytics endpoints for DNS query insights)**

Access comprehensive DNS analytics data

Access comprehensive DNS analytics data

All analytics endpoints follow the pattern:

`https://api.nextdns.io/profiles/:profile/analytics/{endpoint}`

Query distribution by status (blocked, allowed, default):

Top queried domains:

Why domains were blocked:

Query distribution by IP address:

Query distribution by device:

Query distribution by DNS protocol:

Distribution by DNS record type:

IPv4 vs IPv6 distribution:

DNSSEC validation statistics:

Encrypted vs unencrypted queries:

Query destinations by country:

Queries to big tech companies:

- [NextDNS API - Analytics Endpoints](https://nextdns.github.io/api/#endpoints)

### 1.4 Analytics Query Parameters

**Impact: HIGH (Use correct query parameters for analytics endpoints)**

Correctly filter and paginate analytics data

Correctly filter and paginate analytics data

All analytics endpoints support these parameters:

No additional parameters.

No additional parameters.

Check specific endpoint documentation for additional parameters.

- [NextDNS API - Analytics](https://nextdns.github.io/api/#analytics)

**Incorrect:**

```javascript
// ❌ Invalid date format
from: '01/15/2024'; // Use ISO 8601 or relative dates

// ❌ Limit out of range
limit: 5000; // Max is 500

// ❌ Wrong parameter names
url.searchParams.set('start', '-7d'); // Should be 'from'
url.searchParams.set('end', 'now'); // Should be 'to'
url.searchParams.set('page', '2'); // Use 'cursor' instead

// ❌ Hardcoded cursor values
cursor: 'page2'; // Must use cursor from API response
```

### 1.5 Authentication

**Impact: HIGH (Authenticate all NextDNS API requests with API key)**

All NextDNS API requests require authentication via API key

All NextDNS API requests require authentication via API key

💡 Find your API key at the bottom of your account page: <https://my.nextdns.io/account>

- Never commit API keys to version control

- Use environment variables to store API keys

- Rotate API keys periodically

- Use different API keys for different environments (dev, staging, production)

- [NextDNS API - Authentication](https://nextdns.github.io/api/#authentication)

**Correct:**

```bash
curl -H "X-Api-Key: a8f4e42e896ff37f181e3e8a42a9737e1423d8e7" \
  https://api.nextdns.io/profiles
```

**Correct:**

```javascript
const headers = {
  'X-Api-Key': 'a8f4e42e896ff37f181e3e8a42a9737e1423d8e7',
  'Content-Type': 'application/json',
};

fetch('https://api.nextdns.io/profiles', { headers })
  .then((response) => response.json())
  .then((data) => console.log(data));
```

**Correct:**

```python
import requests

headers = {
    'X-Api-Key': 'a8f4e42e896ff37f181e3e8a42a9737e1423d8e7'
}

response = requests.get('https://api.nextdns.io/profiles', headers=headers)
data = response.json()
```

**Incorrect:**

```bash
# ❌ Missing authentication header
curl https://api.nextdns.io/profiles

# ❌ Using Authorization header instead of X-Api-Key
curl -H "Authorization: Bearer a8f4e42e896ff37f181e3e8a42a9737e1423d8e7" \
  https://api.nextdns.io/profiles

# ❌ Passing API key as query parameter
curl https://api.nextdns.io/profiles?api_key=a8f4e42e896ff37f181e3e8a42a9737e1423d8e7
```

### 1.6 Date Formats

**Impact: HIGH (Use correct date formats in query parameters)**

Use correct date formats for time-based queries

Use correct date formats for time-based queries

The NextDNS API accepts multiple date formats:

Standard ISO 8601 format with timezone:

Most convenient for recent data:

- All timestamps are in **UTC**

- ISO 8601 strings should include timezone (`Z` for UTC)

- Relative dates are calculated from current UTC time

- Use time series `timezone` parameter for local time alignment

1. **Use relative dates** for recent data (`-7d`, `-24h`)

2. **Use ISO 8601** for specific dates

3. **Always include timezone** in ISO 8601 strings

4. **Use `now`** instead of calculating current time

5. **Cache date calculations** to avoid inconsistencies

6. **Validate date ranges** before making requests

- [NextDNS API - Date Formats](https://nextdns.github.io/api/#date-format-in-query-parameters)

**Incorrect:**

```javascript
// ❌ Invalid formats
from: '01/15/2024'; // US date format
from: '15/01/2024'; // EU date format
from: 'January 15, 2024'; // Text format
from: '2024-1-15'; // Missing leading zeros

// ❌ Invalid relative formats
from: '-7 days'; // No spaces
from: '-1week'; // Use 'd' not 'week'
from: 'last week'; // Use '-7d'

// ❌ Missing timezone
from: '2024-01-15T16:34:05'; // Should have Z or timezone

// ✅ Correct formats
from: '2024-01-15';
from: '2024-01-15T16:34:05Z';
from: '-7d';
from: 1615826071;
from: 'now';
```

### 1.7 DNS Rewrites

**Impact: HIGH ()**

Manage custom DNS rewrite records via the NextDNS API

Manage custom DNS rewrite records via the NextDNS API

DNS rewrites let you override DNS resolution for specific hostnames, mapping them to a custom IP

address or CNAME target. The `/profiles/{id}/rewrites` endpoint supports listing, creating, and

deleting rewrite records.

Common use cases:

- Point internal hostnames (for example, `nas.home`) to local IP addresses

- Block a specific hostname by returning `0.0.0.0`

- Create CNAME aliases for self-hosted services

- **Store rewrite IDs**: Save the `id` from the POST response to enable programmatic deletion

  without a prior GET.

- **Re-create to update**: The rewrites endpoint has no PATCH support. To change a record, DELETE

  the old entry and POST a new one.

- **Avoid blocking via rewrites**: For blocking domains, prefer the denylist endpoint. Use rewrites

  only when you need a specific non-zero answer.

- **Use non-public TLDs for local names**: Suffixes like `.home` or `.lan` avoid conflicts with

  public DNS resolution.

**Symptoms**: `{"errors": {"name": "invalid"}}` or a generic validation error.

**Solution**: Ensure the `name` is a valid hostname and `Content-Type: application/json` is set.

**Symptoms**: DNS still resolves to the original IP after creating the rewrite.

**Solution**: Confirm the rewrite was created by listing all rewrites, then flush local DNS cache.

- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)

- [NextDNS Help Center](https://help.nextdns.io)

**Correct: List all rewrites**

```javascript
// ✅ Retrieve all rewrite records for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
// data: [{ "id": "abc123", "name": "nas.home", "content": "192.168.1.100" }]
```

**Correct: Add an a record IPv4**

```javascript
// ✅ Map a hostname to an IPv4 address
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'nas.home',
    content: '192.168.1.100',
  }),
});
```

**Correct: Add a CNAME alias**

```javascript
// ✅ Point a subdomain to another hostname
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'blog.example.com',
    content: 'myserver.example.com',
  }),
});
```

**Correct: Block a hostname via rewrite**

```javascript
// ✅ Return zero address to effectively block a hostname
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'tracker.example.com',
    content: '0.0.0.0',
  }),
});
```

**Correct: Delete a rewrite**

```javascript
// ✅ Remove a rewrite using the id returned from GET or POST
const rewriteId = 'abc123';

await fetch(`https://api.nextdns.io/profiles/abc123/rewrites/${rewriteId}`, {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

**Incorrect:**

```javascript
// ❌ PATCH is not supported — delete and re-create to update a rewrite
await fetch('https://api.nextdns.io/profiles/abc123/rewrites/abc123', {
  method: 'PATCH',
  body: JSON.stringify({ content: '192.168.1.200' }),
});

// ❌ Omitting Content-Type on POST causes a 400 error
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // Missing Content-Type
  body: JSON.stringify({ name: 'nas.home', content: '192.168.1.100' }),
});

// ❌ Using the hostname name instead of the numeric id for DELETE
await fetch('https://api.nextdns.io/profiles/abc123/rewrites/nas.home', {
  method: 'DELETE', // ❌ Use the id field from the GET/POST response
});
```

### 1.8 Error Handling

**Impact: HIGH (Handle API errors and validation responses correctly)**

Properly handle API errors and validation failures

Properly handle API errors and validation failures

The API uses two different error response patterns:

Invalid requests return `400` status with errors array:

Business logic errors return `200` status with errors array:

| Code             | Description                | Example                        |

| ---------------- | -------------------------- | ------------------------------ |

| `invalid`        | Invalid parameter value    | Wrong type, out of range       |

| `required`       | Missing required parameter | Missing API key, missing field |

| `invalid_domain` | Invalid domain format      | Malformed domain name          |

| `duplicate`      | Duplicate entry            | Domain already in list         |

| `not_found`      | Resource not found         | Profile doesn't exist          |

| `rate_limit`     | Rate limit exceeded        | Too many requests              |

1. **Always check for `errors` in response** even on 200 OK

2. **Check HTTP status** for network/server errors

3. **Parse error details** for user-friendly messages

4. **Don't retry validation errors** (they won't succeed)

5. **Implement exponential backoff** for retries

6. **Log errors** with full context for debugging

7. **Handle rate limiting** with appropriate delays

- [NextDNS API - Error Handling](https://nextdns.github.io/api/#handling-errors)

**Incorrect:**

```javascript
// ❌ Only checking response.ok
if (!response.ok) {
  throw new Error('Request failed');
}
// User errors return 200 OK!

// ❌ Not checking for errors in response body
const data = await response.json();
return data; // Might contain errors!

// ✅ Correct
const data = await response.json();
if (data.errors) {
  throw new ApiError(data.errors);
}
if (!response.ok) {
  throw new HttpError(response.status);
}
return data;
```

### 1.9 Logs Clear

**Impact: HIGH ()**

Permanently delete all stored DNS logs for a profile

Permanently delete all stored DNS logs for a profile

The `DELETE /profiles/{id}/logs` endpoint erases all DNS query logs stored for a profile. This is

useful for GDPR/privacy compliance workflows, resetting a profile to a clean state, or purging

sensitive log data on demand.

This operation is **permanent and irreversible**. Logs cannot be recovered after deletion.

- **Verify the profile ID before calling**: The operation is irreversible. Confirm you are targeting

  the correct profile.

- **Automate GDPR/retention workflows**: Use this endpoint to implement data retention policies that

  clear logs after a defined period.

- **Disable logs before clearing**: If you plan to stop logging permanently, first set

  `logs.enabled = false` via the Settings endpoint, then clear existing logs.

- **Note that profile deletion clears logs automatically**: If the profile itself is being deleted,

  the logs are cleared as part of the profile deletion — no separate call needed.

**Symptoms**: Response `{"errors": [{"code": "unauthorized"}]}`.

**Solution**: Ensure the `X-Api-Key` header is present and the key belongs to the account that owns

the profile.

**Symptoms**: The profile ID does not exist or belongs to a different account.

**Solution**: Verify the profile ID by listing all profiles first.

- [NextDNS API — Logs Clear](https://nextdns.github.io/api/#clear)

- [NextDNS Help Center](https://help.nextdns.io)

**Correct:**

```javascript
// ✅ Clear all logs for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/logs', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

// 204 No Content on success — no response body
if (response.status === 204) {
  console.log('All logs cleared successfully');
}
```

**Correct:**

```python
# ✅ Python example
import requests

response = requests.delete(
    'https://api.nextdns.io/profiles/abc123/logs',
    headers={'X-Api-Key': 'YOUR_API_KEY'},
)

# 204 No Content on success
assert response.status_code == 204
```

**Correct:**

```bash
# ✅ cURL example
curl -X DELETE https://api.nextdns.io/profiles/abc123/logs \
  -H "X-Api-Key: YOUR_API_KEY" \
  -w "%{http_code}"
# Expected: 204
```

**Incorrect:**

```javascript
// ❌ Using POST or PATCH — only DELETE is supported for clearing logs
await fetch('https://api.nextdns.io/profiles/abc123/logs', {
  method: 'POST', // ❌ Will return 405 Method Not Allowed
});

// ❌ Calling without verifying profile ID — logs deletion is permanent
await fetch('https://api.nextdns.io/profiles/wrongId/logs', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
  // ❌ Double-check the profile ID before calling
});
```

### 1.10 Logs Management

**Impact: HIGH (Query, filter, and search DNS logs)**

Query and filter DNS logs for debugging and analysis

Query and filter DNS logs for debugging and analysis

- Only navigational query types (A, AAAA, HTTPS)

- Automatically deduplicated

- Noise filtered out (Chrome random lookups, and more)

- Clearer overview of network access

- All DNS queries

- All query types (A, AAAA, CNAME, TXT, MX, and more)

- No deduplication

- Includes all noise

- Useful for debugging

1. **Use smaller time ranges** for faster queries

2. **Filter by device** when possible to reduce data

3. **Use status filtering** to narrow results

4. **Start with deduplicated logs** (`raw=false`) for overview

5. **Use raw logs** only when debugging specific issues

6. **Implement pagination** for large result sets

7. **Cache results** when appropriate

- [NextDNS API - Logs](https://nextdns.github.io/api/#logs)

**Incorrect:**

```javascript
// ❌ Limit out of range
limit: 5000; // Max is 1000

// ❌ Invalid status
status: 'deny'; // Use 'blocked'

// ❌ Wrong parameter for raw
raw: 'true'; // Use boolean or '1'/'0'

// ✅ Correct
raw: true;
raw: '1';
```

### 1.11 Logs Streaming

**Impact: HIGH (Stream DNS logs in real-time using Server-Sent Events)**

Stream DNS logs in real-time using Server-Sent Events (SSE)

Stream DNS logs in real-time using Server-Sent Events (SSE)

Each event contains:

Use the `id` parameter to resume from where you left off:

Get the stream ID from the regular logs endpoint:

All parameters from `/logs` endpoint are supported except:

- `from` (not applicable for streaming)

- `to` (not applicable for streaming)

- `sort` (always newest first)

- `limit` (streams continuously)

- `cursor` (use `id` instead)

EventSource is supported in all modern browsers. For older browsers or Node.js, use:

- [NextDNS API - Logs Streaming](https://nextdns.github.io/api/#streaming)

**Incorrect:**

```javascript
// ❌ Using fetch instead of EventSource
fetch('https://api.nextdns.io/profiles/abc123/logs/stream');

// ❌ Not handling reconnection
eventSource.onerror = () => {}; // Stream will die

// ❌ Not saving last event ID
// You'll miss events during reconnection

// ✅ Correct
const eventSource = new EventSource(url);
eventSource.onmessage = (event) => {
  saveLastEventId(event.lastEventId);
};
```

### 1.12 Nested Endpoints

**Impact: HIGH (Work with nested objects and arrays in profile configuration)**

Understand how to work with nested profile configuration

Understand how to work with nested profile configuration

Profile configuration has nested objects and arrays:

All nested objects and arrays have their own API endpoints:

Nested objects support `GET` and `PATCH`:

Nested arrays support `GET`, `POST`, and `PUT`:

Individual array items support `PATCH` and `DELETE`:

For array items, use the first key as the ID in the URL:

| Endpoint Type | GET | POST | PUT | PATCH | DELETE |

| ------------- | --- | ---- | --- | ----- | ------ |

| Profile       | ✅  | ✅   | ❌  | ✅    | ✅     |

| Nested Object | ✅  | ❌   | ❌  | ✅    | ❌     |

| Nested Array  | ✅  | ✅   | ✅  | ❌    | ❌     |

| Array Item    | ❌  | ❌   | ❌  | ✅    | ✅     |

- [NextDNS API - Nested Objects](https://nextdns.github.io/api/#nested-objects-and-arrays)

**Incorrect:**

```javascript
// ❌ Using PUT on object endpoints
await fetch('https://api.nextdns.io/profiles/abc123/security', {
  method: 'PUT', // Not supported, use PATCH
  body: JSON.stringify({ cryptojacking: true }),
});

// ❌ Using PATCH on array endpoints
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists', {
  method: 'PATCH', // Not supported, use POST or PUT
  body: JSON.stringify({ id: 'oisd' }),
});

// ❌ Using POST on array items
await fetch('https://api.nextdns.io/profiles/abc123/denylist/bad.com', {
  method: 'POST', // Not supported, use PATCH
  body: JSON.stringify({ active: false }),
});

// ❌ Wrong ID format in URL
await fetch('https://api.nextdns.io/profiles/abc123/denylist/0', {
  // Use domain name, not array index
  method: 'DELETE',
});

// ✅ Correct
await fetch('https://api.nextdns.io/profiles/abc123/denylist/bad.com', {
  method: 'DELETE',
});
```

### 1.13 Pagination

**Impact: HIGH (Correctly paginate through API responses)**

Properly paginate through large result sets

Properly paginate through large result sets

Most endpoints that return arrays use cursor-based pagination:

Control results per page:

Stop after a certain number of items:

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

- **Opaque**: Cursors are opaque strings, don't try to parse or modify them

- **Temporary**: Cursors may expire after some time

- **Null**: `cursor` is `null` when there are no more pages

- **Sequential**: Must request pages in order, can't skip pages

1. **Use appropriate page size**: Balance between number of requests and memory usage

2. **Don't fetch all pages** if you only need top results

3. **Cache results** when appropriate

4. **Use streaming** for real-time data instead of polling

5. **Implement rate limiting** to avoid hitting API limits

6. **Handle errors gracefully** and retry failed pages

Be mindful of rate limits when paginating:

- [NextDNS API - Pagination](https://nextdns.github.io/api/#pagination)

**Incorrect:**

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

### 1.14 Parental Control

**Impact: HIGH (Configure parental controls, safe search, and content filtering)**

Configure parental controls and content filtering

Configure parental controls and content filtering

| Service ID    | Description |

| ------------- | ----------- |

| `tiktok`      | TikTok      |

| `facebook`    | Facebook    |

| `instagram`   | Instagram   |

| `snapchat`    | Snapchat    |

| `twitter`     | Twitter/X   |

| `youtube`     | YouTube     |

| `twitch`      | Twitch      |

| `discord`     | Discord     |

| `reddit`      | Reddit      |

| `whatsapp`    | WhatsApp    |

| `telegram`    | Telegram    |

| `fortnite`    | Fortnite    |

| `roblox`      | Roblox      |

| `minecraft`   | Minecraft   |

| `netflix`     | Netflix     |

| `disney-plus` | Disney+     |

| `hulu`        | Hulu        |

| `spotify`     | Spotify     |

| Category ID           | Description                |

| --------------------- | -------------------------- |

| `porn`                | Adult content              |

| `gambling`            | Gambling and betting       |

| `dating`              | Dating sites and apps      |

| `piracy`              | Piracy and torrents        |

| `drugs`               | Drug-related content       |

| `violence`            | Violent content            |

| `weapons`             | Weapons and ammunition     |

| `hate-discrimination` | Hate speech                |

| `social-networks`     | Social media platforms     |

| `gaming`              | Gaming sites and platforms |

| `streaming`           | Video streaming services   |

| `shopping`            | E-commerce sites           |

- **Services**: Block or allow specific apps and websites (TikTok, Facebook, and more)

- **Categories**: Block entire categories of content (porn, gambling, and more)

- **Safe Search**: Force safe search on Google, Bing, DuckDuckGo, and more

- **YouTube Restricted Mode**: Enable YouTube's restricted mode

- **Block Bypass**: Block VPNs, proxies, and Tor to prevent circumvention

- `active: true` = Block the service/category

- `active: false` = Allow the service/category (but keep in list for quick toggling)

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

**Incorrect:**

```javascript
// ❌ Using boolean instead of object with active property
{
  parentalControl: {
    services: [
      { id: 'tiktok', blocked: true }, // ❌ Wrong property name
    ];
  }
}

// ✅ Correct format
{
  parentalControl: {
    services: [{ id: 'tiktok', active: true }];
  }
}
```

### 1.15 Privacy Settings

**Impact: HIGH (Configure privacy blocklists and native tracking protection)**

Configure privacy protection and ad/tracker blocking

Configure privacy protection and ad/tracker blocking

Add or remove blocklists:

| Blocklist ID          | Description                         |

| --------------------- | ----------------------------------- |

| `nextdns-recommended` | NextDNS curated ads and trackers list |

| `oisd`                | OISD Big List (comprehensive)       |

| `energized`           | Energized Protection                |

| `adguard`             | AdGuard DNS filter                  |

| `stevenblack`         | Steven Black's unified hosts        |

| `1hosts-lite`         | 1Hosts (Lite)                       |

| `easylist`            | EasyList                            |

| `easyprivacy`         | EasyPrivacy                         |

| Platform ID | Description                  |

| ----------- | ---------------------------- |

| `apple`     | Apple telemetry and tracking |

| `huawei`    | Huawei telemetry             |

| `samsung`   | Samsung telemetry            |

| `windows`   | Windows telemetry            |

| `xiaomi`    | Xiaomi telemetry             |

| `alexa`     | Amazon Alexa                 |

| `roku`      | Roku tracking                |

| `sonos`     | Sonos telemetry              |

- **Blocklists**: Curated lists of known ad and tracker domains

- **Native Tracking**: Block built-in telemetry from device manufacturers

- **Disguised Trackers**: Block CNAME-cloaked trackers that bypass traditional blocklists

- **Allow Affiliate**: When disabled, blocks affiliate and tracking parameters from URLs

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

**Incorrect:**

```javascript
// ❌ Using array of strings instead of objects
{
  privacy: {
    blocklists: ['nextdns-recommended', 'oisd']; // ❌
  }
}

// ✅ Correct format
{
  privacy: {
    blocklists: [{ id: 'nextdns-recommended' }, { id: 'oisd' }];
  }
}
```

### 1.16 Profile Copy and Duplication

**Impact: MEDIUM (There is no single clone endpoint — incorrect copy order omits nested settings or blocklists, resulting in a silently incomplete duplicate)**

Clone an existing NextDNS profile by reading all nested settings and writing them to a new profile

Clone an existing NextDNS profile by reading all nested settings and writing them to a new profile

The NextDNS API does not provide a dedicated clone or duplicate endpoint. To copy a profile, you

must fetch each nested object and array individually, then POST them to the new profile in the

correct order. Because some nested endpoints are interdependent (for example, the denylist depends

on the profile existing), the sequence matters.

Typical use cases:

- Creating a template profile and replicating it for new users

- Backing up a profile before making experimental changes

- Migrating settings from a personal profile to a team profile

- **Always create the destination profile first**: Several nested endpoints return 404 if the

  profile ID does not exist yet.

- **Use `PUT` for array endpoints when copying**: `PUT` replaces the entire array in one request,

  whereas `POST` would require looping through each item individually.

- **Copy rewrites one at a time**: The rewrites endpoint has no `PUT` — POST each rewrite

  individually.

- **Save the backup JSON before copying**: Run `backupProfile` before modifying the source to

  ensure you can restore if needed.

- **Add a suffix to the copy name**: Naming the copy `"[Source] (Copy)"` prevents confusion in the

  dashboard.

**Symptoms**: Security and privacy scalar settings copied correctly but the blocklist table is empty.

**Solution**: Confirm you ran the `PUT /profiles/{destId}/privacy/blocklists` step and that the

source blocklists array was not empty before calling PUT.

**Solution**: The `/rewrites` endpoint requires individual POST calls — there is no bulk PUT.

Verify the loop in Step 3 iterates over the rewrites array correctly.

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)

- [NextDNS API — Nested Objects](https://nextdns.github.io/api/#nested-objects-and-arrays)

- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)

**Correct: Full profile copy — JavaScript**

```javascript
// ✅ Clone a profile: read all settings, write to a new profile
async function copyProfile(sourceId, newName, apiKey) {
  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };

  async function get(path) {
    const res = await fetch(`https://api.nextdns.io${path}`, { headers });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  async function patch(path, body) {
    const res = await fetch(`https://api.nextdns.io${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  async function put(path, body) {
    const res = await fetch(`https://api.nextdns.io${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  // Step 1: Create the destination profile
  const createRes = await fetch('https://api.nextdns.io/profiles', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: newName }),
  });
  const createJson = await createRes.json();
  if (createJson.errors) throw new Error(createJson.errors[0].detail);
  const destId = createJson.data.id;
  console.log(`Created profile: ${destId}`);

  // Step 2: Copy nested objects (PATCH)
  const [security, privacy, parentalControl, settings] = await Promise.all([
    get(`/profiles/${sourceId}/security`),
    get(`/profiles/${sourceId}/privacy`),
    get(`/profiles/${sourceId}/parentalControl`),
    get(`/profiles/${sourceId}/settings`),
  ]);

  // Copy scalar fields; strip nested arrays (handled separately below)
  await patch(`/profiles/${destId}/security`, {
    threatIntelligenceFeeds: security.threatIntelligenceFeeds,
    aiThreatDetection: security.aiThreatDetection,
    googleSafeBrowsing: security.googleSafeBrowsing,
    cryptojacking: security.cryptojacking,
    dnsRebinding: security.dnsRebinding,
    idnHomographs: security.idnHomographs,
    typosquatting: security.typosquatting,
    dga: security.dga,
    nrd: security.nrd,
    ddns: security.ddns,
    parking: security.parking,
    csam: security.csam,
  });

  await patch(`/profiles/${destId}/privacy`, {
    disguisedTrackers: privacy.disguisedTrackers,
    allowAffiliate: privacy.allowAffiliate,
  });

  await patch(`/profiles/${destId}/parentalControl`, {
    safeSearch: parentalControl.safeSearch,
    youtubeRestrictedMode: parentalControl.youtubeRestrictedMode,
    blockBypass: parentalControl.blockBypass,
  });

  await patch(`/profiles/${destId}/settings`, settings);

  // Step 3: Copy nested arrays (PUT replaces entire array)
  const [tlds, blocklists, natives, services, categories, denylist, allowlist, rewrites] =
    await Promise.all([
      get(`/profiles/${sourceId}/security/tlds`),
      get(`/profiles/${sourceId}/privacy/blocklists`),
      get(`/profiles/${sourceId}/privacy/natives`),
      get(`/profiles/${sourceId}/parentalControl/services`),
      get(`/profiles/${sourceId}/parentalControl/categories`),
      get(`/profiles/${sourceId}/denylist`),
      get(`/profiles/${sourceId}/allowlist`),
      get(`/profiles/${sourceId}/rewrites`),
    ]);

  await Promise.all([
    tlds.length && put(`/profiles/${destId}/security/tlds`, tlds),
    blocklists.length && put(`/profiles/${destId}/privacy/blocklists`, blocklists),
    natives.length && put(`/profiles/${destId}/privacy/natives`, natives),
    services.length && put(`/profiles/${destId}/parentalControl/services`, services),
    categories.length && put(`/profiles/${destId}/parentalControl/categories`, categories),
    denylist.length && put(`/profiles/${destId}/denylist`, denylist),
    allowlist.length && put(`/profiles/${destId}/allowlist`, allowlist),
  ]);

  // Rewrites use POST individually (no PUT endpoint)
  for (const rewrite of rewrites) {
    await fetch(`https://api.nextdns.io/profiles/${destId}/rewrites`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: rewrite.name, content: rewrite.content }),
    });
  }

  console.log(`Profile "${newName}" (${destId}) cloned from ${sourceId}`);
  return destId;
}

// Usage
const newId = await copyProfile('abc123', 'Home Network (Copy)', 'YOUR_API_KEY');
```

**Correct: Backup a profile to JSON**

```javascript
// ✅ Export profile settings to a JSON file for backup
async function backupProfile(profileId, apiKey) {
  const headers = { 'X-Api-Key': apiKey };
  const get = async (path) => {
    const res = await fetch(`https://api.nextdns.io${path}`, { headers });
    return (await res.json()).data;
  };

  const backup = {
    exportedAt: new Date().toISOString(),
    sourceId: profileId,
    security: await get(`/profiles/${profileId}/security`),
    'security/tlds': await get(`/profiles/${profileId}/security/tlds`),
    privacy: await get(`/profiles/${profileId}/privacy`),
    'privacy/blocklists': await get(`/profiles/${profileId}/privacy/blocklists`),
    'privacy/natives': await get(`/profiles/${profileId}/privacy/natives`),
    parentalControl: await get(`/profiles/${profileId}/parentalControl`),
    'parentalControl/services': await get(`/profiles/${profileId}/parentalControl/services`),
    'parentalControl/categories': await get(`/profiles/${profileId}/parentalControl/categories`),
    settings: await get(`/profiles/${profileId}/settings`),
    denylist: await get(`/profiles/${profileId}/denylist`),
    allowlist: await get(`/profiles/${profileId}/allowlist`),
    rewrites: await get(`/profiles/${profileId}/rewrites`),
  };

  return JSON.stringify(backup, null, 2);
}
```

**Incorrect:**

```javascript
// ❌ Trying to copy a profile via a single request — no such endpoint exists
await fetch('https://api.nextdns.io/profiles/abc123/copy', { method: 'POST' }); // ❌ 404

// ❌ Skipping array endpoints — blocklists and denylist are separate from the main object
await patch(`/profiles/${destId}`, securityObject);
// ❌ This does not copy tlds[], blocklists[], denylist[], or rewrites[]

// ❌ Using POST for arrays — use PUT to replace the whole array atomically
await fetch(`/profiles/${destId}/privacy/blocklists`, {
  method: 'POST',           // ❌ POST adds one item; use PUT to copy all items at once
  body: JSON.stringify(allBlocklists),
});
```

### 1.17 Profile Management

**Impact: HIGH (Create, read, update, and delete NextDNS profiles)**

Manage NextDNS profiles via API endpoints

Manage NextDNS profiles via API endpoints

POST to `https://api.nextdns.io/profiles` with profile configuration:

GET a specific profile:

PATCH to update specific fields:

DELETE a profile:

After creating a profile, use the returned `id` for all subsequent operations:

- [NextDNS API - Profiles](https://nextdns.github.io/api/#profiles)

- [NextDNS API - Profile](https://nextdns.github.io/api/#profile)

**Incorrect:**

```javascript
// ❌ Using PUT instead of PATCH for partial updates
await fetch('https://api.nextdns.io/profiles/abc123', {
  method: 'PUT', // Wrong method
  body: JSON.stringify({ name: 'New Name' }),
});

// ❌ Forgetting to use the profile ID from creation response
const response = await createProfile(data);
// Don't hardcode or guess the ID
const wrongId = 'myprofile'; // ❌
```

### 1.18 Profile Settings

**Impact: HIGH ()**

Manage profile-level settings via the NextDNS API

Manage profile-level settings via the NextDNS API

The `/profiles/{id}/settings` endpoint controls profile-wide behaviour that applies to every DNS

query: logging, performance optimisations, block page, and Web3 resolution. Use GET to inspect

current settings and PATCH to update individual fields without affecting others.

| Field                         | Type    | Description                                                                                          |

| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |

| `logs.enabled`                | boolean | Enable or disable query logging                                                                      |

| `logs.location`               | string  | Storage region: `fr`, `ch`, `gb`, `us-ca`, `us-ny`, `de`, `sg`, `jp`, `in`, `au`, `nl`               |

| `logs.retention`              | number  | Log retention in seconds: `0`, `3600`, `21600`, `86400`, `604800`, `2592000`, `15552000`, `31536000` |

| `logs.drop.ip`                | boolean | Strip client IP from logs                                                                            |

| `logs.drop.domain`            | boolean | Strip queried domain from logs                                                                       |

| `blockPage.enabled`           | boolean | Show a block page when a query is blocked                                                            |

| `performance.cacheBoost`      | boolean | Serve cached DNS answers to reduce latency                                                           |

| `performance.cnameFlattening` | boolean | Flatten CNAME chains to reduce lookup depth                                                          |

| `performance.ecs`             | boolean | Send EDNS Client Subnet for geo-aware answers                                                        |

| `web3`                        | boolean | Enable Web3/blockchain domain resolution                                                             |

- **PATCH only what changes**: Pass only the keys you want to update; unspecified keys retain their

  current values.

- **Use Swiss (`ch`) or French (`fr`) storage for GDPR compliance**: Log location affects data

  residency; choose a region appropriate for your users.

- **Set `logs.drop.ip` for privacy**: Prevents client IPs from being stored, reducing PII exposure

  without disabling logs entirely.

- **Test performance settings in isolation**: Enable `cacheBoost` and `cnameFlattening` one at a

  time to isolate any compatibility issues.

**Symptoms**: `{"errors": {"logs.retention": "invalid"}}`.

**Solution**: Use only the allowed retention values (in seconds): `0`, `3600`, `21600`, `86400`,

`604800`, `2592000`, `15552000`, `31536000`.

**Symptoms**: Response is `200 OK` but the feature does not activate.

**Solution**: Retrieve the settings with GET to confirm the value was stored, then test DNS

resolution from a device actually using the profile.

- [NextDNS API — Settings](https://nextdns.github.io/api/#settings)

- [NextDNS Help Center](https://help.nextdns.io)

**Correct: Get current settings**

```javascript
// ✅ Retrieve all settings for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
```

**Correct: Update logging settings**

```javascript
// ✅ Enable logging with Swiss storage and 30-day retention
await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  method: 'PATCH',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    logs: {
      enabled: true,
      location: 'ch',
      retention: 2592000, // 30 days in seconds
      drop: {
        ip: false,
        domain: false,
      },
    },
  }),
});
```

**Correct: Update performance settings**

```javascript
// ✅ Enable cache boost and CNAME flattening
await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  method: 'PATCH',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    performance: {
      cacheBoost: true,
      cnameFlattening: true,
      ecs: false,
    },
  }),
});
```

**Correct: Disable block page**

```javascript
// ✅ Return NXDOMAIN instead of showing a block page
await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  method: 'PATCH',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    blockPage: { enabled: false },
  }),
});
```

**Incorrect:**

```javascript
// ❌ Using PUT replaces the entire settings object — always use PATCH
await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  method: 'PUT', // ❌ Use PATCH for partial updates
  body: JSON.stringify({ logs: { enabled: false } }),
});

// ❌ Passing an unsupported retention value causes a 400 error
body: JSON.stringify({
  logs: { retention: 999 }, // ❌ Must be one of the allowed values
});

// ❌ Passing an unsupported location code
body: JSON.stringify({
  logs: { location: 'us' }, // ❌ Use 'us-ca' or 'us-ny', not 'us'
});
```

### 1.19 Security Settings

**Impact: HIGH (Configure threat protection and security features)**

Configure comprehensive security features for DNS filtering

Configure comprehensive security features for DNS filtering

PATCH to update security settings:

Manage blocked TLDs via nested endpoint:

| Feature                       | Description                                                                        |

| ----------------------------- | ---------------------------------------------------------------------------------- |

| **Threat Intelligence Feeds** | Block domains from curated threat intelligence sources                             |

| **AI Threat Detection**       | Use AI to detect and block emerging threats                                        |

| **Google Safe Browsing**      | Block phishing and malware sites via Google's database                             |

| **Cryptojacking**             | Block cryptocurrency mining scripts                                                |

| **DNS Rebinding**             | Prevent attacks that bypass same-origin policy                                     |

| **IDN Homographs**            | Block domains using similar-looking characters (for example, аpple.com with Cyrillic 'а') |

| **Typosquatting**             | Block common typos of popular domains                                              |

| **DGA**                       | Block algorithmically generated domains used by malware                            |

| **NRD**                       | Block newly registered domains (often used in attacks)                             |

| **DDNS**                      | Block dynamic DNS services often used by malware                                   |

| **Parking**                   | Block parked domains with ads                                                      |

| **CSAM**                      | Block illegal content                                                              |

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

- [NextDNS Help - Security](https://help.nextdns.io/t/g9hdkjz)

**Incorrect:**

```javascript
// ❌ Using string values instead of boolean
{
  security: {
    cryptojacking: "true" // ❌ Should be boolean
  }
}

// ❌ Invalid TLD format
{
  security: {
    tlds: ["ru", "cn"] // ❌ Should be objects with id property
  }
}

// ✅ Correct format
{
  security: {
    cryptojacking: true,
    tlds: [
      { id: "ru" },
      { id: "cn" }
    ]
  }
}
```

### 1.20 Time Series Data

**Impact: HIGH (Retrieve time series data for charts and visualizations)**

Get time series data for creating charts and trend analysis

Get time series data for creating charts and trend analysis

Append `;series` to any analytics endpoint to get time series data:

Instead of single `queries` value, you get an array:

Type: Seconds | Duration

Control the size of each time window:

If not specified, API chooses appropriate interval based on date range.

Values: `start` | `end` | `clock`

Default: `end`

Control how windows are aligned:

Type: TimeZone (IANA timezone name)

Default: `GMT`

Use with `alignment=clock` to align windows to local time:

Values: `none` | `start` | `end` | `all`

Default: `none`

Include partial windows at start/end:

1. **Choose appropriate intervals**: Don't use 1-hour intervals for 1-year ranges

2. **Use clock alignment** for daily reports to align with user's day

3. **Specify timezone** when alignment is `clock`

4. **Handle partial windows** based on your use case

5. **Cache results** for expensive queries

6. **Limit data points** for better performance (typically 50-100 points max for charts)

- [NextDNS API - Time Series](https://nextdns.github.io/api/#time-series)

**Incorrect:**

```javascript
// ❌ Forgetting ;series suffix
'/profiles/abc123/analytics/status?interval=1d';

// ✅ Correct
'/profiles/abc123/analytics/status;series?interval=1d';

// ❌ Invalid timezone format
timezone: 'PST'; // Use IANA names

// ✅ Correct
timezone: 'America/Los_Angeles';

// ❌ Invalid interval
interval: '1 day'; // No spaces

// ✅ Correct
interval: '1d';
interval: 86400;
```

---

## 2. Efficiency rules

**Impact: MEDIUM**

### 2.1 Logs Download

**Impact: MEDIUM (Download logs as a file)**

Download DNS logs as a file

Download DNS logs as a file

By default, this endpoint redirects to the public URL of the log file:

Use `redirect=0` to get the URL as JSON instead of redirecting:

Useful when showing a loader while the file is being generated:

The downloaded file is in CSV format with the following columns:

- Timestamp

- Domain

- Root Domain

- Type (A, AAAA, and more)

- Status (default, blocked, allowed)

- Reasons (if blocked)

- Client IP

- Device Name

- Device Model

- Protocol (DoH, DoT, UDP, and more)

- Encrypted (yes/no)

The download endpoint supports the same filtering parameters as the logs endpoint:

- `from` - Start date

- `to` - End date

- `device` - Filter by device

- `status` - Filter by status (blocked, allowed, default)

- `search` - Search for domain

- `raw` - Include all queries (true/false)

- `redirect` - Return URL instead of redirecting (0/1)

- [NextDNS API - Logs Download](https://nextdns.github.io/api/#download)

**Incorrect:**

```javascript
// ❌ Not handling redirect parameter
const response = await fetch(url).then((r) => r.json());
// This will fail because default is redirect, not JSON

// ❌ Not checking for errors
const { data } = await fetch(url + '?redirect=0').then((r) => r.json());
window.location.href = data.url; // Might not exist if there are errors

// ✅ Correct
const response = await fetch(url + '?redirect=0', { headers }).then((r) => r.json());
if (response.errors) {
  throw new Error('Failed to generate log file');
}
window.location.href = response.data.url;
```

### 2.2 Rate Limiting and Retry Strategy

**Impact: MEDIUM (Without proper retry logic, transient API errors cause permanent failures in automation scripts and dashboards)**

Implement resilient API calls with exponential backoff to handle transient errors gracefully

Implement resilient API calls with exponential backoff to handle transient errors gracefully

The NextDNS API enforces rate limits and occasionally returns transient server errors (HTTP 429 and

HTTP 500). Scripts that call the API in tight loops — such as syncing profiles, bulk log analysis,

or real-time dashboards — must implement retry logic with exponential backoff to avoid permanent

failures from temporary issues.

Key behaviours to handle:

- **429 Too Many Requests** — you have exceeded the rate limit; wait before retrying.

- **500 Internal Server Error** — transient upstream error; safe to retry with backoff.

- **400 / 404 / 422** — permanent client errors; never retry these automatically.

- **Retry only idempotent requests**: GET, DELETE, and PATCH with the same payload are safe to

  retry. Retrying a POST that creates a resource may create duplicates — check for 409 Conflict

  before retrying POST.

- **Log all retry attempts**: Include attempt number, status code, and delay in logs to detect

  systematic rate limit issues.

- **Cap maximum delay at 30 seconds**: Exponential backoff grows quickly — cap it to avoid

  indefinite hangs in scheduled tasks.

- **Set a global request timeout**: Wrap `fetch` in an `AbortController` with a 10-second timeout

  to prevent requests from hanging indefinitely.

**Symptoms**: Scripts processing many profiles hit 429 repeatedly.

**Solution**: Add deliberate inter-request delays (100–300ms) between sequential API calls in loops:

**Symptoms**: Intermittent 500 errors that succeed on the next attempt.

**Solution**: This is expected transient behaviour. The exponential backoff in `nextdnsFetch` above

handles this automatically. Do not alert on single 500 errors — only alert after all retries

exhausted.

- [NextDNS API — Error Handling](https://nextdns.github.io/api/#handling-errors)

- [MDN — HTTP 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)

**Correct: Retry utility with exponential backoff**

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

**Correct: TypeScript version**

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

**Correct: Respect `Retry-After` header**

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

**Incorrect:**

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

### 2.3 Response Format

**Impact: MEDIUM (Parse API response structure correctly)**

Understand and parse API response structure

Understand and parse API response structure

All API responses with `200` or `400` status follow one of these formats:

Single object endpoints return an object in `data`:

List endpoints return an array in `data`:

The `meta` section contains additional information:

- [NextDNS API - Response Format](https://nextdns.github.io/api/#response-format)

**Incorrect:**

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

---

