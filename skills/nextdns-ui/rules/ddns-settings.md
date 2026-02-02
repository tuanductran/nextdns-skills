---
title: "Linked IP and DDNS"
impact: "HIGH"
impactDescription: "Configuring NextDNS for networks and devices that do not support modern DNS protocols"
type: "capability"
tags: "linked ip, ddns, noip, dynamic dns, router setup, legacy dns"
---
# Linked IP and DDNS

**Impact: HIGH** - Essential for router-level and legacy device support

For devices or networks that only support standard IPv4 DNS (port 53), you must link your public IP address to your NextDNS profile.

## Linked IP Setup

If your network uses standard DNS servers (e.g., `45.90.28.16`), NextDNS needs to know your public IP to apply your custom settings.

- **Link IP**: Click the "Link IP" button in the Setup tab of the dashboard.
- **Dynamic IPs**: If your ISP changes your IP frequently (e.g., when the modem restarts), the link will break, and your custom filtering will stop working.

## Dynamic DNS (DDNS) Integration

To solve the dynamic IP issue, you can use a DDNS service like **NOIP**.

### How to Configure DDNS

1. **Get a DDNS Hostname**: Register a free hostname at [noip.com](https://www.noip.com).
2. **Setup DDNS on Router**: Configure your modem/router to update the DDNS hostname whenever your public IP changes.
3. **Link to NextDNS**:
    - In the NextDNS Dashboard (Setup tab), click **Show advanced options** under the Linked IP section.
    - Enter your DDNS hostname (e.g., `myhome.ddns.net`) into the configuration field.
4. **Verification**: NextDNS will now automatically update your Linked IP by resolving your DDNS hostname.

## Legacy IP Details

If modern protocols (DoH/DoT) aren't available, use these addresses:

- **IPv4**: `45.90.28.16` and `45.90.30.16`.
- **IPv6**: `2a07:a8c0::af:1fd7` and `2a07:a8c1::af:1fd7`.

## Expert Tip
Linked IP is the "backup" method. Whenever possible, use the **NextDNS CLI, Apps, or Private DNS (Android)** as they do not require IP linking and support naming devices in logs.
