---
title: 'EdgeRouter and Firewalla Integration'
impact: MEDIUM
impactDescription: 'Deploy NextDNS on professional gateways like EdgeOS and Firewalla'
type: capability
tags:
  - edgerouter
  - edgeos
  - firewalla
  - ubiquiti
  - gateway
  - installation
---

# EdgeRouter and Firewalla Integration

Strategic deployment of NextDNS on Ubiquiti EdgeRouter (EdgeOS) and Firewalla hardware.

## Ubiquiti EdgeRouter (EdgeOS)

### 1. Enable SSH

- Go to **System** tab (bottom left).
- Check **Enable** in the **SSH Server** section.
- Click **Save**.

### 2. Install

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Firewalla (Gold/Purple/Blue Plus)

Firewalla runs a customized Ubuntu-based OS. You can install the CLI directly on the box.

### 1. Enable SSH

- In the Firewalla app: **Settings** -> **Advanced** -> **Configurations** -> **SSH Server**.
- Note the password.

### 2. Install

```bash
sh -c "$(curl -sL https://nextdns.io/install)"
```

## Critical Configuration

✅ **Client Reporting**: Always enable `Discovery DNS` and `MDNS` in the NextDNS CLI configuration
to ensure Firewalla/EdgeRouter can map internal IP addresses to hostnames in your NextDNS dashboard.

❌ **Port Conflicts**: Ensure no other service is listening on port 53. On EdgeRouter, the NextDNS
installer typically handles `dnsmasq` integration automatically.

## Reference

- [NextDNS CLI Wiki - EdgeOS](https://github.com/nextdns/nextdns/wiki/EdgeOS)
- [NextDNS CLI Wiki - Firewalla](https://github.com/nextdns/nextdns/wiki/Firewalla)
