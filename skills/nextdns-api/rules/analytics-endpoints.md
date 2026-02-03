---
title: "Analytics Endpoints"
impact: HIGH
impactDescription: "Access various analytics endpoints for DNS query insights"
type: capability
tags: "analytics, status, domains, reasons, devices, protocols, query types, destinations"
---
# Analytics Endpoints

**Impact: HIGH** - Access comprehensive DNS analytics data

## Available Endpoints

All analytics endpoints follow the pattern:

```text
https://api.nextdns.io/profiles/:profile/analytics/{endpoint}
```

## Status Analytics

Query distribution by status (blocked, allowed, default):

```javascript
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/status?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

// Response
{
  "data": [
    { "status": "default", "queries": 819491 },
    { "status": "blocked", "queries": 132513 },
    { "status": "allowed", "queries": 6923 }
  ]
}
```

## Domains Analytics

Top queried domains:

```javascript
// All domains
const domains = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d&limit=50',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Blocked domains only
const blocked = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?status=blocked&from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Root domains only
const roots = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?root=true&from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    {
      "domain": "app-measurement.com",
      "queries": 29801
    },
    {
      "domain": "gateway.icloud.com",
      "root": "icloud.com",
      "queries": 18468
    }
  ]
}
```

## Blocking Reasons

Why domains were blocked:

```javascript
const reasons = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/reasons?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    {
      "id": "blocklist:nextdns-recommended",
      "name": "NextDNS Ads & Trackers Blocklist",
      "queries": 131833
    },
    {
      "id": "native:apple",
      "name": "Native Tracking (Apple)",
      "queries": 402
    },
    {
      "id": "disguised-trackers",
      "name": "Disguised Third-Party Trackers",
      "queries": 269
    }
  ]
}
```

## Client IPs

Query distribution by IP address:

```javascript
const ips = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/ips?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    {
      "ip": "91.171.12.34",
      "network": {
        "cellular": false,
        "vpn": false,
        "isp": "Free",
        "asn": 12322
      },
      "geo": {
        "latitude": 48.8998,
        "longitude": 2.703,
        "countryCode": "FR",
        "country": "France",
        "city": "Gagny"
      },
      "queries": 136935
    }
  ]
}
```

## Devices

Query distribution by device:

```javascript
const devices = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/devices?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    {
      "id": "8TD1G",
      "name": "Romain's iPhone",
      "model": "iPhone 12 Pro Max",
      "queries": 489885
    },
    {
      "id": "E24AR",
      "name": "MBP",
      "model": "MacBook Pro",
      "localIp": "192.168.0.11",
      "queries": 215663
    },
    {
      "id": "__UNIDENTIFIED__",
      "queries": 74242
    }
  ]
}
```

## Protocols

Query distribution by DNS protocol:

```javascript
const protocols = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/protocols?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "protocol": "DNS-over-HTTPS", "queries": 958757 },
    { "protocol": "DNS-over-TLS", "queries": 39582 },
    { "protocol": "UDP", "queries": 2334 }
  ]
}
```

## Query Types

Distribution by DNS record type:

```javascript
const queryTypes = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/queryTypes?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "type": 28, "name": "AAAA", "queries": 356230 },
    { "type": 1, "name": "A", "queries": 341812 },
    { "type": 65, "name": "HTTPS", "queries": 260478 }
  ]
}
```

## IP Versions

IPv4 vs IPv6 distribution:

```javascript
const ipVersions = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/ipVersions?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "version": 6, "queries": 784154 },
    { "version": 4, "queries": 174308 }
  ]
}
```

## DNSSEC

DNSSEC validation statistics:

```javascript
const dnssec = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/dnssec?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "validated": false, "queries": 817664 },
    { "validated": true, "queries": 8199 }
  ]
}
```

## Encryption

Encrypted vs unencrypted queries:

```javascript
const encryption = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/encryption?from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "encrypted": true, "queries": 958331 },
    { "encrypted": false, "queries": 1 }
  ]
}
```

## Destinations - Countries

Query destinations by country:

```javascript
const countries = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/destinations?type=countries&from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    {
      "code": "US",
      "domains": [
        "app.smartmailcloud.com",
        "imap.gmail.com",
        "api.coinbase.com"
      ],
      "queries": 209851
    },
    {
      "code": "FR",
      "domains": [
        "inappcheck.itunes.apple.com",
        "iphone-ld.apple.com"
      ],
      "queries": 105497
    }
  ]
}
```

## Destinations - GAFAM

Queries to big tech companies:

```javascript
const gafam = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/destinations?type=gafam&from=-7d',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// Response
{
  "data": [
    { "company": "others", "queries": 478732 },
    { "company": "apple", "queries": 284832 },
    { "company": "google", "queries": 159488 },
    { "company": "facebook", "queries": 45123 },
    { "company": "amazon", "queries": 32456 },
    { "company": "microsoft", "queries": 28901 }
  ]
}
```

## Helper Function

```javascript
async function getAnalytics(profileId, endpoint, params = {}) {
  const url = new URL(`https://api.nextdns.io/profiles/${profileId}/analytics/${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.NEXTDNS_API_KEY }
  });
  
  return response.json();
}

// Usage
const status = await getAnalytics('abc123', 'status', { from: '-7d' });
const blockedDomains = await getAnalytics('abc123', 'domains', { 
  status: 'blocked', 
  from: '-30d',
  limit: 100
});
```

## Reference

- [NextDNS API - Analytics Endpoints](https://nextdns.github.io/api/#endpoints)
