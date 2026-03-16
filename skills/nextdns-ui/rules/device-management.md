---
title: 'Device Management'
impact: MEDIUM
impactDescription: 'Unidentified devices appear as anonymous IPs in logs, making it impossible to troubleshoot per-device issues or apply device-specific filtering'
type: capability
tags:
  - devices
  - client identification
  - device names
  - linked ip
  - doh
  - dot
  - dashboard
---

# Device management

Identify, name, and manage devices in the NextDNS dashboard for precise per-device visibility

## Overview

The NextDNS dashboard can display each device by name (for example, "Alice's iPhone", "Smart TV") in
the Logs and Analytics tabs. Device identification depends on the DNS protocol the device uses to
reach NextDNS.

Understanding which protocol each device uses determines how you can identify it and whether you can
apply device-specific profiles.

## Protocol and identification matrix

| Protocol | Device visible in Logs | Per-device Profile | Client name shown |
|----------|----------------------|-------------------|-------------------|
| DoH (DNS-over-HTTPS) | ✅ | ✅ | ✅ (from device ID in URL) |
| DoT (DNS-over-TLS) | ✅ | ✅ | ✅ (from TLS hostname) |
| NextDNS CLI / App | ✅ | ✅ | ✅ (from `-report-client-info`) |
| Linked IP (plain DNS) | ⚠️ By IP only | ❌ | ❌ (IP address only) |

## Setting device names in the dashboard

### Via the Setup tab

1. Navigate to `https://my.nextdns.io/{profile-id}/setup`
2. Scroll to **Devices**
3. Devices that have sent queries will appear in the list
4. Click the **pencil icon** next to any device to rename it

### Via the Logs tab

1. Navigate to the **Logs** tab
2. Click on a query row
3. In the expanded view, click **Edit** next to the device name
4. Enter a friendly name and save

## Improving device identification

### For devices using Linked IP (plain DNS)

Devices that use the router's DNS (Linked IP setup) appear only as IP addresses. To improve
visibility, install the NextDNS CLI on the router with `-report-client-info`:

```bash
sudo nextdns config set -report-client-info=true
sudo nextdns restart
```

This enables the CLI to report the hostname and MAC address of each LAN client to NextDNS.

### For Android devices (Private DNS)

Android's Private DNS (DoT) uses the profile-specific hostname:

```text
{your-profile-id}.dns.nextdns.io
```

This associates the device with your profile and makes it identifiable by its Android device name.

### For iOS devices

Install the NextDNS profile from `https://my.nextdns.io/{profile-id}/setup` → **iOS**. The profile
includes a DoH or DoT configuration with your profile ID embedded, enabling per-device
identification.

### For Windows devices

```powershell
# ✅ Configure DoH with device identification via Settings
# Settings → Network & Internet → [connection] → Hardware properties → DNS server assignment
# Set preferred DNS: your NextDNS IPv4 endpoint
# Enable DNS over HTTPS: "On (manual template)"
# Template: https://dns.nextdns.io/{profile-id}
```

## Viewing device activity

### In the Logs tab

```text
Filter options:
- All devices (default)
- Specific device (by name or IP)
- Unidentified devices only (__UNIDENTIFIED__)
```

### In the Analytics tab

Navigate to **Analytics → Devices** to see:

- Query count per device over the selected time period
- Percentage of blocked queries per device
- Device model (when reported by the NextDNS app or CLI)

## Do NOT Use

```text
❌ Do not rely on Linked IP alone for per-device visibility
   Plain DNS (port 53) via linked IP only identifies the network, not individual devices.

❌ Do not use the same DoH URL for multiple devices without the profile ID
   Generic DoH URLs like https://dns.nextdns.io/ without a profile suffix cannot identify
   which profile or device the query came from.
```

## Best practices

- **Name devices immediately** after they first appear in Logs — it is easier while the context is
  fresh.
- **Use descriptive names** that include the owner and device type: "Bob - iPad Pro", "Living Room
  TV".
- **Enable `-report-client-info`** on the NextDNS CLI for network-wide installations to identify
  devices without requiring per-device configuration.
- **Check the `__UNIDENTIFIED__` filter** periodically to catch new devices on your network that
  have not been named yet.

## Troubleshooting

### Issue: device shows as an IP address instead of a name

**Cause**: The device uses Linked IP (plain DNS) without client info reporting.

**Solution**: Install NextDNS CLI on the router with `-report-client-info`, or configure the
device to use DoH/DoT with your profile ID in the URL/hostname.

### Issue: two devices share the same name in the logs

**Cause**: Different devices were given the same hostname, or the same device changed its IP.

**Solution**: Rename one device from the Devices list in the Setup tab, using more specific names.

## Reference

- [NextDNS Help Center — Device Identification](https://help.nextdns.io)
- [NextDNS CLI — Report Client Info](https://github.com/nextdns/nextdns#configuration)
- [Android Private DNS Setup](https://nextdns.io/blog/android-private-dns)
