---
title: "DD-WRT Installation"
impact: HIGH
impactDescription: "Without proper JFFS setup and installation procedures, NextDNS CLI will fail to persist on DD-WRT routers, causing DNS configuration loss after reboots and potential certificate errors due to time sync issues."
type: capability
tags: "DD-WRT, JFFS, router, NTP, time sync, dnsmasq, SSH, router installation"
---
# DD-WRT Installation

**Impact: HIGH** - Essential setup for NextDNS CLI on DD-WRT routers with persistent configuration

NextDNS CLI has no native GUI support on DD-WRT and must be installed on JFFS storage to ensure persistence across reboots. Proper setup requires enabling JFFS, configuring time synchronization, and protecting custom DNS settings.

## Pre-requisites

- NextDNS CLI has no native GUI support on DD-WRT
- Must be installed on JFFS (JFFS2 filesystem) for persistence
- Requires SSH access to the router
- Router must have sufficient JFFS storage space

## JFFS Enablement

JFFS must be enabled and properly wiped before installing NextDNS CLI:

1. Navigate to **Administration** > **Management** in the DD-WRT web GUI
2. Locate the **JFFS2 Support** section
3. Enable the following options:
    - **Enable JFFS2**: Set to **Enable**
    - **Clean JFFS2**: Set to **Enable** (only for initial setup or when wiping data)
4. Click **Apply Settings**
5. Wait for the router to process the changes
6. After the flash storage is wiped, disable **Clean JFFS2** and click **Apply Settings** again
7. Reboot the router to ensure JFFS is mounted properly

**Important**: The "Clean JFFS2" option should only be enabled once during initial setup. Leaving it enabled will erase JFFS contents on every reboot.

## Installation and Upgrade

Connect to your DD-WRT router via SSH and run the universal installer:

```bash
sh -c "$(curl -sL https://nextdns.io/install)"
```

The installer will:
- Detect DD-WRT as the platform
- Install NextDNS CLI to `/jffs/nextdns/`
- Configure the service to start automatically
- Set up integration with dnsmasq

### Upgrading

To upgrade an existing NextDNS CLI installation, re-run the same installer command:

```bash
sh -c "$(curl -sL https://nextdns.io/install)"
```

The installer automatically detects existing installations and performs an upgrade.

## Time Sync Workaround

DD-WRT may experience x509 certificate errors during boot due to incorrect system time. To prevent this, configure an NTP forwarder:

```bash
/jffs/nextdns/nextdns config set forwarder 2.pool.ntp.org
```

This ensures that NTP queries for `2.pool.ntp.org` are forwarded to your upstream DNS, preventing certificate validation failures during the boot sequence when the system clock hasn't synchronized yet.

## dnsmasq Persistence

NextDNS CLI modifies the default dnsmasq configuration. To protect custom dnsmasq settings and ensure they persist across NextDNS updates:

1. Create a persistent dnsmasq configuration file:

    ```bash
    mkdir -p /jffs/etc
    touch /jffs/etc/dnsmasq.conf
    ```

2. Add your custom dnsmasq settings to `/jffs/etc/dnsmasq.conf`:

    ```conf
    # Example custom settings
    dhcp-option=option:router,192.168.1.1
    dhcp-option=option:dns-server,127.0.0.1
    ```

3. This file will be preserved when NextDNS CLI updates or modifies the main dnsmasq configuration

**Why this matters**: NextDNS CLI edits the default dnsmasq configuration during installation and updates. Using a separate persistent file ensures your custom settings are not overwritten.

## Troubleshooting

If you encounter issues during installation, run the installer in debug mode to get detailed diagnostic output:

```bash
DEBUG=1 sh -c "$(curl -sL https://nextdns.io/install)"
```

Common issues and solutions:

- **JFFS not mounted**: Verify JFFS is enabled in Administration > Management and reboot the router
- **Installation fails**: Ensure you have sufficient JFFS storage space using `df -h /jffs`
- **Certificate errors**: Apply the NTP forwarder workaround described above
- **dnsmasq conflicts**: Check `/tmp/dnsmasq.conf` for conflicts with existing rules

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [DD-WRT Documentation](https://wiki.dd-wrt.com/)
