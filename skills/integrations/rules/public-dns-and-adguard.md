---
title: "Public DNS and AdGuard Home Integration"
impact: HIGH
impactDescription: "Without proper public DNS and AdGuard Home configuration, users may experience degraded performance, connectivity issues, or inability to leverage NextDNS features for unlinked devices and third-party DNS forwarders."
type: capability
tags: "public dns, adguard, anycast, doh, dot, browser setup, windows, android, ios, upstream dns, bootstrap dns"
---
# Public DNS and AdGuard Home Integration

**Impact: HIGH** - Critical for unlinked device setup and AdGuard Home upstream configuration

## Overview

NextDNS provides public DNS servers (anycast) that can be used for devices that cannot link to a specific configuration profile, as well as integration with AdGuard Home as an upstream DNS provider. This guide covers browser setup, operating system configuration, and AdGuard Home integration patterns.

## Public DNS Servers (Anycast)

NextDNS operates the following public DNS servers for unlinked devices:

**IPv4 Addresses:**
- Primary: `45.90.28.0`
- Secondary: `45.90.30.0`

**IPv6 Addresses:**
- Primary: `2a07:a8c0::`
- Secondary: `2a07:a8c1::`

**DNS over HTTPS (DoH):**
- Endpoint: `https://dns.nextdns.io/`

**DNS over TLS (DoT) / Android Private DNS:**
- Hostname: `dns.nextdns.io`

## Browser Setup

### Chrome and Edge

Configure secure DNS in Chromium-based browsers:

1. Navigate to **Settings**
2. Go to **Privacy and security**
3. Select **Security**
4. Enable **Use secure DNS**
5. Select **Custom** provider
6. Enter: `https://dns.nextdns.io/`

### Firefox

Configure DNS over HTTPS in Firefox:

1. Navigate to **Settings**
2. Go to **Privacy & Security**
3. Enable **DNS over HTTPS**
4. Select **Max Protection**
5. Choose **NextDNS** from the provider list

## Operating System Setup

### Windows 11

Configure DNS settings with DoH support:

1. Open **Settings**
2. Navigate to **Network & internet**
3. Select your connection (**Wi-Fi** or **Ethernet**)
4. Click **Hardware properties**
5. Under **DNS Server Assignment**, click **Edit**
6. Set **IPv4 DNS servers**:
    - Preferred: `45.90.28.0`
    - Alternate: `45.90.30.0`
7. Set **IPv6 DNS servers**:
    - Preferred: `2a07:a8c0::`
    - Alternate: `2a07:a8c1::`
8. Set **DNS over HTTPS** to **On (manual template)**
9. Enter template: `https://dns.nextdns.io/`

### Android

Configure Private DNS for system-wide encrypted DNS:

1. Open **Settings**
2. Navigate to **Network & internet**
3. Select **Private DNS**
4. Choose **Private DNS provider hostname**
5. Enter: `dns.nextdns.io`

### iOS

iOS requires installing a configuration profile:

1. Visit the [Apple configuration generator](https://apple.nextdns.io)
2. Generate and download the `.mobileconfig` profile for your configuration
3. Install the profile on your iOS device
4. Navigate to **Settings** → **General** → **VPN & Device Management**
5. Select and install the NextDNS profile

**Note:** The profile must be generated from the official NextDNS Apple generator to ensure proper signing and compatibility.

## AdGuard Home Integration

### Upstream DNS Servers

Configure NextDNS as upstream DNS in AdGuard Home for load balancing:

**Recommended Configuration:**
```conf
https://dns1.nextdns.io/
https://dns2.nextdns.io/
```

**Alternative Protocols:**
- **DNS over TLS:** Use `tls://dns1.nextdns.io/` and `tls://dns2.nextdns.io/`
- **DNS over QUIC:** Use `quic://dns1.nextdns.io/` and `quic://dns2.nextdns.io/`

### Bootstrap DNS Servers

**Critical:** Bootstrap DNS servers must be configured to ensure AdGuard Home can resolve NextDNS upstream hostnames and maintain EDNS Client Subnet (ECS) functionality for optimal routing.

**Recommended Bootstrap Servers:**
```conf
8.8.8.8
9.9.9.11
208.67.222.222
```

These public resolvers ensure that AdGuard Home can properly resolve the NextDNS upstream hostnames and maintain ECS functionality for optimal routing.

## Best Practices

- Use DNS over HTTPS (DoH) or DNS over TLS (DoT) whenever possible for encrypted DNS queries
- Configure both IPv4 and IPv6 DNS servers for dual-stack networks
- Always set bootstrap DNS servers in AdGuard Home to avoid ECS issues
- Use load-balanced endpoints (`dns1` and `dns2`) for better reliability in AdGuard Home
- Test DNS configuration after setup using online DNS leak test tools

## Common Pitfalls

- **Missing Bootstrap DNS:** AdGuard Home may fail to resolve NextDNS upstream servers without proper bootstrap configuration
- **IPv6 Only:** Ensure both IPv4 and IPv6 are configured on dual-stack networks
- **DoH Template Format:** Windows 11 requires the full `https://` URL format for DoH templates
- **iOS Profile Expiry:** Configuration profiles may need to be reinstalled after iOS updates

## Troubleshooting

**DNS Not Resolving:**
- Verify DNS server addresses are entered correctly
- Check firewall rules allow DNS traffic (port 53, 443 for DoH, 853 for DoT)
- Test with `nslookup` or `dig` commands

**AdGuard Home Connection Issues:**
- Ensure bootstrap DNS servers are configured
- Verify network connectivity to NextDNS endpoints
- Check AdGuard Home logs for upstream DNS errors

**ECS Not Working:**
- Confirm bootstrap DNS servers are set to public resolvers
- Verify AdGuard Home upstream configuration uses hostnames (not IP addresses)

## Reference

- [NextDNS Setup Guide](https://help.nextdns.io/tag/setup)
- [AdGuard Home Configuration](https://github.com/AdguardTeam/AdGuardHome/wiki/Configuration)
- [Apple Configuration Generator](https://apple.nextdns.io)
