---
title: "Analytics and Logs"
impact: MEDIUM
impactDescription: "Monitoring network activity and identifying blocked queries"
type: capability
tags: "monitoring, logs, blocked queries, query count, analytics, traffic analysis"
---
# Analytics and Logs

**Impact: MEDIUM** - Visibility and troubleshooting tools

Monitor your network activity and troubleshoot issues through real-time logs and detailed analytics.

## Logs Tab

- **Real-time Monitoring**: See every DNS query hitting the NextDNS resolver.
- **Search and Filter**:
  - **Blocked Queries Only**: Quickly identify what is being blocked.
  - **Raw DNS Logs**: View absolute DNS record details.
- **Identification**: To find out **why** a domain is blocked, hover over the information icon (**ⓘ**) next to the query. It will tell you the specific blocklist or security feature responsible.
- **Direct Action**: You can allow or block domains directly from the log entry using the checkmark or cross icons.
- **Reloading**: Use the reload icon to check for the most recent queries after making configuration changes.

## Analytics Tab

- **Global Overview**: Track total queries and the percentage of blocked requests.
- **Insights**:
  - **Top Domains**: Identify the most requested domains.
  - **Top Reasons**: See which rules are triggering the most blocks.
  - **Top Clients**: Identify which devices are the most active on your network.
- **Retention**: Data in the Analytics tab respects your chosen retention period in Settings.

## Best Practices

- Periodically check the **Blocked Queries Only** filter to ensure no essential services are being blocked.
- Use the **Analytics** to understand the traffic patterns on your network and identify potential issues (like a device making excessive requests).
