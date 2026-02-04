---
title: 'CLI Cache Configuration'
impact: MEDIUM
impactDescription: 'Optimize DNS performance and latency with CLI caching'
type: capability
tags:
  - cli
  - cache
  - performance
  - latency
  - ttl
---

# CLI Cache Configuration

The NextDNS CLI features a sophisticated built-in cache to reduce latency and minimize upstream
queries.

## Cache Settings

You can configure the cache using the `nextdns config set` command:

### 1. Cache Size (`-cache-size`)

Sets the total size of the DNS cache.

- **Recommended**: `10MB` for home use, `50MB+` for large networks.
- **Command**: `nextdns config set -cache-size=10MB`
- **Note**: Set to `0` to disable caching.

### 2. Cache Max Age (`-cache-max-age`)

Overrides the record's TTL if the TTL is higher than this value.

- **Usage**: Useful for forcing faster profile changes.
- **Command**: `nextdns config set -cache-max-age=5m`

### 3. Maximum TTL (`-max-ttl`)

Defines the maximum TTL value handed out to clients.

- **Command**: `nextdns config set -max-ttl=5m`
- **Difference from Max Age**: `max-ttl` controls what the _client_ sees, while `cache-max-age`
  controls how long the _NextDNS CLI_ keeps it in its own cache.

## Optimization Strategy

✅ **Recommended Setup**:

```bash
nextdns config set -cache-size=10MB -cache-max-age=10m -max-ttl=5m
```

This ensures:

1. Speedy responses for frequent domains.
2. NextDNS CLI refreshes its data at least every 10 minutes.
3. Clients come back to the CLI every 5 minutes to check for updates.

## Verification

Check cache performance via status:

```bash
nextdns status
```

## Reference

- [NextDNS CLI Wiki - Cache Configuration](https://github.com/nextdns/nextdns/wiki/Cache-Configuration)
