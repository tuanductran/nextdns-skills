---
title: 'Backup and Failover Configuration'
impact: HIGH
impactDescription: 'Ensure continuous internet access even if NextDNS is unreachable'
type: efficiency
tags:
  - failover
  - backup-dns
  - redundancy
  - reliability
  - availability
---

# Backup and Failover Configuration

A resilient network configuration ensures that DNS resolution continues even if the primary NextDNS
connection is interrupted.

## Why Redundancy Matters

DNS is a single point of failure. If your router is configured _only_ to use NextDNS and the service
or your connection to it fails, all internet access on your network will appear "down."

## Implementation Strategies

### 1. Router-Level Local Failover (Recommended)

Most advanced routers (OpenWrt, pfSense, EdgeRouter) allow multiple DNS upstreams. Configure NextDNS
as the primary and a privacy-respecting public DNS as a secondary.

✅ **Primary**: `45.90.28.abc (NextDNS Anycast/Linked IP)` ✅ **Secondary**: `9.9.9.9 (Quad9)` or
`1.1.1.1 (Cloudflare)`

### 2. NextDNS CLI Multi-Server

The NextDNS CLI supports multiple server definitions for the same domain or as a global failover.

```bash
nextdns config set -forwarder=https://dns.nextdns.io,https://dns.google/dns-query
```

### 3. Client-Level Fallback

Operating systems (Windows, macOS, iOS, Android) often attempt to query multiple DNS servers if the
first one times out. Adding a secondary DNS server in your DHCP settings provides this safety net.

## The "DNS Leak" Warning

⚠️ **Caution**: Adding a non-NextDNS secondary server (like 8.8.8.8) may lead to "DNS leaks" where
some queries bypass NextDNS filtering even when it is online. This happens because some OS
algorithms query all available servers and use the fastest response.

## Strategic Recommendation

- **For maximum privacy**: Use only NextDNS across multiple bootstrap IPs or DoH endpoints.
- **For maximum availability**: Use NextDNS as primary and Quad9 (which also blocks malware) as
  secondary.

## Reference

- [NextDNS Help Center - Reliability](https://help.nextdns.io/)
