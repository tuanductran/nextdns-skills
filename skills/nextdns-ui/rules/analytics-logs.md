---
title: 'Analytics and Logs'
impact: MEDIUM
impactDescription: 'Monitoring network activity and identifying blocked queries'
type: capability
tags:
  - monitoring
  - logs
  - blocked queries
  - query count
  - analytics
  - traffic analysis
  - device filter
  - time range
  - dnssec
  - encrypted dns
---

# Analytics and logs

Visibility and troubleshooting tools

Monitor your network activity and troubleshoot issues through real-time logs and detailed analytics.

## Logs tab

- **Real-time Monitoring**: See recent DNS events hitting the NextDNS resolver.
- **Search and Filter**: Select a device scope such as **All devices** and search the log list for a
  domain or event. Keep account-wide filtering separate from per-device identification.
- **Event inspection**: Expand an individual log row to inspect the event details exposed by the UI,
  including the queried domain, source or device context, and relative time.
- **Identification**: To find out **why** a domain is blocked, use the event details and the profile's
  blocking controls to distinguish a blocklist, security feature, parental-control rule, or manual
  deny rule.
- **Direct Action**: If the current UI exposes allow or block actions from a log entry, confirm the
  target domain and profile before applying the action.
- **Reloading**: Refresh the log view after making configuration changes and verify that new events
  use the intended profile and device scope.

## Analytics tab

Use the device selector and time-range selector before interpreting any chart. The dashboard can
show a global view such as **All devices** over a recent period, but the selected scope changes the
meaning of every count.

- **Global Overview**: Track total queries, blocked queries, and the blocked-query percentage.
- **Resolved versus blocked domains**: Compare domains resolved without a block to domains blocked
  by Security, Privacy, Parental Control, or a manual deny rule.
- **Insights**: Review blocked reasons, devices, client IPs, root-domain aggregates, GAFAM dominance,
  encrypted-DNS percentage, DNSSEC validation percentage, and traffic destinations by country.
- **Retention**: Analytics and logs are bounded by the profile's retention and privacy settings;
  do not infer historical completeness when retention or client-IP logging is limited.

### Interpret dashboard metrics carefully

A domain count is not the same as a unique application or user count. Root-domain aggregates combine
subdomains, IP sections may contain multiple addresses for one network, and **Unidentified devices**
indicate that the selected connection did not provide a usable device identity. Use the Setup page's
identification instructions before treating device-level analytics as complete.

## Best practices

- Periodically use the device scope and search controls to inspect recent events and ensure that no
  essential services are being blocked.
- Use **Analytics** to understand traffic patterns, compare resolved and blocked domains, and identify
  potential issues such as a device making excessive requests.

## Reference

- [NextDNS Dashboard](https://my.nextdns.io/)
- [NextDNS Help Center](https://help.nextdns.io)
