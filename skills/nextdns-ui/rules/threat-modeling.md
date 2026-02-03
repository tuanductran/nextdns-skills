---
title: "Threat Modeling & Strategy"
impact: LOW
impactDescription: "Strategic approach to DNS configuration based on balancing security and usability"
type: efficiency
tags: "threat model, grandma test, diminishing returns, strategy, optimization"
---
# Threat Modeling & Strategy

**Impact: LOW** - Efficient approach to long-term DNS management

DNS configuration is a spectrum between absolute security/privacy and complete usability. Use these guidelines to find your balance.

## The Grandma Test
A DNS configuration is considered "stable" if it passes the **Grandma Test**:
- The user shouldn't have to troubleshoot the network for everyday tasks.
- Major apps (Bank, Teams, Netflix) should work without manual adjustment.
- Websites should load correctly without HTTPS warnings.

## Law of Diminishing Returns
Avoid "overblocking." Adding more and more blocklists doesn't necessarily make you more secure but significantly increases the risk of "breakage" (legitimate sites not working).
- Stick to 1-2 high-quality maintained lists (like **HaGeZi** and **OISD**).
- Prefer a "NORMAL" profile for network-wide (Router) use.
- Use an "AGGRESSIVE" profile only on individual devices where you can easily toggle it off or fix it.

## Profile Organization Strategy
Instead of one massive profile, divide your configurations:
- **Profile A (Stable)**: Minimal blocking. Used on Routers and IoT devices.
- **Profile B (Personal)**: Moderate blocking. Used on personal laptops/phones.
- **Profile C (Kids)**: High parental control and category blocking.

## Maintenance Checklist
1. Periodically check your **Analytics** to see if specific rules are over-blocking.
2. Review the **Allowlist** and remove entries that were only meant to be temporary.
3. Keep the **NextDNS CLI** and apps updated to the latest versions.
