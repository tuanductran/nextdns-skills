---
title: OpenWrt Integration
impact: HIGH
impactDescription: Proper installation and configuration of NextDNS on OpenWrt routers ensures network-wide DNS protection. Without this guidance, users may struggle with installation methods, upgrades, or troubleshooting issues specific to OpenWrt environments.
type: capability
tags: openwrt, router, installation, upgrade, troubleshooting, ssh, luci
---

# OpenWrt Integration

**Impact: HIGH** - Essential for deploying NextDNS on OpenWrt routers with proper installation methods and troubleshooting guidance

OpenWrt is a popular open-source firmware for routers that provides extensive customization and control. This rule provides comprehensive guidance for installing, upgrading, and troubleshooting NextDNS on OpenWrt devices.

## Installation Methods

OpenWrt supports two installation methods depending on your version and preferences.

### Method A: Universal Installer (Recommended)

This method works on all OpenWrt versions and provides the most reliable installation experience.

| Step | Action |
|------|--------|
| 1 | Enable SSH in the Web GUI: Navigate to **System → Administration** |
| 2 | Connect to your router via SSH |
| 3 | Install curl: `opkg update && opkg install curl` |
| 4 | Run the NextDNS installer: `sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'` |
| 5 | Follow the on-screen instructions to complete setup |

### Method B: LuCI App (Version 19.07.01-rc2+)

This method is only available for OpenWrt version 19.07.01-rc2 and later. It provides a graphical interface for configuration.

| Step | Action |
|------|--------|
| 1 | Navigate to **System → Software** in the Web GUI |
| 2 | Click **Update lists** to refresh the package repository |
| 3 | Search for and install the `luci-app-nextdns` package |
| 4 | Configure NextDNS at **Services → NextDNS** |

## Upgrading NextDNS

To upgrade an existing NextDNS installation on OpenWrt:

1. Re-run the installer script:
    ```bash
    sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
    ```
2. The installer will detect the existing installation and offer an upgrade option if a new version is available.

## Troubleshooting

### Debug Mode Installation

If the installation fails or encounters errors, run the installer in debug mode to generate detailed logs:

```conf
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```text

This will output verbose information that can help identify the root cause of installation issues.

### Common Issues

- **curl not found**: Ensure curl is installed with `opkg update && opkg install curl`
- **Permission denied**: Make sure you're running commands as root or with sufficient privileges
- **Port 53 conflict**: Check if another DNS service (like dnsmasq) is already using port 53
- **Package not available**: For Method B, verify your OpenWrt version is 19.07.01-rc2 or later

## Usage Examples

### Complete Installation via SSH

```bash
# Connect to router via SSH
ssh root@192.168.1.1

# Update package lists and install curl
opkg update && opkg install curl

# Run NextDNS installer
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'

# Follow the prompts to complete installation
```bash

### Debug Mode Installation

```bash
# Run installer with debug output
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```bash

### Upgrade Existing Installation

```bash
# Re-run the installer to upgrade
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```text
