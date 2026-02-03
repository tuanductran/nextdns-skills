---
title: "Upgrade and Uninstall"
impact: MEDIUM
impactDescription: "Safely updating or removing the NextDNS CLI service"
type: efficiency
tags: "upgrade, uninstall, remove, update"
---
# Upgrade and Uninstall

**Impact: MEDIUM** - Maintaining or cleaning up the NextDNS installation

To keep the NextDNS CLI secure and feature-rich, you should periodically check for updates.

## Upgrading

The easiest way to upgrade is to simply re-run the universal installation script:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

The installer will detect your existing installation and offer an **Upgrade** option if a newer version is available. It will preserve your configuration settings.

## Uninstalling

To remove NextDNS CLI from your system, use the same universal script:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

1. Select the **Uninstall** option from the menu.
2. The script will:
    - Stop the daemon.
    - Remove the service from the system (systemd, launchd, etc.).
    - Restore original system DNS settings (equivalent to `nextdns deactivate`).
    - Remove the binary from your system path.

### Manual Deactivation (Before Uninstall)

It is good practice to run `sudo nextdns deactivate` before a manual uninstallation to ensure your system DNS is not left pointing to a non-existent local proxy.

## Troubleshooting Upgrades

If an upgrade fails:
1. Try to uninstall first and then perform a fresh installation.
2. Check for residual files in `/etc/nextdns.conf` or the binary location (usually `/usr/local/bin/nextdns` or `/usr/bin/nextdns`).
3. Ensure no other process is locking the configuration file or the service manager.
