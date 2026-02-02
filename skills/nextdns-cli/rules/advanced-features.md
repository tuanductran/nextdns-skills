---
title: Advanced Features
impact: HIGH
impactDescription: Advanced routing, conditional forwarders, and caching configurations
type: capability
tags: conditional forwarder, MAC address, subnet, routing, client detection, split-horizon, cache
---

# Advanced Features

**Impact: HIGH** - Complex routing and performance optimizations

NextDNS CLI provides advanced features for complex network environments and performance tuning.

## Split-Horizon (Conditional Forwarding)

Route specific domains to different DNS servers (e.g., internal company domains).

```bash
sudo nextdns config set \
    -forwarder mycompany.com=1.2.3.4,1.2.3.5 \
    -forwarder mycompany2.com=https://doh.mycompany.com/dns-query#1.2.3.4
sudo nextdns restart
```

## Conditional Profile Selection

Apply different NextDNS profiles based on the client's subnet or MAC address. This is powerful for router-level installations.

```bash
sudo nextdns config set \
    -profile 10.0.4.0/24=12345 \
    -profile 00:1c:42:2e:60:4a=67890 \
    -profile abcdef  # Default profile for everyone else
sudo nextdns restart
```

## Cache Configuration

Enable local memory caching to improve performance and provide resilience if upstream is temporarily unavailable.

```bash
# Enable 10MB cache (sufficient for most users)
sudo nextdns config set -cache-size=10MB

# Cap the maximum age of entries in the local cache
sudo nextdns config set -cache-max-age=1h

# Force clients to use a low TTL (e.g., 5s) to bypass client-side caching
# This ensures changes in the NextDNS dashboard apply quickly to all devices
sudo nextdns config set -max-ttl=5s

sudo nextdns restart
```

## Other Advanced Flags

- **`-bogus-priv`**: Block reverse lookups for private IP ranges (default: `true`).
- **`-detect-captive-portals`**: Automatic detection and fallback on system DNS for captive portal login.
- **`-timeout`**: Maximum duration allowed for a request (default: `5s`).
- **`-max-inflight-requests`**: Maximum simultaneous requests (default: `256`).

## Using Another DoH Provider

NextDNS CLI can act as a proxy for any DoH provider:

```bash
sudo nextdns config set -profile=https://dns.google/dns-query
sudo nextdns restart
```
