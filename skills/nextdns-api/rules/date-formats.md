---
title: 'Date Formats'
impact: HIGH
impactDescription: 'Use correct date formats in query parameters'
type: capability
tags:
  - date format
  - ISO 8601
  - UNIX timestamp
  - relative dates
  - date parsing
---

# Date Formats

Use correct date formats for time-based queries

## Supported Date Formats

The NextDNS API accepts multiple date formats:

### 1. ISO 8601

Standard ISO 8601 format with timezone:

```javascript
from: '2024-01-15T16:34:05.203Z';
from: '2024-01-15T16:34:05Z';
from: '2024-01-15T00:00:00Z';
```

### 2. UNIX Timestamp (Seconds)

```javascript
from: 1615826071;
from: '1615826071';
```

### 3. UNIX Timestamp (Milliseconds)

```javascript
from: 1615826071284;
from: '1615826071284';
```

### 4. Relative Dates

Most convenient for recent data:

```javascript
// Hours
from: '-1h'; // 1 hour ago
from: '-6h'; // 6 hours ago
from: '-24h'; // 24 hours ago

// Days
from: '-1d'; // 1 day ago
from: '-7d'; // 7 days ago
from: '-30d'; // 30 days ago

// Months
from: '-1M'; // 1 month ago
from: '-3M'; // 3 months ago
from: '-6M'; // 6 months ago

// Years
from: '-1y'; // 1 year ago

// Now
from: 'now'; // Current time
```

### 5. Common Date Formats

```javascript
from: '2024-01-15';
from: '2024-01-15 16:34:05';
```

## Usage Examples

### Last 7 Days

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/status?from=-7d&to=now',
  { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
);
```

### Specific Date Range

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=2024-01-01&to=2024-01-31',
  { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
);
```

### Last 24 Hours

```javascript
const response = await fetch('https://api.nextdns.io/profiles/abc123/logs?from=-24h', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

### Custom Time Range

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/devices?from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z',
  { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
);
```

## Helper Functions

### JavaScript

```javascript
// Get ISO 8601 string
const now = new Date().toISOString();
// "2024-01-15T16:34:05.203Z"

// Get UNIX timestamp (seconds)
const unixSeconds = Math.floor(Date.now() / 1000);
// 1615826071

// Get UNIX timestamp (milliseconds)
const unixMs = Date.now();
// 1615826071284

// Get date N days ago
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const sevenDaysAgo = daysAgo(7);

// Format date for API
function formatDateForApi(date) {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'number') {
    return date.toString();
  }
  return date;
}
```

### Python

```python
from datetime import datetime, timedelta
import time

# Get ISO 8601 string
now = datetime.utcnow().isoformat() + 'Z'
# "2024-01-15T16:34:05.203Z"

# Get UNIX timestamp (seconds)
unix_seconds = int(time.time())
# 1615826071

# Get UNIX timestamp (milliseconds)
unix_ms = int(time.time() * 1000)
# 1615826071284

# Get date N days ago
def days_ago(days):
    date = datetime.utcnow() - timedelta(days=days)
    return date.isoformat() + 'Z'

seven_days_ago = days_ago(7)

# Format date for API
def format_date_for_api(date):
    if isinstance(date, datetime):
        return date.isoformat() + 'Z'
    if isinstance(date, (int, float)):
        return str(int(date))
    return date
```

## Date Range Builder

```javascript
class DateRangeBuilder {
  constructor() {
    this.fromDate = null;
    this.toDate = null;
  }

  last(value, unit) {
    this.fromDate = `-${value}${unit}`;
    this.toDate = 'now';
    return this;
  }

  lastHours(hours) {
    return this.last(hours, 'h');
  }

  lastDays(days) {
    return this.last(days, 'd');
  }

  lastMonths(months) {
    return this.last(months, 'M');
  }

  from(date) {
    this.fromDate = this.formatDate(date);
    return this;
  }

  to(date) {
    this.toDate = this.formatDate(date);
    return this;
  }

  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'number') {
      return date.toString();
    }
    return date;
  }

  build() {
    return {
      from: this.fromDate,
      to: this.toDate,
    };
  }

  toQueryString() {
    const params = new URLSearchParams();
    if (this.fromDate) params.set('from', this.fromDate);
    if (this.toDate) params.set('to', this.toDate);
    return params.toString();
  }
}

// Usage
const range = new DateRangeBuilder().lastDays(7).build();
// { from: '-7d', to: 'now' }

const customRange = new DateRangeBuilder()
  .from(new Date('2024-01-01'))
  .to(new Date('2024-01-31'))
  .build();
// { from: '2024-01-01T00:00:00.000Z', to: '2024-01-31T00:00:00.000Z' }

const queryString = new DateRangeBuilder().lastHours(24).toQueryString();
// "from=-24h&to=now"
```

## Common Patterns

```javascript
// Last hour
{ from: '-1h', to: 'now' }

// Last 24 hours
{ from: '-24h', to: 'now' }

// Last 7 days
{ from: '-7d', to: 'now' }

// Last 30 days
{ from: '-30d', to: 'now' }

// Last month
{ from: '-1M', to: 'now' }

// This month
{
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  to: 'now'
}

// Yesterday
{
  from: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0]
}

// Today
{
  from: new Date().toISOString().split('T')[0],
  to: 'now'
}
```

## Do NOT Use

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

## Timezone Considerations

- All timestamps are in **UTC**
- ISO 8601 strings should include timezone (`Z` for UTC)
- Relative dates are calculated from current UTC time
- Use time series `timezone` parameter for local time alignment

## Best Practices

1. **Use relative dates** for recent data (`-7d`, `-24h`)
2. **Use ISO 8601** for specific dates
3. **Always include timezone** in ISO 8601 strings
4. **Use `now`** instead of calculating current time
5. **Cache date calculations** to avoid inconsistencies
6. **Validate date ranges** before making requests

## Reference

- [NextDNS API - Date Formats](https://nextdns.github.io/api/#date-format-in-query-parameters)
