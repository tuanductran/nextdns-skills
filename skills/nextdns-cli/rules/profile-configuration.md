---
title: Profile Configuration
impact: HIGH
impactDescription: Managing NextDNS profile IDs and general configuration settings
type: capability
tags: config, profile ID, configuration set, edit config
---

# Profile Configuration

**Impact: HIGH** - Managing core NextDNS profile and service settings

The CLI uses specific flags to connect to your NextDNS cloud dashboard and control local proxy behavior.

## Setting the Profile ID

Setting the primary NextDNS profile is the most important configuration step:

```bash
# Set the primary profile ID
sudo nextdns config set -profile=abc123
```bash

## Configuration Management

| Command | Description |
|---------|-------------|
| `nextdns config set [flags]` | Sets specific configuration values. |
| `nextdns config edit` | Opens the configuration file in a text editor for manual editing. |
| `nextdns config list` | Lists all current configuration values. |

## Common Configuration Flags

- **`-profile`**: Your NextDNS configuration ID (e.g., `abc123`).
- **`-report-client-info`**: Enable this to see device names in your NextDNS dashboard (`true`/`false`).
- **`-auto-activate`**: Automatically set system DNS to 127.0.0.1 on start.
- **`-setup-router`**: Automatically configure for router setups (integrates with many router firmwares).
- **`-use-hosts`**: Lookup `/etc/hosts` before sending queries upstream (default: `true`).
- **`-mdns`**: Enable mDNS to discover client information (default: `"all"`).

## Manual Editing

If you use `nextdns config edit`, the file format is a simple list of flags:

```conf
profile abc123
report-client-info true
auto-activate true
```text

**Note**: After editing the configuration file manually or using `config set`, you typically need to `nextdns restart` for the changes to take effect.
