---
title: Time Series Data
impact: HIGH
impactDescription: Retrieve time series data for charts and visualizations
type: capability
tags: time series, charts, interval, alignment, timezone, tumbling windows
---

# Time Series Data

**Impact: HIGH** - Get time series data for creating charts and trend analysis

## Time Series Endpoints

Append `;series` to any analytics endpoint to get time series data:

```text
/profiles/:profile/analytics/status;series
/profiles/:profile/analytics/domains;series
/profiles/:profile/analytics/protocols;series
```bash

## Basic Usage

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/queryTypes;series?from=-7d&interval=1d&limit=2',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

const data = await response.json();
```bash

## Response Format

Instead of single `queries` value, you get an array:

```javascript
{
  "data": [
    {
      "type": 28,
      "name": "AAAA",
      "queries": [4019, 5801, 2667, 2817, 3314, 3128, 3810]
    },
    {
      "type": 1,
      "name": "A",
      "queries": [3873, 5421, 2691, 2865, 3387, 3192, 3864]
    }
  ],
  "meta": {
    "series": {
      "times": [
        "2021-03-08T16:51:36.623Z",
        "2021-03-09T16:51:36.623Z",
        "2021-03-10T16:51:36.623Z",
        "2021-03-11T16:51:36.623Z",
        "2021-03-12T16:51:36.623Z",
        "2021-03-13T16:51:36.623Z",
        "2021-03-14T16:51:36.623Z"
      ],
      "interval": 86400  // Duration in seconds of each window
    },
    "pagination": {
      "cursor": "jS8sl16m"
    }
  }
}
```bash

## Query Parameters

### interval

Type: Seconds | Duration

Control the size of each time window:

```javascript
// By seconds
interval: 3600    // 1 hour
interval: 86400   // 1 day

// By duration string
interval: '1h'    // 1 hour
interval: '1d'    // 1 day
interval: '1w'    // 1 week
```yaml

If not specified, API chooses appropriate interval based on date range.

### alignment

Values: `start` | `end` | `clock`
Default: `end`

Control how windows are aligned:

```javascript
// Align to end of period (default)
alignment: 'end'

// Align to start of period
alignment: 'start'

// Align to clock (useful with timezone)
alignment: 'clock'
```bash

### timezone

Type: TimeZone (IANA timezone name)
Default: `GMT`

Use with `alignment=clock` to align windows to local time:

```javascript
// Align to midnight in Paris
timezone: 'Europe/Paris'
alignment: 'clock'

// Align to midnight in New York
timezone: 'America/New_York'
alignment: 'clock'

// Get timezone in JavaScript
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// "Europe/Paris"
```bash

### partials

Values: `none` | `start` | `end` | `all`
Default: `none`

Include partial windows at start/end:

```javascript
// No partial windows (default)
partials: 'none'

// Include partial window at start
partials: 'start'

// Include partial window at end
partials: 'end'

// Include both
partials: 'all'
```bash

## Complete Example

```javascript
async function getTimeSeries(profileId, endpoint, options = {}) {
  const url = new URL(
    `https://api.nextdns.io/profiles/${profileId}/analytics/${endpoint};series`
  );
  
  // Date range
  url.searchParams.set('from', options.from || '-7d');
  url.searchParams.set('to', options.to || 'now');
  
  // Time series parameters
  if (options.interval) url.searchParams.set('interval', options.interval);
  if (options.alignment) url.searchParams.set('alignment', options.alignment);
  if (options.timezone) url.searchParams.set('timezone', options.timezone);
  if (options.partials) url.searchParams.set('partials', options.partials);
  
  // Other parameters
  if (options.limit) url.searchParams.set('limit', options.limit.toString());
  if (options.device) url.searchParams.set('device', options.device);
  
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.NEXTDNS_API_KEY }
  });
  
  return response.json();
}

// Usage: Last 7 days, 1 day intervals, aligned to midnight in Paris
const data = await getTimeSeries('abc123', 'status', {
  from: '-7d',
  interval: '1d',
  alignment: 'clock',
  timezone: 'Europe/Paris'
});

// Usage: Last 24 hours, 1 hour intervals
const hourly = await getTimeSeries('abc123', 'protocols', {
  from: '-24h',
  interval: '1h'
});
```bash

## Creating Charts

```javascript
async function createChart(profileId) {
  const data = await getTimeSeries('abc123', 'status', {
    from: '-7d',
    interval: '1d',
    limit: 10
  });
  
  const times = data.meta.series.times;
  const datasets = data.data.map(item => ({
    label: item.status,
    data: item.queries
  }));
  
  // Use with Chart.js, Recharts, etc.
  return {
    labels: times.map(t => new Date(t).toLocaleDateString()),
    datasets
  };
}
```bash

## Common Intervals

```javascript
// Hourly for last 24 hours
{ from: '-24h', interval: '1h' }

// Daily for last week
{ from: '-7d', interval: '1d' }

// Daily for last month
{ from: '-30d', interval: '1d' }

// Weekly for last 3 months
{ from: '-90d', interval: '1w' }

// Monthly for last year
{ from: '-1y', interval: '30d' }
```bash

## Timezone Examples

```javascript
// Common timezones
'America/New_York'
'America/Los_Angeles'
'Europe/London'
'Europe/Paris'
'Asia/Tokyo'
'Asia/Shanghai'
'Australia/Sydney'
'UTC'
'GMT'

// Get user's timezone in browser
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```bash

## Do NOT Use

```javascript
// ❌ Forgetting ;series suffix
'/profiles/abc123/analytics/status?interval=1d'

// ✅ Correct
'/profiles/abc123/analytics/status;series?interval=1d'

// ❌ Invalid timezone format
timezone: 'PST'  // Use IANA names

// ✅ Correct
timezone: 'America/Los_Angeles'

// ❌ Invalid interval
interval: '1 day'  // No spaces

// ✅ Correct
interval: '1d'
interval: 86400
```bash

## Best Practices

1. **Choose appropriate intervals**: Don't use 1-hour intervals for 1-year ranges
2. **Use clock alignment** for daily reports to align with user's day
3. **Specify timezone** when alignment is `clock`
4. **Handle partial windows** based on your use case
5. **Cache results** for expensive queries
6. **Limit data points** for better performance (typically 50-100 points max for charts)

## Reference

- [NextDNS API - Time Series](https://nextdns.github.io/api/#time-series)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
