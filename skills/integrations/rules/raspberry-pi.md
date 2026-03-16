---
title: 'Raspberry Pi Integration'
impact: HIGH
impactDescription: 'Without proper DHCP configuration pointing LAN devices to the Pi, NextDNS CLI runs on the Pi but provides no network-wide protection'
type: capability
tags:
  - raspberry pi
  - network-wide
  - dhcp
  - home network
  - pi-hole alternative
  - linux
  - dns server
---

# Raspberry Pi integration

Deploy NextDNS CLI on a Raspberry Pi as a dedicated DNS server for your entire home network

## Overview

Running NextDNS CLI on a Raspberry Pi provides network-wide encrypted DNS filtering without
configuring each device individually. All DNS queries from every device on your network pass
through the Pi to NextDNS.

This is the most popular alternative to Pi-hole — you get powerful filtering without maintaining
local blocklists.

## Prerequisites

- Raspberry Pi running Raspberry Pi OS Bookworm/Bullseye or Ubuntu Server for ARM
- Pi connected to your network via Ethernet (recommended) or Wi-Fi
- Router admin access to change DHCP DNS settings
- A static IP for the Pi

## Setup guide

### Step 1: assign a static IP to the Pi

Configure your router to always assign the same IP to the Pi via DHCP reservation (preferred):

1. Log into your router admin panel
2. Find the DHCP reservations / static leases section
3. Find the Pi's MAC address and assign it `192.168.1.2` (or your preferred IP)

### Step 2: install NextDNS CLI

```bash
# ✅ Connect to your Pi via SSH
ssh pi@192.168.1.2

# ✅ Disable systemd-resolved first (occupies port 53 on modern OS)
sudo systemctl disable systemd-resolved --now
sudo rm -f /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf

# ✅ Install NextDNS CLI
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

Answer the installer prompts:

```text
Profile ID: [your NextDNS profile ID, e.g. abc123]
Setup as a router: Yes
Report client info: Yes
Auto-activate: Yes
```

### Step 3: point your router's DHCP to the Pi

In your router's DHCP settings, set the DNS server to the Pi's IP:

```text
Primary DNS server:   192.168.1.2    ← Raspberry Pi running NextDNS
Secondary DNS server: 9.9.9.9        ← Quad9 as emergency fallback
```

After saving, devices that renew their DHCP lease will automatically use the Pi for DNS.

### Step 4: verify

```bash
# On the Pi — check NextDNS is running
nextdns status

# From any device on the network — confirm NextDNS is active
# Visit https://test.nextdns.io in a browser
# Or on the command line:
curl https://test.nextdns.io
```

## Enabling client names in the dashboard

For the NextDNS dashboard to show device names (for example, "Samsung Galaxy", "MacBook Pro") instead
of IP addresses, the CLI needs to read from mDNS/ARP:

```bash
# ✅ These options are typically selected during installation
# To set them manually:
sudo nextdns config set -report-client-info=true
sudo nextdns config set -mdns=all
sudo nextdns restart
```

## Keeping NextDNS running through Pi reboots

The installer creates a systemd service automatically. Verify:

```bash
sudo systemctl status nextdns
sudo systemctl is-enabled nextdns  # Should show: enabled
```

## Handling Pi downtime (failover)

If the Pi is offline, devices will fall back to the Secondary DNS set in your router (Quad9 in the
example above). This means filtering is temporarily disabled but internet access continues.

For higher availability, run NextDNS CLI on a second Pi and set it as the secondary DNS.

## Troubleshooting

### Issue: devices still using old DNS server after changing DHCP

Force devices to renew their DHCP lease:

```bash
# On Windows clients
ipconfig /release && ipconfig /renew

# On macOS clients
# System Settings → Network → disconnect and reconnect Wi-Fi

# On Linux clients
sudo dhclient -r && sudo dhclient
```

### Issue: Pi shows "port 53 in use"

```bash
# Check what is using the port
sudo ss -tlnp | grep :53

# Most likely cause: systemd-resolved was not fully stopped
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
sudo nextdns restart
```

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/)
