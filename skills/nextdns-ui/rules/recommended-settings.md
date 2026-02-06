---
title: 'Recommended Configuration Guidelines'
impact: HIGH
impactDescription: 'Strategic configuration to maximize protection while minimizing breakage'
type: efficiency
tags:
  - strategy
  - guidelines
  - grandma-test
  - optimization
  - comparison
---

# Recommended Configuration Guidelines

Based on the [NextDNS-Config](https://github.com/yokoffing/NextDNS-Config) guidelines, these
settings provide an optimal balance between security, privacy, and usability.

## The "Grandma Test" Strategy

A successful configuration should generally work without intervention ("pass the Grandma test").

### 1. Security (The "Set and Forget" approach)

- **Threat Intelligence**: ✅ **Enabled**.
- **AI-Driven Detection**: ⚠️ **Disabled** (Beta, potential for false positives).
- **Google Safe Browsing**: ❌ **Disabled** (Not designed for DNS-level, slow to clear false
  positives).
- **NRDs (Newly Registered Domains)**: ✅ **Enabled**, but disable if you don't plan to maintain
  your allowlist.

### 2. Privacy (Diminishing Returns)

Avoid adding dozens of blocklists. Diminishing returns lead to higher latency and frequent breakage.

| Profile Type                | Strategy           | Recommended Lists            |
| :-------------------------- | :----------------- | :--------------------------- |
| **Router (Default)**        | High Compatibility | HaGeZi - Multi NORMAL + OISD |
| **Personal (Advanced)**     | High Privacy       | HaGeZi - Multi PRO           |
| **Hardened (Experimental)** | Aggressive         | HaGeZi - Multi PRO++         |

### 3. Critical Denylist Additions

Always block Apple's Private Relay if you want NextDNS to see individual device traffic:

- `mask.icloud.com`
- `mask-h2.icloud.com`

## Performance Settings

- ✅ **Cache Boost**: **Enabled**. High TTL values for cache-friendly responses.
- ✅ **ECS**: **Enabled** (Anonymized). Improves performance with Anycast networks/CDNs.
- ❌ **CNAME Flattening**: **Disabled** by default. Can break compatibility with Yahoo Mail and certain complex records.

## Summary Checklist

1. Use 1-2 high-quality blocklists (HaGeZi/OISD).
2. Enable essential security features (Rebinding, Homographs, Typosquatting).
3. Allow "Affiliate & Tracking Links" to prevent email/browsing breakage.
4. Enable "Cache Boost".

## Reference

- [NextDNS-Config Guidelines](https://github.com/yokoffing/NextDNS-Config)
