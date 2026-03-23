---
title: 'GL.iNet Router Installation'
impact: HIGH
impactDescription: 'GL.iNet firmware includes AdGuard Home by default — leaving it enabled alongside NextDNS CLI causes DNS resolution failures for all network clients'
type: capability
tags:
  - gl.inet
  - openwrt
  - router
  - adguard
  - installation
  - ssh
  - luci
---

# GL.iNet router installation

Deploy NextDNS CLI on GL.iNet routers while disabling the built-in AdGuard Home to prevent DNS conflicts

## Overview

GL.iNet routers (GL-MT3000 Beryl AX, GL-AXT1800 Slate AX, GL-MT6000 Flint 2, GL-A1300 Slate Plus,
and more) run a customised OpenWrt firmware with GL.iNet's own web UI. They ship with AdGuard Home
pre-installed and enabled by default.

Installing NextDNS CLI without disabling AdGuard Home results in port 53 conflicts and inconsistent
DNS behaviour. The correct sequence is: disable AdGuard Home, then install NextDNS CLI.

## Installation steps

### Step 1: enable SSH access

1. Log in to the GL.iNet web UI (default: `http://192.168.8.1`)
2. Navigate to **System → Advanced → SSH**
3. Enable **SSH Access** and set the SSH port (default: 22)
4. Connect via SSH: `ssh root@192.168.8.1`

### Step 2: disable AdGuard home

```bash
# ✅ Stop AdGuard Home and disable it from starting on boot
/etc/init.d/adguardhome stop
/etc/init.d/adguardhome disable

# Verify it is no longer running
pgrep -a adguardhome || echo "AdGuard Home is stopped"
```

Alternatively, disable via the GL.iNet web UI:

1. Navigate to **Applications → AdGuard Home**
2. Toggle the switch to **Disabled**

### Step 3: verify port 53 is free

```bash
# ✅ Confirm nothing is listening on port 53 before installing
netstat -tlnp 2>/dev/null | grep :53 || ss -tlnp | grep :53
```

If `dnsmasq` is still listed, it will be handled by the NextDNS installer automatically when you
choose the router setup option.

### Step 4: install NextDNS CLI

```bash
# ✅ Update opkg and install curl (if not present)
opkg update && opkg install curl

# ✅ Run the universal installer
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

When the installer prompts:

- **Profile ID**: Enter your NextDNS profile ID
- **Setup as router?**: Choose **Yes**
- **Report client info?**: Choose **Yes** — enables device names in the NextDNS dashboard
- **Auto-activate?**: Choose **Yes**

### Step 5: verify installation

```bash
# ✅ Check NextDNS daemon status
nextdns status

# ✅ Test DNS resolution
nslookup example.com 127.0.0.1

# ✅ Confirm NextDNS is visible from the internet
curl https://test.nextdns.io
```

## Upgrading

To upgrade NextDNS CLI to a newer version:

```bash
# Re-run the installer and select "Upgrade"
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Post-firmware-update recovery

GL.iNet firmware updates may remove the NextDNS CLI installation. After a firmware update:

1. Disable AdGuard Home again (firmware updates re-enable it)
2. Re-run the installer

## Troubleshooting

### Issue: installer fails with "curl: not found"

```bash
opkg update && opkg install curl
```

### Issue: AdGuard Home re-enables after reboot

**Symptoms**: DNS stops working after rebooting; `pgrep adguardhome` shows a running process.

**Solution**: Verify the disable command ran successfully:

```bash
/etc/init.d/adguardhome disable
ls -la /etc/rc.d/ | grep adguardhome
# Should NOT appear in rc.d if disabled
```

### Issue: debug mode installation

```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Reference

- [NextDNS CLI Wiki — OpenWrt](https://github.com/nextdns/nextdns/wiki/OpenWrt)
- [GL.iNet Docs — Interface guide](https://docs.gl-inet.com/router/en/4/interface_guide/)
- [GL.iNet AdGuard Home Docs](https://docs.gl-inet.com/router/en/4/interface_guide/adguardhome/)
