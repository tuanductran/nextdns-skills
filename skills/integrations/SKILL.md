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
| [tailscale-integration](rules/tailscale-integration.md) | tailscale, mesh VPN, DNS settings, private network | Integrate NextDNS with Tailscale VPN |
| [home-assistant-integration](rules/home-assistant-integration.md) | home assistant, smart home, automation, DNS integration | Integrate NextDNS with Home Assistant |
| [ubiquiti-integration](rules/ubiquiti-integration.md) | unifi, dream machine, ubiquiti, network controller | Configure NextDNS on Ubiquiti devices |
| [openwrt-integration](rules/openwrt-integration.md) | openwrt, router firmware, LUCI, DNS over HTTPS | Deploy NextDNS on OpenWrt routers |
| [pfsense-integration](rules/pfsense-integration.md) | pfsense, firewall, router, DNS resolver | Integrate NextDNS with pfSense |
| [docker-integration](rules/docker-integration.md) | docker, container, compose, DNS configuration | Run NextDNS in Docker containers |
| [kubernetes-integration](rules/kubernetes-integration.md) | kubernetes, k8s, cluster DNS, deployment | Deploy NextDNS in Kubernetes clusters |
| [synology-integration](rules/synology-integration.md) | synology, NAS, DSM, network settings | Configure NextDNS on Synology NAS |

## Efficiency Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [multi-platform-strategy](rules/multi-platform-strategy.md) | strategy, planning, architecture, deployment | Strategic approach to multi-platform NextDNS deployment |
| [testing-integration](rules/testing-integration.md) | testing, validation, DNS leak, verification | Validate NextDNS integration is working correctly |
| [backup-failover](rules/backup-failover.md) | redundancy, failover, high availability, backup DNS | Configure backup DNS for high availability |

## Adding New Integration Rules

When adding a new integration rule:

1. Create a new file in `rules/` using kebab-case naming
2. Follow the rule template structure from `templates/rule-template.md`
3. Include platform-specific configuration examples
4. Add troubleshooting steps for common issues
5. Register the rule in the appropriate table above
6. Run `pnpm lint:fix` to ensure compliance

## Reference

- [NextDNS Setup Guide](https://help.nextdns.io)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [NextDNS API Documentation](https://nextdns.github.io/api/)
