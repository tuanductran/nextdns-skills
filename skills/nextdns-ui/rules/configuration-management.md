---
title: 'Configuration Management'
impact: MEDIUM
impactDescription: 'Global profile settings, log retention, and performance optimization'
type: capability
tags:
  - profile name
  - log retention
  - storage location
  - performance
  - cache boost
  - cname flattening
  - profile sharing
  - age verification
  - web3
---

# Configuration management

System-level profile settings and performance

Manage your NextDNS profile settings, log storage, and performance optimizations.

## General settings

- **Profile Name**: Use descriptive names like "Router - Stable" or "Browser - Aggressive".
- **Logs Enabled**: Toggle on/off log recording.
- **Privacy adjustments**: Choose independently whether to retain client IP addresses and queried
  domains in logs.
- **Log Retention**: Choose a retention window from **1 hour** through **2 years**. Treat retention
  and storage location as profile settings, not as proof that a particular legal or privacy regime
  applies to every deployment.
- **Log Storage Location**: Select the location exposed by the dashboard for the profile.
- **Block Page**: Display a page when a domain is blocked. This can slightly increase page-load time
  and may produce HTTPS warnings. When disabled, blocked queries are answered with the unspecified
  address `0.0.0.0` or `::`.
- **Log operations**: Use **Download logs** for export and treat **Clear logs** as destructive because
  it permanently removes the profile's stored logs.

## Performance and advanced

- **Anonymized EDNS Client Subnet**: Often enabled by default to improve CDN routing without
  exposing your full IP.
- **Cache Boost**: Recommended for performance. It tells clients to keep DNS answers longer.
- **CNAME Flattening**: Prevent CNAME-chasing resolvers from making unnecessary intermediate
  queries that can pollute logs.
- **Rewrites**: Override DNS responses for a domain and its subdomains. Local IP addresses are
  supported as answers.
- **Bypass Age Verification (beta)**: Acknowledge the legal-age requirement before enabling the
  dashboard's age-verification bypass feature. Do not present this beta feature as a universal
  content-access guarantee.
- **Web3 (beta)**: Enable the dashboard's unfiltered gateway for decentralized naming and content
  systems such as ENS, Unstoppable Domains, Handshake, and IPFS. Browsers may require a trailing `/`
  when opening a Web3 domain directly.

## Sharing and lifecycle

- **Access (beta)**: Invite another person with editing or viewing-only access to the profile. Share
  access deliberately because an editor can change filtering and logging behavior.
- **Duplicate**: Copy all profile settings to a new profile before experimenting with a high-impact
  change.
- **Delete**: Deleting a profile also permanently deletes its associated logs. Confirm the target
  profile before using this action.

## Maintenance

- **Set-and-Forget**: If you want a trouble-free experience, stick to the **NORMAL** or **PRO**
  blocklists and avoid aggressive security settings like "Block Newly Registered Domains".

## Reference

- [NextDNS Dashboard](https://my.nextdns.io/)
- [NextDNS Help Center](https://help.nextdns.io)
