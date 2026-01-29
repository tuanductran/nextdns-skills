---
name: nextdns-ui
description: NextDNS Web UI configuration and management best practices. This skill should be used when configuring NextDNS profiles via the web interface (my.nextdns.io), including security features, privacy lists, parental controls, and monitoring logs.
license: MIT
metadata:
  author: tuanductran
  version: "1.0.0"
---

# NextDNS Web UI Skills

## Capability Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [security-settings](rules/security-settings.md) | threat intelligence, google safe browsing, TLDs, security | Configure advanced threat protection |
| [privacy-settings](rules/privacy-settings.md) | blocklists, Hagezi, OISD, native tracking, privacy | Manage privacy and ad-blocking lists |
| [parental-control](rules/parental-control.md) | apps & games, categories, recreation time, restricted mode | Set up restrictions for family members |
| [ddns-settings](rules/ddns-settings.md) | linked ip, ddns, noip, dynamic dns, router | Manage network IP linking and dynamic DNS |
| [denylist-allowlist](rules/denylist-allowlist.md) | block domain, allow domain, whitelist, fixing breakage | Manually manage domain accessibility |
| [analytics-logs](rules/analytics-logs.md) | monitoring, logs, blocked queries, identifier | Monitor network activity and troubleshoot |
| [configuration-management](rules/configuration-management.md) | profile name, log location, performance, cache boost | Manage profile global settings |

## Efficiency Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [threat-modeling](rules/threat-modeling.md) | grandma test, overblocking, strategy, infrastructure | Strategic approach to DNS configuration |
| [setup-optimization](rules/setup-optimization.md) | cache boost, cname flattening, performance | Optimize DNS performance |
| [troubleshooting-ui](rules/troubleshooting-ui.md) | log inspection, reload logs, identification | Troubleshoot false positives via dashboard |

## Reference

- [NextDNS Dashboard](https://my.nextdns.io)
- [NextDNS-Config Guidelines](https://github.com/yokoffing/NextDNS-Config)
- [NextDNS Dashboard](https://my.nextdns.io)
