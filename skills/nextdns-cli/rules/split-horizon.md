---
title: 'Split-Horizon DNS'
impact: MEDIUM
impactDescription: 'Resolve internal network domains while using NextDNS'
type: capability
tags:
  - cli
  - split-horizon
  - internal-dns
  - forwarder
  - lan
---

# Split-Horizon DNS

Split-Horizon DNS allows you to resolve local network domains (like `home.lan` or `nas.local`) using
your local DNS server while forwarding all other traffic to NextDNS.

## Configuration via Forwarders

Use the `-forwarder` flag to point specific domains to a local resolver.

### Command Line

```bash
nextdns config set -forwarder lan=192.168.1.1,local=192.168.1.1
```

### In `nextdns.conf`

```text
forwarder lan=192.168.1.1
forwarder local=192.168.1.1
```

## Advanced Forwarding Features

- **Multiple Upstreams**: `lan=192.168.1.1,192.168.1.2` (provides failover).
- **Encrypted Forwarders**: You can point to another DoH provider:
  ```bash
  nextdns config set -forwarder google.com=https://dns.google/dns-query
  ```

## Best Practices

✅ **Short-circuit lookups**: Use `-bogus-priv` (default: true) to prevent private reverse lookups
(e.g., `168.192.in-addr.arpa`) from leaking to NextDNS.

✅ **Hosts File**: Enable `use-hosts` (default: true) to ensure `/etc/hosts` entries on the router
are respected before any network query.

## Reference

- [NextDNS CLI Wiki - Split-Horizon](https://github.com/nextdns/nextdns/wiki/Split-Horizon)
