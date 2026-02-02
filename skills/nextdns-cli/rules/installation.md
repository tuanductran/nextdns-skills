---
title: Installation
impact: HIGH
impactDescription: Proper installation of NextDNS CLI on various platforms
type: capability
tags: install, setup, curl, nextdns install, router installation
---

# Installation

**Impact: HIGH** - Essential setup and platform-specific installation

On most platforms, the NextDNS CLI can be installed with a single command. Use this skill when the user needs to set up NextDNS on a new device or router.

## Universal Installer

The following command works for most Linux distributions (Debian, Ubuntu, CentOS, Arch, Alpine), macOS, and many routers:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```bash

### Installation Workflow

1. **Run the script**: Execute the command above.
2. **Follow the menu**: The interactive installer will guide you through the setup.
3. **Enter Profile ID**: You will be prompted for your NextDNS configuration ID (e.g., `abc123`).
4. **Confirm Setup**: The installer will typically ask if you want to:
    * Set up a router configuration (if applicable).
    * Automatically configure system DNS.
    * Initialize the daemon at startup.

## Platform-Specific Installation

While the universal installer is recommended, some platforms have specific considerations:

| Platform | Notes |
|----------|-------|
| **macOS** | Requires `sudo`. Can also be installed via Homebrew: `brew install nextdns`. |
| **Windows** | Run a Command Prompt or PowerShell as Administrator and use the installer script. |
| **OpenWrt** | Official packages are usually available via `opkg`. |
| **pfSense** | Installed via the "Shell" using the universal installer script. |
| **Docker** | Use the official `nextdns/nextdns` image. |

## Important Considerations

* **Profile ID**: Always ensure you have a valid NextDNS profile ID from [my.nextdns.io](https://my.nextdns.io) before starting.
* **Privileges**: Most installation commands require root or `sudo` access.
* **Conflicting Services**: Disable other DNS services (like `systemd-resolved` or local `dnsmasq`) if they conflict with NextDNS listening on port 53.
