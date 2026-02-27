---
title: 'Profile Settings'
impact: HIGH
impactDescription:
  'Misconfigured settings silently affect log retention, privacy, and DNS performance across all
  queries'
type: capability
tags:
  - settings
  - logs
  - log retention
  - log location
  - performance
  - cache boost
  - cname flattening
---

<!-- @case-police-ignore Api -->

# Profile settings

Manage profile-level settings via the NextDNS API

## Overview

The `/profiles/{id}/settings` endpoint controls profile-wide behaviour that applies to every DNS
query: logging, performance optimisations, block page, and Web3 resolution. Use GET to inspect
current settings and PATCH to update individual fields without affecting others.

## Correct usage

### Get current settings

```javascript
// ✅ Retrieve all settings for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
```

### Update logging settings

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

### Update performance settings

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

### Disable block page

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

## Settings reference

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

## Do NOT Use

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

## Best practices

- **PATCH only what changes**: Pass only the keys you want to update; unspecified keys retain their
  current values.
- **Use Swiss (`ch`) or French (`fr`) storage for GDPR compliance**: Log location affects data
  residency; choose a region appropriate for your users.
- **Set `logs.drop.ip` for privacy**: Prevents client IPs from being stored, reducing PII exposure
  without disabling logs entirely.
- **Test performance settings in isolation**: Enable `cacheBoost` and `cnameFlattening` one at a
  time to isolate any compatibility issues.

## Troubleshooting

### Issue: patch returns 400 on log retention value

**Symptoms**: `{"errors": {"logs.retention": "invalid"}}`.

**Solution**: Use only the allowed retention values (in seconds): `0`, `3600`, `21600`, `86400`,
`604800`, `2592000`, `15552000`, `31536000`.

### Issue: settings update succeeds but behaviour does NOT change

**Symptoms**: Response is `200 OK` but the feature does not activate.

**Solution**: Retrieve the settings with GET to confirm the value was stored, then test DNS
resolution from a device actually using the profile.

```javascript
// Verify settings were applied
const check = await fetch('https://api.nextdns.io/profiles/abc123/settings', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
}).then((r) => r.json());

console.log(check.data);
```

## Reference

- [NextDNS API — Settings](https://nextdns.github.io/api/#settings)
- [NextDNS Help Center](https://help.nextdns.io)
