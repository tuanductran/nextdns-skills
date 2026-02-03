---
title: 'Denylist and Allowlist'
impact: MEDIUM
impactDescription: 'Manual management of domain-specific accessibility rules'
type: capability
tags:
  - block domain
  - allow domain
  - whitelist
  - blacklist
  - custom rules
  - apple
  - windows
---

# Denylist and Allowlist

Selective domain blocking and allowing

Manually manage specific domains that should always be blocked or always allowed.

## Expert Denylist (Hardening)

Use the **Denylist** to explicitly block domains that bypass your DNS settings or facilitate
tracking.

### iCloud Private Relay

Prevents NextDNS from protecting iOS/macOS devices by overriding DNS settings. To force NextDNS
filtering, block:

- `mask.icloud.com`
- `mask-h2.icloud.com`
- `mask-canary.icloud.com`

## Expert Allowlist (Fixing Breakage)

Use the **Allowlist** to ensure essential services function correctly even with aggressive
blocklists.

### General Essentials

- `nextdns.io`: Prevent blocking access to the NextDNS dashboard itself.

### Fixing Popular Services

- **Apple Updates**: `xp.apple.com` (Needed for device updates).
- **Apple Features**: `smoot.apple.com` (Spotlight Search, iMessage GIFs).
- **Windows Features**: `settings-win.data.microsoft.com` (Blocked by native Windows tracking list).
- **Social Media Fixes**:
  - `graph.facebook.com`, `graph.instagram.com` (If app issues occur).
- **Video Services**:
  - `s.youtube.com` (If YouTube history is not working).
  - `imasdk.googleapis.com`, `pubads.g.doubleclick.net` (May be needed for Paramount+ or CBS
    livestream).

## Best Practice

Only add domains to the Allowlist if you encounter a specific issue. Over-allowing can compromise
the effectiveness of your security and privacy filters.

## Reference

- [NextDNS Help Center](https://help.nextdns.io)
