---
title: 'MikroTik DoH Setup'
impact: HIGH
impactDescription: 'Ensures secure DNS on MikroTik routers via DNS-over-HTTPS (DoH)'
type: capability
tags:
  - mikrotik
  - routeros
  - doh
  - dns-over-https
  - networking
---

# MikroTik DoH Setup

Comprehensive guide for configuring NextDNS with DNS-over-HTTPS on MikroTik RouterOS devices.

## Overview

MikroTik RouterOS (v6.47+) supports DNS-over-HTTPS (DoH). Configuring NextDNS via DoH provides
encrypted DNS for the entire network without relying on the command-line installer.

## Correct Usage

### 1. Import Security Certificate

MikroTik requires a root CA certificate to verify the HTTPS connection to NextDNS.

```bash
# ✅ Import DigiCert Root CA (Required for dns.nextdns.io)
/tool fetch url=https://cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
/certificate import file-name=DigiCertGlobalRootCA.crt.pem name=DigiCertGlobalRootCA
```

### 2. Configure Static DNS

Map the NextDNS hostname to its IP addresses to initiate the DoH connection.

```bash
# ✅ Set static entries for the DoH hostname
/ip dns static
add address=45.90.28.0 name=dns.nextdns.io
add address=45.90.30.0 name=dns.nextdns.io
```

### 3. Enable DoH

Set the DoH server URL and enable certificate verification.

```bash
# ✅ Configure DoH Server (Replace abc123 with your Profile ID)
/ip dns set use-doh-server=https://dns.nextdns.io/abc123 verify-doh-cert=yes
/ip dns set allow-remote-requests=yes
```

## Do NOT Use

❌ **Plain DNS with DoH**: Do not leave standard DNS servers (e.g., 8.8.8.8) in the `servers` list,
as MikroTik might fallback to them.

```bash
# ❌ Incorrect: Standard servers still present
/ip dns set servers=8.8.8.8,1.1.1.1
```

## Troubleshooting

### No Connection / certificate error

1. **System Time**: MikroTik MUST have the correct system time for HTTPS verification. Check
   `/system clock print`.
2. **Certificate Name**: Ensure the certificate was imported correctly and is visible in
   `/certificate print`.

### Slow Resolution

- Ensure `max-udp-packet-size` is set to `4096` in `/ip dns set`.
- Use RouterOS v7.x for significantly better DoH performance and stability compared to v6.x.

## Reference

- [MikroTik DNS Documentation](https://help.mikrotik.com/docs/display/ROS/DNS)
- [NextDNS Setup Guide](https://my.nextdns.io/setup)
