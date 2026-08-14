---
title: 'Select a NextDNS transport and setup method'
impact: HIGH
impactDescription: 'Selecting an incompatible transport or omitting the required profile association can leave DNS traffic unfiltered, unencrypted, or attributed to the wrong profile.'
type: capability
tags:
  - transport-selection
  - encrypted-dns
  - legacy-dns
  - doh
  - dot
  - doq
  - doh3
  - linked-ip
---

# Select a NextDNS transport and setup method

Choose the connection method before configuring a device, router, or network so the profile is
associated correctly and the expected DNS protections apply.

## Overview

Use the **Setup** tab in `my.nextdns.io` as the source of truth for a profile's endpoints, then
select the strongest transport supported by the target platform and network. NextDNS supports DoH,
DoT, DoQ, and DoH3; legacy UDP is a compatibility fallback rather than the default choice.[1] [2]

> Prefer an encrypted transport that carries the profile identifier. Use legacy UDP over IPv4 only
> when the platform cannot use an encrypted transport, IPv6, or the NextDNS CLI.

### Select the transport

| Transport | Profile association | Network requirement | Use when |
| --- | --- | --- | --- |
| **DoH** | Profile identifier is in the URL path. | HTTPS over TCP port 443. | The platform supports a custom DoH URL or DNS port 853 is blocked. |
| **DoT** | Profile identifier is in the hostname. | TLS over TCP port 853. | The operating system exposes native Private DNS or DoT settings. |
| **DoQ** | Obtain the endpoint from the Setup tab. | QUIC over UDP port 8853. | The client explicitly supports DoQ and UDP/8853 is permitted. |
| **DoH3** | Obtain the endpoint from the Setup tab. | HTTP/3 over UDP port 443. | The client supports HTTP/3 DNS and the network permits QUIC. |
| **UDP over IPv6** | Profile identifier is encoded in the IPv6 address. | IPv6 connectivity. | Encrypted DNS and the CLI are unavailable but the platform supports IPv6. |
| **UDP over IPv4** | Link the network's public IP to the profile. | Stable or automatically updated public IPv4 address. | No encrypted DNS, IPv6, or CLI option is available. |

The profile-association mechanisms and the Linked IP restriction for legacy UDP/IPv4 are documented
by NextDNS.[3] DoT and DoQ use dedicated ports, while DoH and DoH3 use HTTPS ports; evaluate
firewall policy before choosing a transport.[2]

## Correct usage

### Configure native encrypted DNS when the platform supports it

Use the exact setup value displayed by NextDNS for the profile. The following examples use a
placeholder profile identifier only.

```text
# ✅ DNS-over-HTTPS custom resolver
https://dns.nextdns.io/abc123

# ✅ DNS-over-TLS provider hostname
abc123.dns.nextdns.io
```

Use DoH for software that accepts a resolver URL and DoT for software that accepts a provider
hostname. Configure the endpoint in the operating system, browser, router, or MDM profile that
owns DNS resolution for the intended traffic.

### Use the CLI for a router or UNIX host that needs local network features

The NextDNS CLI is a DNS53-to-DoH proxy and supports router-level deployment, client discovery,
conditional profiles, and conditional forwarding.[4]

```bash
# ✅ Use a placeholder profile ID and let the CLI manage local DNS integration.
nextdns config set -profile=abc123 -report-client-info
nextdns activate
nextdns status
```

Install the CLI only on a host that is intended to be a local resolver. For a router deployment,
ensure DHCP advertises that resolver to LAN clients and verify that client DNS does not bypass it.

### Use Linked IP only for legacy UDP/IPv4

When a platform can use only profile-specific IPv4 DNS addresses, link the public address in the
profile's **Setup** tab. If the public address is dynamic, configure the documented DDNS hostname
or profile-provided update method so the association remains current.[1] [3]

```text
# ✅ Verification after any setup change
https://test.nextdns.io
```

Confirm that the test page reports **Connected** and the intended configuration identifier. Then
generate a DNS query and confirm that it appears in the expected profile's logs.

## Do NOT use

```text
# ❌ Do not assume a legacy IPv4 DNS server identifies a profile by itself.
# Link the network public IPv4 address in the Setup tab before relying on the profile.
```

