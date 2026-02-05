---
title: 'Conditional Profile Configuration'
impact: HIGH
impactDescription: 'Identifies and applies specific profiles to different LAN clients'
type: capability
tags:
  - cli
  - profile
  - conditional
  - subnet
  - mac-address
---

# Conditional Profile Configuration

Configure the NextDNS CLI to apply different profiles based on LAN client subnets or MAC addresses.

## Overview

When running as a network-wide resolver (on a router or central server), the NextDNS CLI can
distinguish between clients and apply specific filtering policies beyond the default profile.

## Correct Usage

### Implementation via CLI

Specify the `-profile` parameter multiple times with prefixes or MAC addresses.

```bash
# ✅ Set multiple conditional profiles
# - 10.0.4.0/24 subnet uses profile 123456
# - MAC 00:1c:42:2e:60:4a uses profile 789012
# - Default for everyone else is abc123
sudo nextdns config set \
    -profile 10.0.4.0/24=123456 \
    -profile 00:1c:42:2e:60:4a=789012 \
    -profile abc123

# Restart to apply
sudo nextdns restart
```

### In configuration file

You can also define these in `/etc/nextdns.conf`.

```conf
# ✅ Multiple profile lines or comma-separated
profile 10.0.4.0/24=123456
profile 00:1c:42:2e:60:4a=789012
profile abc123
```

## Do NOT Use

❌ **Incorrect Syntax**: Do not use equal signs inside the Profile ID itself or miss the default
catch-all profile.

```bash
# ❌ Incorrect: Missing default profile or malformed condition
sudo nextdns config set -profile 10.0.4.0/24:123456
```

## Best Practices

- **Order Matters**: Define specific targets (MAC addresses) before broader ones (subnets) if there
  is overlap.
- **Catch-all**: Always include a standalone profile ID as the fallback for all other traffic.
- **Reporting**: Combine with `-report-client-info` to see client names in the dashboard.

## Reference

- [NextDNS CLI Wiki - Conditional Profile](https://github.com/nextdns/nextdns/wiki/Conditional-Profile)
