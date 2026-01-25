---
title: Configuration Management
impact: MEDIUM
impactDescription: Global profile settings, log retention, and performance optimization
type: capability
tags: profile name, log retention, storage location, performance, cache boost, cname flattening
---

# Configuration Management

**Impact: MEDIUM** - System-level profile settings and performance

Manage your NextDNS profile settings, log storage, and performance optimizations.

## General Settings

- **Profile Name**: Use descriptive names like "Router - Stable" or "Browser - Aggressive".
- **Logs Enabled**: Toggle on/off log recording.
- **Log Retention**: Choose how long to keep logs (from 1 hour to 3 months).
- **Log Storage Location**: **Switzerland** is often recommended by privacy enthusiasts due to their strong data protection laws.
- **Block Page**: Display a dedicated page when a site is blocked.
    - **Caution**: This setting can break **PayPal 2FA**, **iCloud Private Relay**, **Microsoft Teams**, and **Yahoo! Mail**. Only enable if you have installed the NextDNS Root CA.

## Performance & Advanced

- **Anonymized EDNS Client Subnet**: Often enabled by default to improve CDN routing without exposing your full IP.
- **Cache Boost**: Recommended for performance. It tells clients to keep DNS answers longer.
- **CNAME Flattening**: Reduces the number of DNS queries.
    - **Warning**: May break compatibility with services like **Yahoo! Mail**.
- **Rewrites**: Manually redirect any domain or subdomain (e.g., `local.home` to `192.168.1.1`).
- **Bypass Age Verification**: Allows accessing content that requires age verification via DNS identification.
- **Web3**: Enable resolution of decentralised domains (HNS, ENS, etc.).

## Maintenance

- **Set-and-Forget**: If you want a trouble-free experience, stick to the **NORMAL** or **PRO** blocklists and avoid aggressive security settings like "Block Newly Registered Domains".
