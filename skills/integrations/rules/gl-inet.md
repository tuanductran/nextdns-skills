---
title: 'GL.iNet Router Integration'
impact: HIGH
impactDescription: 'GL.iNet routers ship with AdGuard Home enabled — installing NextDNS CLI without disabling it causes port conflicts and unreliable DNS for all network clients'
type: capability
tags:
  - gl.inet
  - openwrt
  - router
  - adguard
  - travel router
  - installation
  - firmware
---

# GL.iNet router integration

Install NextDNS CLI on GL.iNet routers by first disabling the pre-installed AdGuard Home

## Overview

GL.iNet produces a range of portable and home routers (Beryl AX, Slate AX, Flint 2, Mango, and
more) that run a customised OpenWrt firmware with a polished web UI. They are popular as travel
routers and home network devices.

**The critical issue**: GL.iNet firmware bundles AdGuard Home as a built-in DNS filter and enables
it by default. AdGuard Home and NextDNS CLI both need port 53 — they cannot run simultaneously
without explicit port coordination.

## Setup guide

### Step 1: access the GL.iNet web UI

1. Connect to the router's Wi-Fi or Ethernet
2. Open `http://192.168.8.1` in a browser
3. Log in with your admin credentials

### Step 2: disable AdGuard home (web UI method)

1. Navigate to **Applications → AdGuard Home** in the left sidebar
2. Toggle the switch to **Disabled**
3. Click **Apply**

If the Applications menu is not visible, update your firmware first via **System → Upgrade**.

### Step 3: enable SSH

1. Navigate to **System → Advanced → SSH** (or **System → SSH** on older firmware)
2. Enable **SSH Access** on port 22
3. Optionally restrict to LAN only for security

### Step 4: disable AdGuard home via SSH (confirmation)

```bash
# ✅ Connect to the router via SSH
ssh root@192.168.8.1

# ✅ Confirm AdGuard Home is stopped
/etc/init.d/adguardhome stop 2>/dev/null || true
/etc/init.d/adguardhome disable 2>/dev/null || true

# ✅ Verify port 53 is free (only dnsmasq should be listed)
netstat -tlnp 2>/dev/null | grep :53
```

### Step 5: install NextDNS CLI

```bash
# ✅ Update packages and ensure curl is available
opkg update && opkg install curl

# ✅ Run the universal NextDNS installer
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

During installation:

- Set your Profile ID
- Choose **Yes** for router setup (integrates with dnsmasq)
- Choose **Yes** for client info reporting (enables device names in dashboard)

### Step 6: verify

```bash
# ✅ Check NextDNS status
nextdns status

# ✅ Test DNS resolution
nslookup google.com 127.0.0.1

# ✅ Confirm NextDNS is active from any connected device
curl https://test.nextdns.io
```

## Firmware update recovery

GL.iNet firmware updates often re-enable AdGuard Home and may remove the NextDNS CLI installation.
After any firmware update:

```bash
# ✅ Re-disable AdGuard Home
/etc/init.d/adguardhome stop && /etc/init.d/adguardhome disable

# ✅ Reinstall NextDNS CLI
opkg update && opkg install curl
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Upgrading NextDNS CLI

```bash
# Re-run the installer and select "Upgrade" when prompted
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Troubleshooting

### Issue: "curl: not found" during installation

```bash
opkg update
opkg install curl
```

### Issue: AdGuard Home re-appears after reboot

```bash
# Check if the disable actually took effect
ls /etc/rc.d/ | grep -i adguard
# If listed, force-remove the start link
rm -f /etc/rc.d/S*adguardhome
```

### Issue: DNS not working after NextDNS install

```bash
# Restart the NextDNS service
nextdns restart

# Check for errors in the log
nextdns log
```

### Issue: debug installation failure

```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Reference

- [NextDNS CLI Wiki — OpenWrt](https://github.com/nextdns/nextdns/wiki/OpenWrt)
- [GL.iNet Documentation](https://docs.gl-inet.com/)
- [GL.iNet Forum — NextDNS discussion](https://forum.gl-inet.com/)
