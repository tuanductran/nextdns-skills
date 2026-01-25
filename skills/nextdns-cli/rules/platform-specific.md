---
title: Platform Specific
impact: HIGH
impactDescription: Platform-specific installation and configuration requirements
type: capability
tags: router, OpenWrt, pfSense, Synology, Ubiquiti, UnifiOS
---

# Platform Specific

**Impact: HIGH** - Tailored setup for routers and specialized operating systems

NextDNS CLI integrates differently depending on the host system, especially on routers where it may need to hook into the local DHCP and DNS service (like dnsmasq).

## Routers (General)

Most routers support the universal installer. Always use the `-setup-router=true` flag to ensure NextDNS integrates correctly with the router's DNS server and DHCP client discovery.

### OpenWrt

For modern versions of OpenWrt:
1. Enable SSH.
2. Install curl: `opkg update && opkg install curl`.
3. Run installer: `sh -c "$(curl -sL https://nextdns.io/install)"`.
4. Alternatively, use the LuCI GUI: `opkg install luci-app-nextdns`.

### pfSense

1. Access the shell (option 8).
2. Run the universal installer.
3. Recommended: Select "Install NextDNS as a service" during the setup.

### Ubiquiti (EdgeOS / UnifiOS)

- **EdgeOS (ER-X, ERL, etc.)**: Use the universal installer via SSH.
- **UnifiOS (UDM/UXG)**: Use the universal installer via SSH. NextDNS CLI can automatically detect and configure itself for these platforms.

### Synology (DSM / SRM)

- **DSM**: Use the universal installer via SSH as root (`sudo -i`).
- **SRM**: Similar to OpenWrt, use the universal installer via SSH.

## Operating Systems

### Linux (Systemd)

NextDNS CLI integrates with `systemd-resolved`. If `nextdns activate` doesn't work, you may need to manually configure `systemd-resolved` to point to `127.0.0.1` or disable it if it conflicts with port 53.

### macOS

The CLI requires `sudo` for most operations. The `activate` command will update the DNS settings in the System Settings app automatically.

### Windows

Run the installation script in an **Elevated (Administrator)** terminal. The CLI will manage the Windows network adapter DNS settings.

## Summary table

| Platform | Recommended Method | Integration Flag |
|----------|--------------------|------------------|
| Routers | Universal Installer | `-setup-router=true` |
| macOS | Universal Installer or Brew | N/A |
| Windows | Installer Script | N/A |
| Linux | Package Manager / Installer | N/A |
