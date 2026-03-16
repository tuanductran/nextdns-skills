---
title: 'Raspberry Pi Installation'
impact: HIGH
impactDescription: 'Without resolving systemd-resolved conflicts and DHCP configuration, NextDNS on Raspberry Pi will fail to intercept network-wide DNS queries'
type: capability
tags:
  - raspberry pi
  - linux
  - network-wide
  - dhcp
  - systemd-resolved
  - local dns
  - pi-hole alternative
---

# Raspberry Pi installation

Deploy NextDNS CLI on a Raspberry Pi as a network-wide DNS resolver for all LAN devices

## Overview

A Raspberry Pi running NextDNS CLI acts as a local DNS proxy for your entire home network — similar
to Pi-hole but without maintaining your own blocklists. Every device sends DNS queries to the Pi,
which forwards them to NextDNS over encrypted DoH.

This approach gives you per-device identification in the NextDNS dashboard, works with devices that
cannot run the NextDNS app (smart TVs, IoT, game consoles), and survives reboots automatically.

## Pre-requisites

- Raspberry Pi running Raspberry Pi OS Bookworm, Bullseye, or Ubuntu Server (ARM)
- Static IP assigned to the Pi (via router DHCP reservation or manual config)
- SSH access to the Pi

## Installation steps

### Step 1: assign a static IP

Configure a DHCP reservation in your router so the Pi always gets the same IP (for example,
`192.168.1.2`). Alternatively, set a static IP on the Pi itself:

```bash
# ✅ Set a static IP via dhcpcd on Raspberry Pi OS
sudo nano /etc/dhcpcd.conf
```

Add to the end of the file:

```conf
interface eth0
static ip_address=192.168.1.2/24
static routers=192.168.1.1
static domain_name_servers=127.0.0.1
```

```bash
sudo systemctl restart dhcpcd
```

### Step 2: disable systemd-resolved

On modern Raspberry Pi OS and Ubuntu, `systemd-resolved` listens on port 53 and will conflict with
NextDNS CLI.

```bash
# ✅ Disable systemd-resolved to free port 53
sudo systemctl disable systemd-resolved
sudo systemctl stop systemd-resolved

# Remove the symlink that points to systemd-resolved's stub resolver
sudo rm /etc/resolv.conf

# Set a temporary resolver so DNS works during setup
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
```

### Step 3: install NextDNS CLI

```bash
# ✅ Universal installer (detects ARM architecture automatically)
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

When prompted:

- **Profile ID**: Enter your NextDNS Configuration ID (for example, `abc123`)
- **Setup router?**: Choose **Yes** — this configures NextDNS to listen on all interfaces
- **Report client info?**: Choose **Yes** — enables device names in the dashboard

### Step 4: verify NextDNS is running

```bash
# ✅ Check daemon status
nextdns status

# ✅ Test DNS resolution via NextDNS
curl https://test.nextdns.io

# ✅ Verify listening on port 53
sudo ss -tlnp | grep :53
```

### Step 5: configure your router DHCP

In your router's DHCP settings, set the **DNS server** to the Pi's static IP:

```text
Primary DNS:   192.168.1.2   (Raspberry Pi running NextDNS)
Secondary DNS: 9.9.9.9       (Quad9 as fallback)
```

After applying, reconnect devices to pick up the new DNS server.

## Auto-start after reboot

The installer sets up a systemd service automatically. Verify it:

```bash
# ✅ Confirm NextDNS starts on boot
sudo systemctl is-enabled nextdns
# Expected output: enabled

# ✅ View service logs
sudo journalctl -u nextdns -f
```

## Troubleshooting

### Issue: port 53 already in use after install

**Symptoms**: `nextdns status` shows an error about binding to port 53.

**Solution**: Check for conflicting services:

```bash
sudo lsof -i :53
# Common conflicts: systemd-resolved, dnsmasq

# If systemd-resolved is still running:
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
sudo nextdns restart
```

### Issue: devices not using NextDNS after DHCP change

**Symptoms**: `curl https://test.nextdns.io` works on the Pi but not on other devices.

**Solution**: Force a DHCP renewal on client devices:

```bash
# Linux clients
sudo dhclient -r && sudo dhclient

# macOS clients — release and renew in System Settings > Network
```

### Issue: debug installation failure

```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki — Linux](https://github.com/nextdns/nextdns/wiki)
- [Raspberry Pi OS Documentation](https://www.raspberrypi.com/documentation/)
