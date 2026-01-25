---
title: System Configuration
impact: HIGH
impactDescription: Configuring local system DNS settings to use NextDNS
type: capability
tags: activate, deactivate, DNS resolver, system dns
---

# System Configuration

**Impact: HIGH** - Modifying system-wide DNS resolver settings

The `nextdns` command can automatically manage the local machine's DNS settings to point to the local proxy.

## Activating NextDNS

To point your local system resolver to the NextDNS CLI proxy:

```bash
sudo nextdns activate
```

This command will:
- Modify `/etc/resolv.conf` on Linux/macOS.
- Update DNS settings for active network interfaces on Windows.
- Ensure all system DNS traffic is routed through the local NextDNS proxy.

## Deactivating NextDNS

To restore the system's original DNS settings:

```bash
sudo nextdns deactivate
```

This should be used if you want to bypass the local proxy or if you are uninstalling the CLI.

## Auto-Activation

You can configure the daemon to automatically activate/deactivate at startup and exit:

```bash
sudo nextdns config set -auto-activate=true
```

## Troubleshooting Activation

If `nextdns activate` fails or if the system is still using old DNS servers:
1. Check if `systemd-resolved` is overriding the settings (Linux).
2. Ensure no other VPN or DNS software is managing the network settings.
3. Use `nslookup google.com` or `dig google.com` to verify which server is being used.
4. Run `nextdns status` to ensure the proxy is actually running on port 53.
