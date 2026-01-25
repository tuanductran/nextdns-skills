---
title: Best Practices
impact: MEDIUM
impactDescription: Optimization, security, and performance recommendations for the CLI
type: efficiency
tags: performance, security, optimization, best practices
---

# Best Practices

**Impact: MEDIUM** - Optimizing your NextDNS CLI setup for stability and speed

Follow these recommendations to get the most out of your NextDNS CLI installation.

## Performance Optimization

### 1. Enable Caching
Local caching significantly reduces latency by avoiding unnecessary network round-trips for repeated queries.
```bash
sudo nextdns config set -cache-size=10MB
sudo nextdns restart
```

### 2. Lower Client TTL
Use `-max-ttl` to prevent devices on your network from caching DNS records for too long. This ensures changes in your NextDNS web dashboard apply quickly.
```bash
# Set client-side TTL to 5 seconds
sudo nextdns config set -max-ttl=5s
sudo nextdns restart
```

### 3. Use EDNS Client Subnet (ECS)
EDNS allows NextDNS to see which regional network you are on, helping CDNs (like Netflix or Akamai) serve content from the closest server to you.
```bash
# Optimization: This is usually enabled by default in the CLI for performance.
sudo nextdns config set -report-client-info=true
```

## Reliability and Resilience

### 1. Multiple Forwarders
If you use split-horizon DNS, specify multiple local servers for failover.
```bash
sudo nextdns config set -forwarder local.domain=192.168.1.1,192.168.1.2
```

### 2. Auto-Activation
Ensure NextDNS takes over system DNS automatically at boot.
```bash
sudo nextdns config set -auto-activate=true
```

## Security

### 1. Avoid Fallback (Unless Necessary)
Be cautious with `-detect-captive-portals`. While useful at hotels, it can allow an attacker to force your DNS to leak unencrypted traffic. Only enable it when needed.

### 2. Device Identification
Always enable `-report-client-info=true`. This allows you to identify which specific device on your network is making a request in the NextDNS dashboard, making it much easier to debug which device is compromised or misconfigured.

## Maintenance

- **Regular Upgrades**: Periodically run the installer script to check for newer versions of the CLI.
- **Log Management**: If query logging is enabled, monitor your disk space, or use the default mDNS discovery which provides identification without excessive logging.
