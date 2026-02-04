---
title: 'CLI Configuration File Format'
impact: MEDIUM
impactDescription: 'Directly manage the nextdns.conf file for advanced automation'
type: capability
tags:
  - cli
  - config
  - automation
  - configuration-file
---

# CLI Configuration File Format

The NextDNS CLI stores its settings in a simple key-value format. Understanding this file is
essential for infrastructure-as-code and advanced automation.

## File Location

- **Linux/Unix**: `/etc/nextdns.conf`
- **macOS**: `/Library/Application Support/NextDNS/nextdns.conf`

## Format Structure

The file consists of flags without the leading dash, followed by the value.

### Example `nextdns.conf`

```text
profile abc123
report-client-info true
auto-activate true
setup-router true
listen :53
cache-size 10MB
cache-max-age 5m
```

## Conditional Profiles

You can specify multiple profiles based on conditions directly in the file:

```text
# Profile for specific IoT subnet
profile 192.168.2.0/24=def456
# Profile for specific device via MAC
profile 00:1c:42:2e:60:4a=ghi789
# Default profile
profile abc123
```

## Management via CLI

While you can edit the file manually, it is safer to use the built-in commands:

- **View current file path**: `nextdns config`
- **Edit in default editor**: `nextdns config edit`
- **Set specific value**: `nextdns config set -log-queries=true`

## Reference

- [NextDNS CLI Wiki - Configuration File Format](https://github.com/nextdns/nextdns/wiki/Configuration-File-Format)
