---
title: "Troubleshooting via Web UI"
impact: MEDIUM
impactDescription: "Debugging false positives and connectivity issues using dashboard tools"
type: efficiency
tags: "debugging, logs, identification, false positives, troubleshooting"
---
# Troubleshooting via Web UI

**Impact: MEDIUM** - Efficient resolution of blocked content and false positives

How to identify and resolve issues when something isn't working as expected.

## Step-by-Step Troubleshooting

1. **Verify the Issue**: If a site is not loading, first check if it's a DNS issue by disabling NextDNS temporarily or checking if it works on a different network.
2. **Check the Logs**: Go to the **Logs** tab and refresh.
3. **Filter by Blocked**: Switch to "Blocked Queries Only".
4. **Identify the Culprit**: Look for the domain of the site you're trying to reach. Hover over the ⓘ icon to see which list is blocking it.
5. **Quick Fix**: Click the checkmark icon to add it to your **Allowlist** immediately.
6. **Reload the Site**: Flush your local DNS cache or restart your browser to see if the site now loads.

## Common Issues

- **HTTPS Warnings**: Usually caused by the **Block Page** feature. If this is annoying, disable the "Block Page" in Settings.
- **Latency**: If DNS resolution feels slow, check if **Anonymized EDNS Client Subnet** is enabled.
- **Missing Clients**: If logs don't show device names, ensure you are using a protocol that supports client identification (DoH, DoT, or the NextDNS CLI/App).
