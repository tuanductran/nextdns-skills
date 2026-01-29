---
name: nextdns-cli
description: NextDNS CLI client best practices for installation, configuration, and management of DNS-over-HTTPS proxy. This skill should be used when installing NextDNS on routers, servers, or client devices, configuring DNS settings, managing the daemon, or troubleshooting DNS issues. Triggers on tasks involving NextDNS CLI installation, daemon control, system configuration, or DNS proxy setup.
license: MIT
metadata:
  author: tuanductran
  version: "1.0.0"
---

# NextDNS CLI Skills

## Capability Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [installation](rules/installation.md) | install, setup, curl, nextdns install | Install NextDNS CLI on various platforms |
| [daemon-control](rules/daemon-control.md) | start, stop, restart, status, daemon | Control NextDNS daemon service |
| [system-configuration](rules/system-configuration.md) | activate, deactivate, DNS resolver | Configure system DNS settings |
| [profile-configuration](rules/profile-configuration.md) | config, profile ID, settings | Configure NextDNS profile and settings |
| [advanced-features](rules/advanced-features.md) | conditional forwarder, MAC address, subnet | Advanced routing and filtering |
| [monitoring](rules/monitoring.md) | log, cache-stats, discovered clients | Monitor and debug DNS queries |
| [platform-specific](rules/platform-specific.md) | router, OpenWrt, pfSense, Synology | Platform-specific configurations |
| [ddwrt-installation](rules/ddwrt-installation.md) | DD-WRT, JFFS, NTP, router, time sync, dnsmasq | DD-WRT router installation and setup |
| [troubleshooting](rules/troubleshooting.md) | diagnostic, connection test, DNS leak | Troubleshoot DNS issues |

## Efficiency Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [upgrade-uninstall](rules/upgrade-uninstall.md) | upgrade, uninstall, remove | Upgrade or remove NextDNS CLI |
| [best-practices](rules/best-practices.md) | performance, security, optimization | CLI best practices and tips |

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [NextDNS Documentation](https://help.nextdns.io)
