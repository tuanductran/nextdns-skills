---
name: integrations
description: NextDNS integration guides for third-party platforms and services. This skill should be used when integrating NextDNS with routers, home automation systems, network management platforms, or other third-party services. Triggers on tasks involving Tailscale, Home Assistant, Ubiquiti, pfSense, OpenWrt, or other platform-specific NextDNS configurations.
license: MIT
metadata:
  author: tuanductran
  version: "1.0.0"
---

# NextDNS Integration Skills

## Capability Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [Public DNS and AdGuard Home Integration](rules/public-dns-and-adguard.md) | public dns, adguard, anycast, doh, dot, browser setup, windows, android, ios, upstream dns, bootstrap dns | Configure NextDNS public DNS servers on browsers and operating systems, and integrate with AdGuard Home as upstream DNS provider |
| [OpenWrt Integration](rules/openwrt.md) | openwrt, router, installation, upgrade, troubleshooting, ssh, luci | Installation, upgrade, and troubleshooting guidance for NextDNS on OpenWrt routers |

## Efficiency Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| *No efficiency rules yet* | | Add efficiency rules here |

## Adding New Integration Rules

When adding a new integration rule:

1. Create a new file in `rules/` using kebab-case naming
2. Follow the rule template structure from `templates/rule-template.md`
3. Include platform-specific configuration examples
4. Add troubleshooting steps for common issues
5. Register the rule in the appropriate table above
6. Run `pnpm lint:fix` to ensure compliance

### Example Integration Platforms

Consider creating rules for these popular platforms:

**Capability Rules**:
- Tailscale (mesh VPN)
- Home Assistant (smart home automation)
- Ubiquiti UniFi (network controller)
- OpenWrt (router firmware)
- pfSense (firewall/router)
- Docker (containerization)
- Kubernetes (orchestration)
- Synology NAS (network storage)

**Efficiency Rules**:
- Multi-platform deployment strategy
- Integration testing and validation
- Backup DNS and failover configuration

## Reference

- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [NextDNS API Documentation](https://nextdns.github.io/api/)
