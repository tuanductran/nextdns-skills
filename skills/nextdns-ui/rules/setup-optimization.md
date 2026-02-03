---
title: 'Setup Optimization'
impact: LOW
impactDescription: 'Efficiency best practices for dashboard configuration and performance'
type: efficiency
tags:
  - performance
  - best practices
  - optimization
  - profile management
---

# Setup Optimization

Performance and management efficiency

Tips for getting the best performance and reliability out of your NextDNS configuration.

## Performance Optimization

- **Enable Cache Boost**: This reduces the number of queries your devices need to make by telling
  them to remember DNS answers for longer.
- **Use CNAME Flattening**: This streamlines the DNS resolution process for domains that use many
  CNAME aliases.
- **Select Local Storage**: For the best latency in dashboard interactions, choose a log storage
  location near you, though this is primarily for compliance.

## Profile Management

- Create separate profiles for different use cases (e.g., "Parental Control" for kids' devices,
  "Minimal" for gaming PCs) to avoid one-size-fits-all frustration.
- Regularly audit your **Allowlist** to remove entries that are no longer needed.

## Reference

- [NextDNS Help Center](https://help.nextdns.io)
