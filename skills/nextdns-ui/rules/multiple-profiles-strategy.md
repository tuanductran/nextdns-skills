---
title: 'Multiple Profiles Strategy'
impact: MEDIUM
impactDescription: 'Using a single profile for all devices causes over-blocking on some devices and under-protection on others, with no way to tune without affecting everyone'
type: efficiency
tags:
  - profiles
  - strategy
  - organization
  - family
  - router
  - multi-device
  - segmentation
---

# Multiple profiles strategy

Organise multiple NextDNS profiles to give each device category the right level of protection

## Overview

A single NextDNS profile applied to all devices is a compromise that satisfies no one — too
aggressive for IoT devices that break, too lenient for children's devices that need filtering. The
recommended approach is to create distinct profiles for each category of device and assign them
appropriately via the NextDNS CLI, apps, or per-device configuration.

## Recommended profile architecture

### Profile 1: Router / Network-wide (stable baseline)

Used by: Smart TVs, game consoles, IoT devices, guest network — anything that cannot run the
NextDNS app.

```text
Name: "Router - Stable"
Blocklists: HaGeZi Multi NORMAL + OISD
Security: Threat Intelligence ✅ | AI Detection ❌ | Google Safe Browsing ❌
           Cryptojacking ✅ | DNS Rebinding ✅ | NRD ❌
Privacy: Native tracking (relevant brands) | Disguised Trackers ✅
Parental Control: Off
Block Page: Off
```

### Profile 2: Personal / Advanced (moderate privacy)

Used by: Personal laptops, phones, tablets of adults.

```text
Name: "Personal - Advanced"
Blocklists: HaGeZi Multi PRO
Security: Threat Intelligence ✅ | Cryptojacking ✅ | DNS Rebinding ✅
           IDN Homographs ✅ | Typosquatting ✅ | NRD ✅
Privacy: All native tracking brands | Disguised Trackers ✅
Parental Control: Off
Block Page: Off (or On with Root CA installed)
```

### Profile 3: Kids (strict parental control)

Used by: Children's tablets, phones, gaming devices.

```text
Name: "Kids - Strict"
Blocklists: HaGeZi Multi PRO++
Security: All features ✅
Privacy: All native tracking brands | Disguised Trackers ✅
Parental Control:
  - Services: TikTok ✅ | Instagram ✅ | Discord ✅ | Reddit ✅
  - Categories: Porn ✅ | Gambling ✅ | Dating ✅ | Piracy ✅
  - SafeSearch: ✅
  - YouTube Restricted Mode: ✅
  - Block Bypass: ✅
Recreation Time: Set allowed hours per day
```

### Profile 4: Guest / Minimal

Used by: Temporary visitors, untrusted devices.

```text
Name: "Guest - Minimal"
Blocklists: None (or HaGeZi Multi NORMAL)
Security: Threat Intelligence ✅ | Cryptojacking ✅
Privacy: Disguised Trackers ✅
Parental Control: Off
```

## Assigning devices to profiles

### Via NextDNS CLI (router or server)

```bash
# ✅ Assign different profiles based on subnet
sudo nextdns config set \
  -profile 10.0.1.0/24=ROUTER_PROFILE_ID \
  -profile 10.0.2.0/24=KIDS_PROFILE_ID \
  -profile 10.0.3.0/24=GUEST_PROFILE_ID \
  -profile PERSONAL_PROFILE_ID
sudo nextdns restart
```

### Via router VLAN (advanced)

Segment your network with VLANs and assign a different DNS server (NextDNS linked IP or CLI
profile) per VLAN — children's devices on VLAN 20, personal on VLAN 10, IoT on VLAN 30.

### Via device-level app

On each personal device, install the NextDNS app and configure it with the appropriate profile ID.
This overrides any router-level DNS.

## Naming conventions

Use consistent naming to avoid confusion in the dashboard:

| Pattern | Example |
|---------|---------|
| `[Location] - [Level]` | `Router - Stable`, `Office - Advanced` |
| `[Person] - [Device]` | `Alice - Phone`, `Bob - Laptop` |
| `[Purpose] - [Age]` | `Kids - Under12`, `Teen - 13to17` |

## Best practices

- **Start with fewer profiles** and split only when needed — each profile requires separate
  maintenance.
- **Share blocklists across profiles** but adjust security features individually per profile.
- **Use the Kids profile as a template** — duplicate it with the profile copy pattern and adjust
  recreation time per child.
- **Review profiles quarterly** — children grow up, IoT devices change, and blocklists improve.
- **Keep one "break glass" profile** with minimal blocking that you can switch to quickly when
  troubleshooting breakage.

## Troubleshooting

### Issue: identifying which profile a device is using

Navigate to **Logs** in the NextDNS dashboard → filter by client IP or device name → the **Profile**
column shows which profile handled each query.

### Issue: profile changes not taking effect on a device

The device may have cached the old DNS assignment. Force a DHCP renewal or reconnect to Wi-Fi to
pick up the new profile assignment.

## Reference

- [NextDNS CLI — Conditional Profile](https://github.com/nextdns/nextdns/wiki/Conditional-Profile)
- [NextDNS-Config Guidelines](https://github.com/yokoffing/NextDNS-Config)
