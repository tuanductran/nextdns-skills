---
title: 'Analytics Query Parameters'
impact: HIGH
impactDescription: 'Use correct query parameters for analytics endpoints'
type: capability
tags:
  - analytics
  - query parameters
  - filtering
  - date range
  - device filtering
  - pagination
---

# Analytics Query Parameters

Correctly filter and paginate analytics data

## Common Query Parameters

All analytics endpoints support these parameters:

### Date Range Filtering

```javascript
// Get analytics for the last 7 days
const url = new URL('https://api.nextdns.io/profiles/abc123/analytics/status');
url.searchParams.set('from', '-7d');
url.searchParams.set('to', 'now');

const response = await fetch(url, {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

### Date Format Options

```javascript
// ISO 8601
from: '2024-01-15T16:34:05.203Z';

// UNIX timestamp (seconds)
from: '1615826071';

// UNIX timestamp (milliseconds)
from: '1615826071284';

// Relative dates
from: '-7d'; // 7 days ago
from: '-6h'; // 6 hours ago
from: '-1M'; // 1 month ago
from: 'now'; // Current time

// Common date formats
from: '2024-01-15';
```

### Pagination

```javascript
// Limit results per page
url.searchParams.set('limit', '50'); // Default: 10, Max: 500

// Get next page using cursor from previous response
url.searchParams.set('cursor', 'j2k3zl3b4v');
```

### Device Filtering

```javascript
// Filter by specific device
url.searchParams.set('device', '8TD1G');

// Filter for all unidentified devices
url.searchParams.set('device', '__UNIDENTIFIED__');
```

## Complete Example

```javascript
async function getAnalytics(profileId, options = {}) {
  const url = new URL(`https://api.nextdns.io/profiles/${profileId}/analytics/domains`);

  // Date range
  if (options.from) url.searchParams.set('from', options.from);
  if (options.to) url.searchParams.set('to', options.to);

  // Filtering
  if (options.device) url.searchParams.set('device', options.device);
  if (options.status) url.searchParams.set('status', options.status);

  // Pagination
  if (options.limit) url.searchParams.set('limit', options.limit.toString());
  if (options.cursor) url.searchParams.set('cursor', options.cursor);

  const response = await fetch(url, {
    headers: { 'X-Api-Key': process.env.NEXTDNS_API_KEY },
  });

  return response.json();
}

// Usage
const data = await getAnalytics('abc123', {
  from: '-7d',
  to: 'now',
  device: '8TD1G',
  limit: 100,
});

// Paginate through all results
let allData = [];
let cursor = null;

do {
  const response = await getAnalytics('abc123', {
    from: '-7d',
    limit: 100,
    cursor,
  });

  allData = allData.concat(response.data);
  cursor = response.meta?.pagination?.cursor;
} while (cursor);
```

## Endpoint-Specific Parameters

### Domains Endpoint

```javascript
// Filter by status
url.searchParams.set('status', 'blocked'); // default | blocked | allowed

// Show root domains only
url.searchParams.set('root', 'true');
```

### Status Endpoint

No additional parameters.

### Reasons Endpoint

No additional parameters.

### Other Endpoints

Check specific endpoint documentation for additional parameters.

## Parameter Validation

```javascript
// ✅ Valid limit values
limit: 1; // Minimum
limit: 500; // Maximum
limit: 100; // Recommended for balance

// ❌ Invalid limit values
limit: 0; // Too small
limit: 1000; // Too large
limit: '50'; // Should be number in code, string in URL
```

## Response with Pagination

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

## Do NOT Use

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

## Reference

- [NextDNS API - Analytics](https://nextdns.github.io/api/#analytics)
