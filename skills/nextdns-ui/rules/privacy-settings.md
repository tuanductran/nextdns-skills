---
title: 'Privacy Settings'
impact: HIGH
impactDescription: 'Management of privacy blocklists and anti-tracking features'
type: capability
tags:
  - blocklists
  - native tracking
  - disguised trackers
  - privacy
  - oisd
  - hostsVN
  - Hagezi
---

# Privacy Settings

Core privacy and tracking protection settings

Manage blocklists and tracking protection to enhance your online privacy.

## Blocklists

Blocklists filter out ads, trackers, and malicious sites. We recommend using a **minimum** number of
useful lists to prevent overblocking.

### Recommended Blocklists (Hagezi Strategy)

[HaGeZi](https://github.com/hagezi/dns-blocklists) is the recommended maintainer as he handles false
positives quickly and communicates with other maintainers.

| Selection                        | Rationale                                                                   |
| -------------------------------- | --------------------------------------------------------------------------- |
| **HaGeZi - Multi NORMAL + OISD** | For routers. "Set-and-forget" with almost no issues.                        |
| **HaGeZi - Multi PRO**           | Recommended for most users. Blocks more without major issues.               |
| **HaGeZi - Multi PRO++**         | For web browsers. Aggressive blocking, may require occasional allowlisting. |

### Regional Recommendation

- **hostsVN**: **Highly recommended for Vietnamese users** to effectively block local ads.

## Native Tracking Protection

Add the brand names of all devices you use on your network (e.g., Apple, Samsung, Xiaomi, Huawei,
Windows, Amazon Alexa, Roku, Sonos).

## Block Disguised Third-Party Trackers

Automatically detect and block trackers that masquerade as first-party via CNAME cloaking.

- **Note**: NextDNS blocks CNAME records by default even if this list is disabled. This specific
  list hasn't been updated in years and might block some referral domains incorrectly.

## Allow Affiliate & Tracking Links

Allow links on shopping sites or in emails to open properly. NextDNS uses a TCP proxy to hide your
real IP address when clicking these links, preserving your privacy.

## False Positives Warning

If you use extremely aggressive lists (like 1Hosts Pro), you will likely experience breakage in
services like:

- **Google Analytics**
- **Google Tag Manager**
- **Google Optimize**
- **Email links** (if affiliate links are blocked)

## Reference

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)