```text
# ❌ Do not use a DoH URL in a field that requires a DoT hostname.
https://dns.nextdns.io/abc123
```

```text
# ❌ Do not expose real profile IDs, API keys, or account data in source control,
support tickets, or client-side application bundles.
```

Avoid Linked IP for CGNAT, multi-WAN load balancing, or networks where the observed public IPv4
cannot be kept current. Prefer an encrypted transport or a local CLI deployment in these cases.

## Best practices

- **Start with platform capability**: Use a native encrypted transport when available; choose the
  CLI for router-level control and LAN client reporting.
- **Treat the Setup tab as canonical**: Copy a profile's endpoint from the dashboard instead of
  reusing an endpoint from another profile or a generic online example.
- **Verify after each network change**: Recheck `test.nextdns.io` after changing DNS, switching
  networks, or changing a router's WAN connection.
- **Respect network policy**: Obtain approval before changing DNS on managed corporate, school, or
  shared networks.
- **Keep fallback explicit**: If a non-NextDNS resolver is configured for availability, document
  that some DNS queries can bypass the profile when the fallback is used.

## Common pitfalls

### Using Linked IP with a changing or shared public address

A legacy UDP/IPv4 setup depends on the current public address. A dynamic address can stop matching
its profile after a reconnect, while CGNAT and simultaneous multi-WAN paths can make the address
unsuitable for deterministic profile association.[1] [3]

**Solution**: Configure a DDNS update path when the setup supports it, or move the device or router
to DoH, DoT, DoQ, DoH3, IPv6, or the NextDNS CLI.

### Applying browser-only DoH as if it protects the whole device

A browser's DoH setting protects DNS initiated by that browser, not queries from other applications
or devices on the same LAN.

**Solution**: Configure DNS at the operating-system or router layer when system-wide or
network-wide coverage is required. Keep browser DoH for restricted environments or browser-specific
use cases.

### Treating profile selection and device identification as the same control

A transport can associate queries with the correct profile without providing a distinct device label.
Router-level client discovery requires an appropriate local resolver setup, such as the CLI with
client reporting enabled.[4]

**Solution**: First verify the profile identifier on `test.nextdns.io`; then use the platform's
supported device-naming or router-level client-reporting mechanism when per-device analytics is
needed.

## Troubleshooting

### Issue: `test.nextdns.io` does not show the intended configuration

**Symptoms**: The test page shows no configuration, another profile, or an unencrypted protocol
when an encrypted transport was expected.

**Solution**:

1. Recopy the endpoint for the intended profile from its **Setup** tab.
2. Check that the field expects the correct value type: DoH URL versus DoT hostname.
3. For legacy UDP/IPv4, refresh the Linked IP or verify its DDNS hostname resolves to the current
   public address.
4. Disable or reconcile competing DNS settings from a VPN, security product, router, browser, or
   MDM policy.
5. Re-run the test from the target application or device, not only from an administrator's device.

### Issue: Encrypted DNS fails only on a specific network

**Symptoms**: DNS works on one network but fails on a corporate, public Wi-Fi, or restricted LAN.

**Solution**:

1. Confirm that the selected transport's port is allowed: TCP/443 for DoH, TCP/853 for DoT,
   UDP/8853 for DoQ, or UDP/443 for DoH3.[2]
2. Use an approved alternative transport supported by the device and network policy.
3. Do not silently fall back to unencrypted DNS if the deployment requires encrypted DNS; escalate
   the firewall or policy requirement to the network administrator.

## Reference

- [1] [NextDNS Help Center: Which setup type to use?](https://help.nextdns.io/t/m1hmv0k/which-setup-type-to-use)
- [2] [NextDNS Help Center: What is DNS over TLS, DNS over QUIC, and DNS over HTTPS?](https://help.nextdns.io/t/x2hmvas/what-is-dns-over-tls-dot-dns-over-quic-doq-and-dns-over-https-doh-doh3)
- [3] [NextDNS Help Center: What is Linked IP?](https://help.nextdns.io/t/g9hmvan/what-is-linked-ip)
- [4] [NextDNS CLI Wiki: Home](https://github.com/nextdns/nextdns/wiki)
