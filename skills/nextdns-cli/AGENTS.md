# NextDNS CLI Skills

**Version 1.0.0**  
NextDNS Skills  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring NextDNS CLI deployment and system configuration. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Best practices and guidelines for NextDNS CLI deployment and system configuration, ordered by impact.

---

## Table of Contents

1. [Capability rules](#1-capability-rules) — **HIGH**
   - 1.1 [Advanced Features](#11-advanced-features)
   - 1.2 [Advanced Linux Distribution Support](#12-advanced-linux-distribution-support)
   - 1.3 [Advanced systemd-resolved Integration](#13-advanced-systemd-resolved-integration)
   - 1.4 [CLI Cache Configuration](#14-cli-cache-configuration)
   - 1.5 [CLI Configuration File Format](#15-cli-configuration-file-format)
   - 1.6 [Conditional Profile Configuration](#16-conditional-profile-configuration)
   - 1.7 [Daemon Control](#17-daemon-control)
   - 1.8 [DD-WRT Installation](#18-dd-wrt-installation)
   - 1.9 [Docker Deployment](#19-docker-deployment)
   - 1.10 [FreeBSD Installation](#110-freebsd-installation)
   - 1.11 [GL.iNet Router Installation](#111-glinet-router-installation)
   - 1.12 [Installation](#112-installation)
   - 1.13 [macOS Installation](#113-macos-installation)
   - 1.14 [Monitoring](#114-monitoring)
   - 1.15 [NixOS Installation](#115-nixos-installation)
   - 1.16 [Platform Specific](#116-platform-specific)
   - 1.17 [Profile Configuration](#117-profile-configuration)
   - 1.18 [Raspberry Pi Installation](#118-raspberry-pi-installation)
   - 1.19 [Split-Horizon DNS](#119-split-horizon-dns)
   - 1.20 [System Configuration](#120-system-configuration)
   - 1.21 [Troubleshooting](#121-troubleshooting)
   - 1.22 [Windows Installation](#122-windows-installation)
2. [Efficiency rules](#2-efficiency-rules) — **MEDIUM**
   - 2.1 [Best Practices](#21-best-practices)
   - 2.2 [Upgrade and Uninstall](#22-upgrade-and-uninstall)

---

## 1. Capability rules

**Impact: HIGH**

### 1.1 Advanced Features

**Impact: HIGH (Advanced routing, conditional forwarders, and caching configurations)**

Complex routing and performance optimizations

Complex routing and performance optimizations

NextDNS CLI provides advanced features for complex network environments and performance tuning.

Route specific domains to different DNS servers (for example, internal company domains).

Apply different NextDNS profiles based on the client's subnet or MAC address. This is powerful for

router-level installations.

Enable local memory caching to improve performance and provide resilience if upstream is temporarily

unavailable.

- **`-bogus-priv`**: Block reverse lookups for private IP ranges (default: `true`).

- **`-detect-captive-portals`**: Automatic detection and fallback on system DNS for captive portal

  login.

- **`-timeout`**: Maximum duration allowed for a request (default: `5s`).

- **`-max-inflight-requests`**: Maximum simultaneous requests (default: `256`).

NextDNS CLI can act as a proxy for any DoH provider:

- [NextDNS CLI - Advanced Usage](https://github.com/nextdns/nextdns#advanced-usage)

### 1.2 Advanced Linux Distribution Support

**Impact: MEDIUM (Ensures reliable installation on non-standard Linux distributions)**

Manual and advanced installation methods for Alpine Linux, Arch Linux, and other distributions.

Manual and advanced installation methods for Alpine Linux, Arch Linux, and other distributions.

While the standard installer script works for most, specific distributions like Alpine (musl-based)

or Arch (AUR-centric) benefit from native package management for better lifecycle control.

If using the binary directly on Alpine, ensure you use the `alpine` specific downloads if not using

`apk`, as standard binaries might fail due to missing `glibc`.

Always run `nextdns install` or `nextdns config` commands with `sudo` to ensure the systemd or init

services can be correctly registered.

- [NextDNS Wiki - Linux Setup](https://github.com/nextdns/nextdns/wiki)

**Correct: 1. Arch Linux (via aur)**

```bash
# ✅ Install using yay or other AUR helper
yay -S nextdns

# ✅ Configure for workstation use
sudo nextdns install \
  -profile abc123 \
  -report-client-info \
  -auto-activate
```

**Correct: 2. Alpine Linux (manual apk)**

```bash
# ✅ Add NextDNS repository
sudo wget -O /etc/apk/keys/nextdns.pub https://repo.nextdns.io/nextdns.pub
echo https://repo.nextdns.io/apk | sudo tee -a /etc/apk/repositories >/dev/null

# ✅ Install via apk
sudo apk update
sudo apk add nextdns

# ✅ Configure for router setup
sudo nextdns install -profile abc123 -setup-router
```

**Correct: 3. Rpm-based (fedora/centos/rhel)**

```bash
# ✅ Create repo file
cat <<EOF | sudo tee /etc/yum.repos.d/nextdns.repo
[nextdns]
name=NextDNS Repository
baseurl=https://repo.nextdns.io/rpm
enabled=1
gpgcheck=1
gpgkey=https://repo.nextdns.io/nextdns.pub
EOF

# ✅ Install
sudo dnf install nextdns
```

### 1.3 Advanced systemd-resolved Integration

**Impact: HIGH (Misconfiguring systemd-resolved leaves port 53 occupied, preventing NextDNS from binding and causing silent DNS failures across all applications)**

Configure NextDNS CLI alongside systemd-resolved on modern Linux distributions correctly

Configure NextDNS CLI alongside systemd-resolved on modern Linux distributions correctly

Most modern Linux distributions (Ubuntu 20.04+, Fedora, Arch, Debian 11+) use `systemd-resolved`

as a stub resolver listening on `127.0.0.53:53`. This conflicts with NextDNS CLI which also needs

port 53.

There are two integration strategies:

1. **Disable systemd-resolved** and let NextDNS manage `/etc/resolv.conf` directly (simpler,

   recommended for dedicated DNS servers).

2. **Integrate alongside systemd-resolved** by configuring `systemd-resolved` to use NextDNS as its

   upstream (preserves DNSSEC, mDNS, and per-link resolution).

Use this approach on workstations and servers where you want NextDNS to have full control.

Use this approach when you need systemd-resolved features (per-interface DNS, LLMNR, mDNS).

**Symptoms**: Commands like `ping google.com` fail with "Name or service not known".

**Solution**: NextDNS must be activated to write `/etc/resolv.conf`:

**Symptoms**: VPN split-DNS or company domain resolution stops working.

**Solution**: With Strategy 2, `systemd-resolved` forwards all queries through NextDNS. Use

NextDNS CLI's `-forwarder` option instead to route internal domains directly:

- [systemd-resolved man page](https://manpages.debian.org/bookworm/systemd-resolved/resolved.conf.5.en.html)

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)

- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)

**Incorrect:**

```bash
# ❌ Leaving both systemd-resolved stub AND NextDNS on port 53 simultaneously
# This causes "address already in use" errors
nextdns install -listen :53  # ❌ Fails if systemd-resolved stub is active

# ❌ Setting DNS in resolved.conf without disabling DNSStubListener
# The stub on 127.0.0.53 will intercept queries before they reach NextDNS
[Resolve]
DNS=127.0.0.1:5300
# ❌ Missing: DNSStubListener=no
```

### 1.4 CLI Cache Configuration

**Impact: MEDIUM (Optimize DNS performance and latency with CLI caching)**

The NextDNS CLI features a sophisticated built-in cache to reduce latency and minimize upstream

The NextDNS CLI features a sophisticated built-in cache to reduce latency and minimize upstream

queries.

You can configure the cache using the `nextdns config set` command:

Sets the total size of the DNS cache.

- **Recommended**: `10MB` for home use, `50MB+` for large networks.

- **Command**: `nextdns config set -cache-size=10MB`

- **Note**: Set to `0` to disable caching.

Overrides the record's TTL if the TTL is higher than this value.

- **Usage**: Useful for forcing faster profile changes.

- **Command**: `nextdns config set -cache-max-age=5m`

Defines the maximum TTL value handed out to clients.

- **Command**: `nextdns config set -max-ttl=5m`

- **Difference from Max Age**: `max-ttl` controls what the _client_ sees, while `cache-max-age`

  controls how long the _NextDNS CLI_ keeps it in its own cache.

✅ **Recommended Setup**:

This ensures:

1. Speedy responses for frequent domains.

2. NextDNS CLI refreshes its data at least every 10 minutes.

3. Clients come back to the CLI every 5 minutes to check for updates.

Check cache performance via status:

- [NextDNS CLI Wiki - Cache Configuration](https://github.com/nextdns/nextdns/wiki/Cache-Configuration)

### 1.5 CLI Configuration File Format

**Impact: MEDIUM (Directly manage the nextdns.conf file for advanced automation)**

The NextDNS CLI stores its settings in a simple key-value format. Understanding this file is

The NextDNS CLI stores its settings in a simple key-value format. Understanding this file is

essential for infrastructure-as-code and advanced automation.

- **Linux/UNIX**: `/etc/nextdns.conf`

- **macOS**: `/Library/Application Support/NextDNS/nextdns.conf`

The file consists of flags without the leading dash, followed by the value.

You can specify multiple profiles based on conditions directly in the file:

While you can edit the file manually, it is safer to use the built-in commands:

- **View current file path**: `nextdns config`

- **Edit in default editor**: `nextdns config edit`

- **Set specific value**: `nextdns config set -log-queries=true`

- [NextDNS CLI Wiki - Configuration File Format](https://github.com/nextdns/nextdns/wiki/Configuration-File-Format)

### 1.6 Conditional Profile Configuration

**Impact: HIGH (Identifies and applies specific profiles to different LAN clients)**

Configure the NextDNS CLI to apply different profiles based on LAN client subnets or MAC addresses.

Configure the NextDNS CLI to apply different profiles based on LAN client subnets or MAC addresses.

When running as a network-wide resolver (on a router or central server), the NextDNS CLI can

distinguish between clients and apply specific filtering policies beyond the default profile.

- **Order Matters**: Define specific targets (MAC addresses) before broader ones (subnets) if there

  is overlap.

- **Catch-all**: Always include a standalone profile ID as the fallback for all other traffic.

- **Reporting**: Combine with `-report-client-info` to see client names in the dashboard.

- [NextDNS CLI Wiki - Conditional Profile](https://github.com/nextdns/nextdns/wiki/Conditional-Profile)

**Correct: Implementation via CLI**

```bash
# ✅ Set multiple conditional profiles
# - 10.0.4.0/24 subnet uses profile 123456
# - MAC 00:1c:42:2e:60:4a uses profile 789012
# - Default for everyone else is abc123
sudo nextdns config set \
    -profile 10.0.4.0/24=123456 \
    -profile 00:1c:42:2e:60:4a=789012 \
    -profile abc123

# Restart to apply
sudo nextdns restart
```

**Correct: In configuration file**

```conf
# ✅ Multiple profile lines or comma-separated
profile 10.0.4.0/24=123456
profile 00:1c:42:2e:60:4a=789012
profile abc123
```

**Incorrect:**

```bash
# ❌ Incorrect: Missing default profile or malformed condition
sudo nextdns config set -profile 10.0.4.0/24:123456
```

### 1.7 Daemon Control

**Impact: MEDIUM (Managing the NextDNS service state and background processes)**

Controlling the background service process

Controlling the background service process

Once installed as a service, use these commands to manage the NextDNS background daemon.

| Action        | Command             | Description                                                            |

| ------------- | ------------------- | ---------------------------------------------------------------------- |

| **Start**     | `nextdns start`     | Starts the NextDNS background service.                                 |

| **Stop**      | `nextdns stop`      | Stops the NextDNS background service.                                  |

| **Restart**   | `nextdns restart`   | Restarts the NextDNS background service (useful after config changes). |

| **Status**    | `nextdns status`    | Displays the current running status of the daemon.                     |

| **Install**   | `nextdns install`   | Installs the NextDNS daemon as a system service.                       |

| **Uninstall** | `nextdns uninstall` | Removes the NextDNS daemon from system services.                       |

- **Run Subcommand**: Avoid using `nextdns run` unless you are debugging and need to run the service

  in the foreground. Permanent installations should always use the service manager via

  `nextdns start`.

- **Permissions**: These commands usually require administrative privileges (`sudo` on Linux/macOS,

  Administrator privileges on Windows).

- **Restarting**: If you manually edit the configuration file without using `nextdns config set`,

  you MUST restart the service for changes to take effect.

- [NextDNS CLI - Commands](https://github.com/nextdns/nextdns#commands)

### 1.8 DD-WRT Installation

**Impact: HIGH ()**

Essential setup for NextDNS CLI on DD-WRT routers with persistent configuration

Essential setup for NextDNS CLI on DD-WRT routers with persistent configuration

NextDNS CLI has no native GUI support on DD-WRT and must be installed on JFFS storage to ensure

persistence across reboots. Proper setup requires enabling JFFS, configuring time synchronization,

and protecting custom DNS settings.

- NextDNS CLI has no native GUI support on DD-WRT

- Must be installed on JFFS (JFFS2 filesystem) for persistence

- Requires SSH access to the router

- Router must have sufficient JFFS storage space

JFFS must be enabled and properly wiped before installing NextDNS CLI:

1. Navigate to **Administration** > **Management** in the DD-WRT web GUI

2. Locate the **JFFS2 Support** section

3. Enable the following options:

   - **Enable JFFS2**: Set to **Enable**

   - **Clean JFFS2**: Set to **Enable** (only for initial setup or when wiping data)

4. Click **Apply Settings**

5. Wait for the router to process the changes

6. After the flash storage is wiped, disable **Clean JFFS2** and click **Apply Settings** again

7. Reboot the router to ensure JFFS is mounted properly

**Important**: The "Clean JFFS2" option should only be enabled once during initial setup. Leaving it

enabled will erase JFFS contents on every reboot.

Connect to your DD-WRT router via SSH and run the universal installer:

The installer will:

- Detect DD-WRT as the platform

- Install NextDNS CLI to `/jffs/nextdns/`

- Configure the service to start automatically

- Set up integration with dnsmasq

To upgrade an existing NextDNS CLI installation, re-run the same installer command:

The installer automatically detects existing installations and performs an upgrade.

DD-WRT may experience x509 certificate errors during boot due to incorrect system time. To prevent

this, configure an NTP forwarder:

This ensures that NTP queries for `2.pool.ntp.org` are forwarded to your upstream DNS, preventing

certificate validation failures during the boot sequence when the system clock hasn't synchronized

yet.

NextDNS CLI modifies the default dnsmasq configuration. To protect custom dnsmasq settings and

ensure they persist across NextDNS updates:

1. Create a persistent dnsmasq configuration file:

   ```bash

   mkdir -p /jffs/etc

   touch /jffs/etc/dnsmasq.conf

   ```

2. Add your custom dnsmasq settings to `/jffs/etc/dnsmasq.conf`:

   ```conf

   # Example custom settings

   dhcp-option=option:router,192.168.1.1

   dhcp-option=option:dns-server,127.0.0.1

   ```

3. This file will be preserved when NextDNS CLI updates or modifies the main dnsmasq configuration

**Why this matters**: NextDNS CLI edits the default dnsmasq configuration during installation and

updates. Using a separate persistent file ensures your custom settings are not overwritten.

If you encounter issues during installation, run the installer in debug mode to get detailed

diagnostic output:

Common issues and solutions:

- **JFFS not mounted**: Verify JFFS is enabled in Administration > Management and reboot the router

- **Installation fails**: Ensure you have sufficient JFFS storage space using `df -h /jffs`

- **Certificate errors**: Apply the NTP forwarder workaround described above

- **dnsmasq conflicts**: Check `/tmp/dnsmasq.conf` for conflicts with existing rules

- [NextDNS CLI - DD-WRT](https://github.com/nextdns/nextdns/wiki/DD-WRT)

### 1.9 Docker Deployment

**Impact: HIGH ()**

Essential container deployment patterns for optimal DNS resolution and client tracking

Essential container deployment patterns for optimal DNS resolution and client tracking

NextDNS CLI is available as pre-built Docker images on DockerHub (`nextdns/nextdns`), enabling

containerized deployments across various platforms. The networking mode significantly affects

functionality, particularly for host detection and client IP visibility.

Using host network mode allows the NextDNS CLI container to see actual LAN IP addresses and enables

host detection features:

- **Real IP Visibility**: The CLI sees actual client IP addresses from your LAN instead of Docker's

  internal NAT IPs.

- **Host Detection**: Automatic device identification works properly since the CLI can observe

  network traffic patterns.

- **Performance**: Eliminates NAT overhead for DNS queries.

- **Simplicity**: No port mapping required, direct access to port 53.

- Host network mode only works on Linux hosts.

- The container shares the host's network stack directly.

- Ensure no other service is listening on port 53 on the host.

When host network mode is not available or desired, use port mapping:

- **NAT IP Addresses**: All clients appear as internal Docker NATed IP addresses (typically from the

  Docker bridge network).

- **No Host Detection**: Device identification features will not work properly.

- **Query Attribution**: All queries appear to come from the Docker container's IP rather than

  individual clients.

- On macOS or Windows Docker Desktop where host networking is not supported.

- In environments where network isolation is required.

- For testing or development purposes.

The `--restart unless-stopped` flag ensures the container automatically restarts on system boot and

after Docker daemon restarts:

- `unless-stopped`: Container restarts automatically unless explicitly stopped (recommended for

  production).

- `always`: Container always restarts, even after manual stops (not recommended).

- `on-failure`: Only restarts on non-zero exit codes.

- `no`: No automatic restart (default, not recommended for DNS services).

To persist configuration across container restarts, mount the configuration directory:

This allows the CLI to store and read configuration from `/etc/nextdns` on the host system.

- **Always Use Restart Policy**: DNS services must be highly available. Use

  `--restart unless-stopped` for production deployments.

- **Prefer Host Network Mode**: On Linux systems, host network mode provides the best functionality

  and performance.

- **Profile ID Management**: Store profile IDs securely, consider using Docker secrets or

  environment variables for sensitive configurations.

- **Resource Limits**: In production, consider setting memory and CPU limits to prevent resource

  exhaustion.

- **Logging**: Use Docker logging drivers to capture and rotate NextDNS CLI logs appropriately.

If port 53 is already in use:

Check logs for errors:

- [NextDNS CLI - Docker](https://github.com/nextdns/nextdns/wiki/Docker)

### 1.10 FreeBSD Installation

**Impact: HIGH ()**

Install and configure NextDNS CLI on FreeBSD using pkg or the ports collection

Install and configure NextDNS CLI on FreeBSD using pkg or the ports collection

FreeBSD supports NextDNS CLI through the official package repository (`pkg`) and the ports

collection. Service management on FreeBSD uses `rc.conf` and the `service` command rather than

systemd. The standard universal installer also works on FreeBSD as an alternative.

**Symptoms**: `Permission denied` when running the installer.

**Solution**: Run as root or with `sudo`:

**Symptoms**: NextDNS daemon is not running after a system reboot.

**Solution**: Verify `nextdns_enable="YES"` is present in `/etc/rc.conf`:

- [NextDNS CLI Wiki — FreeBSD](https://github.com/nextdns/nextdns/wiki/FreeBSD)

- [FreeBSD pkg Documentation](https://docs.freebsd.org/en/books/handbook/ports/#pkgng-intro)

- [FreeBSD Ports Collection](https://docs.freebsd.org/en/books/handbook/ports/#ports-using)

**Correct: Method 1: universal installer (recommended)**

```bash
# ✅ Simplest method — handles binary, service registration, and activation
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

Follow the interactive prompts to set your profile ID and install mode (host or router).

**Correct: Method 2: pkg (binary package)**

```bash
# ✅ Install from the official FreeBSD package repository
pkg install nextdns
```

After installing, configure and start the service:

**Correct:**

```bash
# ✅ Install as a persistent service (host mode)
nextdns install \
  -profile abc123 \
  -report-client-info \
  -auto-activate

# ✅ Router mode — listen on all interfaces
nextdns install \
  -profile abc123 \
  -report-client-info \
  -setup-router
```

**Correct: Method 3: ports collection**

```bash
# ✅ Install from source using the ports collection
cd /usr/ports/dns/nextdns
make install clean
```

**Correct: Service management**

```bash
# ✅ Start the service
service nextdns start

# ✅ Stop the service
service nextdns stop

# ✅ Check status
service nextdns status

# ✅ View logs
nextdns log
```

**Correct: Manual rc.conf entry**

```bash
# ✅ Enable nextdns at boot
echo 'nextdns_enable="YES"' >> /etc/rc.conf

# ✅ Start immediately
service nextdns start
```

**Incorrect:**

```bash
# ❌ Using systemctl — FreeBSD does not use systemd
systemctl start nextdns   # ❌ Command not found on FreeBSD

# ❌ Using apt/yum — wrong package manager for FreeBSD
apt install nextdns   # ❌
yum install nextdns   # ❌
```

### 1.11 GL.iNet Router Installation

**Impact: HIGH (GL.iNet firmware includes AdGuard Home by default — leaving it enabled alongside NextDNS CLI causes DNS resolution failures for all network clients)**

Deploy NextDNS CLI on GL.iNet routers while disabling the built-in AdGuard Home to prevent DNS conflicts

Deploy NextDNS CLI on GL.iNet routers while disabling the built-in AdGuard Home to prevent DNS conflicts

GL.iNet routers (GL-MT3000 Beryl AX, GL-AXT1800 Slate AX, GL-MT6000 Flint 2, GL-A1300 Slate Plus,

and more) run a customised OpenWrt firmware with GL.iNet's own web UI. They ship with AdGuard Home

pre-installed and enabled by default.

Installing NextDNS CLI without disabling AdGuard Home results in port 53 conflicts and inconsistent

DNS behaviour. The correct sequence is: disable AdGuard Home, then install NextDNS CLI.

1. Log in to the GL.iNet web UI (default: `http://192.168.8.1`)

2. Navigate to **System → Advanced → SSH**

3. Enable **SSH Access** and set the SSH port (default: 22)

4. Connect via SSH: `ssh root@192.168.8.1`

Alternatively, disable via the GL.iNet web UI:

1. Navigate to **Applications → AdGuard Home**

2. Toggle the switch to **Disabled**

If `dnsmasq` is still listed, it will be handled by the NextDNS installer automatically when you

choose the router setup option.

When the installer prompts:

- **Profile ID**: Enter your NextDNS profile ID

- **Setup as router?**: Choose **Yes**

- **Report client info?**: Choose **Yes** — enables device names in the NextDNS dashboard

- **Auto-activate?**: Choose **Yes**

To upgrade NextDNS CLI to a newer version:

GL.iNet firmware updates may remove the NextDNS CLI installation. After a firmware update:

1. Disable AdGuard Home again (firmware updates re-enable it)

2. Re-run the installer

**Symptoms**: DNS stops working after rebooting; `pgrep adguardhome` shows a running process.

**Solution**: Verify the disable command ran successfully:

- [NextDNS CLI Wiki — OpenWrt](https://github.com/nextdns/nextdns/wiki/OpenWrt)

- [GL.iNet Docs — Interface guide](https://docs.gl-inet.com/router/en/4/interface_guide/)

- [GL.iNet AdGuard Home Docs](https://docs.gl-inet.com/router/en/4/interface_guide/adguardhome/)

### 1.12 Installation

**Impact: HIGH (Proper installation of NextDNS CLI on various platforms)**

Essential setup and platform-specific installation

Essential setup and platform-specific installation

On most platforms, the NextDNS CLI can be installed with a single command. Use this skill when the

user needs to set up NextDNS on a new device or router.

The following command works for most Linux distributions (Debian, Ubuntu, CentOS, Arch, Alpine),

macOS, and many routers:

1. **Run the script**: Execute the command above.

2. **Follow the menu**: The interactive installer will guide you through the setup.

3. **Enter Profile ID**: You will be prompted for your NextDNS configuration ID (for example, `abc123`).

4. **Confirm Setup**: The installer will typically ask if you want to:

   - Set up a router configuration (if applicable).

   - Automatically configure system DNS.

   - Initialize the daemon at startup.

While the universal installer is recommended, some platforms have specific considerations:

| Platform    | Notes                                                                             |

| ----------- | --------------------------------------------------------------------------------- |

| **macOS**   | Requires `sudo`. Can also be installed via Homebrew: `brew install nextdns`.      |

| **Windows** | Run a Command Prompt or PowerShell as Administrator and use the installer script. |

| **OpenWrt** | Official packages are usually available via `opkg`.                               |

| **pfSense** | Installed via the "Shell" using the universal installer script.                   |

| **Docker**  | Use the official `nextdns/nextdns` image.                                         |

- **Profile ID**: Always ensure you have a valid NextDNS profile ID from

  [my.nextdns.io](https://my.nextdns.io) before starting.

- **Privileges**: Most installation commands require root or `sudo` access.

- **Conflicting Services**: Disable other DNS services (like `systemd-resolved` or local `dnsmasq`)

  if they conflict with NextDNS listening on port 53.

- [NextDNS CLI - Installation](https://github.com/nextdns/nextdns/wiki#installation)

- [NextDNS CLI - Getting Started](https://github.com/nextdns/nextdns#get-started)

### 1.13 macOS Installation

**Impact: HIGH ()**

Essential setup methods and configuration options for macOS systems

Essential setup methods and configuration options for macOS systems

This rule provides comprehensive guidance for installing and configuring NextDNS CLI on macOS,

covering the universal installer, Homebrew installation, Mac App Store alternative, and

platform-specific configuration options.

The recommended method for installing NextDNS CLI on macOS is using the universal one-liner command:

This command will:

1. Download and execute the NextDNS installer script

2. Present an interactive menu to guide you through the setup

3. Prompt for your NextDNS configuration ID

4. Configure the system DNS settings automatically

5. Install and activate the NextDNS daemon

Follow the on-screen instructions to complete the installation. The installer will handle all

necessary permissions and system configurations.

To upgrade NextDNS CLI to the latest version, simply re-run the installer command:

The installer will detect the existing installation and automatically upgrade to the new version if

available. No additional steps are required for upgrades.

For users who prefer package management via Homebrew, NextDNS CLI is available through a custom tap:

For a personal workstation or laptop, use the following configuration:

Replace `<id>` with your NextDNS configuration ID. This command will:

- Install NextDNS with the specified configuration ID

- Enable client info reporting for better analytics

- Automatically activate DNS on system startup

For a router or server setup where NextDNS acts as a DNS proxy for other devices:

Replace `<id>` with your NextDNS configuration ID. This command will:

- Install NextDNS with the specified configuration ID

- Enable client info reporting

- Configure NextDNS to operate in router mode with proper DHCP integration

NextDNS is also available as a native Mac application through the Mac App Store. This provides a

user-friendly GUI alternative to the CLI:

1. Download NextDNS from the Mac App Store

2. Launch the application

3. Open Preferences

4. Navigate to the "Custom config" section

5. Enter your NextDNS configuration ID

The Mac App Store version provides the same functionality as the CLI but with a graphical interface

for easier management. It's ideal for users who prefer not to use the command line.

If you encounter issues during installation or configuration, you can enable debug mode for detailed

logging:

This will provide verbose output to help diagnose installation problems. Common issues and their

solutions:

- **Permission denied**: Ensure you're running commands with `sudo` when required

- **Port conflicts**: Check if other DNS services are running on port 53

- **Configuration not applying**: Verify your NextDNS configuration ID is correct

If issues persist after troubleshooting, contact the NextDNS support team:

- Email: team@nextdns.io

- Include debug output and system information when reporting issues

- Always verify your NextDNS configuration ID before installation

- Use `-report-client-info` to enable per-device analytics in your NextDNS dashboard

- For workstations, use `-auto-activate` to ensure DNS protection starts automatically

- For routers/servers, use `-setup-router` to properly integrate with local network services

- Keep NextDNS CLI updated by periodically re-running the installer

- [NextDNS CLI - macOS](https://github.com/nextdns/nextdns/wiki/macOS)

### 1.14 Monitoring

**Impact: MEDIUM (Monitoring DNS queries, logs, and client activity)**

Real-time observation and metrics of DNS traffic

Real-time observation and metrics of DNS traffic

Use these commands to monitor the health and activity of the NextDNS proxy.

To view the real-time activity and startup logs of the daemon:

If you have caching enabled, you can monitor its performance:

See which clients are currently being discovered on the local network (useful for router

installations):

Enable direct logging of DNS queries to the console (useful for debugging specific blocked domains):

**Note**: Query logging can produce a lot of data and is not recommended for long-term use in

high-traffic environments.

- [NextDNS CLI - Commands](https://github.com/nextdns/nextdns#commands)

### 1.15 NixOS Installation

**Impact: HIGH ()**

Install and configure NextDNS CLI on NixOS using declarative system configuration

Install and configure NextDNS CLI on NixOS using declarative system configuration

NixOS manages system state declaratively through `/etc/nixos/configuration.nix`. The standard

`sh -c "$(curl -sL https://nextdns.io/install)"` installer **will not persist** across

`nixos-rebuild switch` because NixOS regenerates system files from configuration. Always use the

native `services.nextdns` NixOS module instead.

After `nixos-rebuild switch`, manage the service with standard systemd commands:

Upgrades are handled by the Nix package manager. Update the package in your channel and rebuild:

**Symptoms**: `systemctl status nextdns` shows failed state.

**Solution**: Check the arguments syntax — each flag and value must be a separate list item in the

`arguments` array.

**Symptoms**: `/etc/resolv.conf` still points to old nameservers.

**Solution**: Ensure `-auto-activate` is in `arguments`, or set `networking.nameservers` explicitly:

- [NextDNS CLI Wiki — Nix](https://github.com/nextdns/nextdns/wiki/Nix)

- [NixOS Manual — Services](https://nixos.org/manual/nixos/stable/)

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)

**Correct: Minimal host mode**

```nix
# ✅ Enable NextDNS as a managed systemd service
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

Apply the configuration:

**Correct:**

```bash
sudo nixos-rebuild switch
```

**Correct: Router mode LAN DNS**

```nix
# ✅ Router mode — listen on all interfaces for LAN clients
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-report-client-info"
      "-listen" ":53"
      "-setup-router"
    ];
  };

  # Allow DNS traffic through the firewall
  networking.firewall.allowedUDPPorts = [ 53 ];
  networking.firewall.allowedTCPPorts = [ 53 ];
}
```

**Correct: Conditional profiles (subnet-based)**

```nix
# ✅ Assign different profiles per subnet
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "10.0.0.0/24=abc123"
      "-profile" "10.0.1.0/24=def456"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

**Correct: With cache boost**

```nix
# ✅ Enable local DNS cache
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-cache-size" "10MB"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

**Incorrect:**

```bash
# ❌ Running the imperative installer on NixOS
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
# Changes will be overwritten on the next nixos-rebuild switch

# ❌ Manually editing /etc/resolv.conf or systemd-resolved on NixOS
# NixOS manages these files declaratively
```

### 1.16 Platform Specific

**Impact: HIGH (Platform-specific installation and configuration requirements)**

Tailored setup for routers and specialized operating systems

Tailored setup for routers and specialized operating systems

NextDNS CLI integrates differently depending on the host system, especially on routers where it may

need to hook into the local DHCP and DNS service (like dnsmasq).

Most routers support the universal installer. Always use the `-setup-router=true` flag to ensure

NextDNS integrates correctly with the router's DNS server and DHCP client discovery.

For modern versions of OpenWrt:

1. Enable SSH.

2. Install curl: `opkg update && opkg install curl`.

3. Run installer: `sh -c "$(curl -sL https://nextdns.io/install)"`.

4. Alternatively, use the LuCI GUI: `opkg install luci-app-nextdns`.

1. Access the shell (option 8).

2. Run the universal installer.

3. Recommended: Select "Install NextDNS as a service" during the setup.

- **EdgeOS (ER-X, ERL, and more)**: Use the universal installer via SSH.

- **UnifiOS (UDM/UXG)**: Use the universal installer via SSH. NextDNS CLI can automatically detect

  and configure itself for these platforms.

- **DSM**: Use the universal installer via SSH as root (`sudo -i`).

- **SRM**: Similar to OpenWrt, use the universal installer via SSH.

NextDNS CLI integrates with `systemd-resolved`. If `nextdns activate` doesn't work, you may need to

manually configure `systemd-resolved` to point to `127.0.0.1` or disable it if it conflicts with

port 53.

The CLI requires `sudo` for most operations. The `activate` command will update the DNS settings in

the System Settings app automatically.

Run the installation script in an **Elevated (Administrator)** terminal. The CLI will manage the

Windows network adapter DNS settings.

| Platform | Recommended Method          | Integration Flag     |

| -------- | --------------------------- | -------------------- |

| Routers  | Universal Installer         | `-setup-router=true` |

| macOS    | Universal Installer or Brew | N/A                  |

| Windows  | Installer Script            | N/A                  |

| Linux    | Package Manager / Installer | N/A                  |

- [NextDNS CLI - Router Setup](https://github.com/nextdns/nextdns/wiki/Router-Setup)

### 1.17 Profile Configuration

**Impact: HIGH (Managing NextDNS profile IDs and general configuration settings)**

Managing core NextDNS profile and service settings

Managing core NextDNS profile and service settings

The CLI uses specific flags to connect to your NextDNS cloud dashboard and control local proxy

behavior.

Setting the primary NextDNS profile is the most important configuration step:

| Command                      | Description                                                       |

| ---------------------------- | ----------------------------------------------------------------- |

| `nextdns config set [flags]` | Sets specific configuration values.                               |

| `nextdns config edit`        | Opens the configuration file in a text editor for manual editing. |

| `nextdns config list`        | Lists all current configuration values.                           |

- **`-profile`**: Your NextDNS configuration ID (for example, `abc123`).

- **`-report-client-info`**: Enable this to see device names in your NextDNS dashboard

  (`true`/`false`).

- **`-auto-activate`**: Automatically set system DNS to 127.0.0.1 on start.

- **`-setup-router`**: Automatically configure for router setups (integrates with many router

  firmwares).

- **`-use-hosts`**: Lookup `/etc/hosts` before sending queries upstream (default: `true`).

- **`-mdns`**: Enable mDNS to discover client information (default: `"all"`).

If you use `nextdns config edit`, the file format is a simple list of flags:

**Note**: After editing the configuration file manually or using `config set`, you typically need to

`nextdns restart` for the changes to take effect.

- [NextDNS CLI - Configuration](https://github.com/nextdns/nextdns/wiki#configuration)

### 1.18 Raspberry Pi Installation

**Impact: HIGH (Without resolving systemd-resolved conflicts and DHCP configuration, NextDNS on Raspberry Pi will fail to intercept network-wide DNS queries)**

Deploy NextDNS CLI on a Raspberry Pi as a network-wide DNS resolver for all LAN devices

Deploy NextDNS CLI on a Raspberry Pi as a network-wide DNS resolver for all LAN devices

A Raspberry Pi running NextDNS CLI acts as a local DNS proxy for your entire home network — similar

to Pi-hole but without maintaining your own blocklists. Every device sends DNS queries to the Pi,

which forwards them to NextDNS over encrypted DoH.

This approach gives you per-device identification in the NextDNS dashboard, works with devices that

cannot run the NextDNS app (smart TVs, IoT, game consoles), and survives reboots automatically.

- Raspberry Pi running Raspberry Pi OS Bookworm, Bullseye, or Ubuntu Server (ARM)

- Static IP assigned to the Pi (via router DHCP reservation or manual config)

- SSH access to the Pi

Configure a DHCP reservation in your router so the Pi always gets the same IP (for example,

`192.168.1.2`). Alternatively, set a static IP on the Pi itself:

Add to the end of the file:

On modern Raspberry Pi OS and Ubuntu, `systemd-resolved` listens on port 53 and will conflict with

NextDNS CLI.

When prompted:

- **Profile ID**: Enter your NextDNS Configuration ID (for example, `abc123`)

- **Setup router?**: Choose **Yes** — this configures NextDNS to listen on all interfaces

- **Report client info?**: Choose **Yes** — enables device names in the dashboard

In your router's DHCP settings, set the **DNS server** to the Pi's static IP:

After applying, reconnect devices to pick up the new DNS server.

The installer sets up a systemd service automatically. Verify it:

**Symptoms**: `nextdns status` shows an error about binding to port 53.

**Solution**: Check for conflicting services:

**Symptoms**: `curl https://test.nextdns.io` works on the Pi but not on other devices.

**Solution**: Force a DHCP renewal on client devices:

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)

- [NextDNS CLI Wiki — Linux](https://github.com/nextdns/nextdns/wiki)

- [Raspberry Pi Documentation (GitHub)](https://github.com/raspberrypi/documentation)

### 1.19 Split-Horizon DNS

**Impact: MEDIUM (Resolve internal network domains while using NextDNS)**

Split-Horizon DNS allows you to resolve local network domains (like `home.lan` or `nas.local`) using

Split-Horizon DNS allows you to resolve local network domains (like `home.lan` or `nas.local`) using

your local DNS server while forwarding all other traffic to NextDNS.

Use the `-forwarder` flag to point specific domains to a local resolver.

- **Multiple Upstreams**: `lan=192.168.1.1,192.168.1.2` (provides failover).

- **Encrypted Forwarders**: You can point to another DoH provider:

  ```bash

  nextdns config set -forwarder google.com=https://dns.google/dns-query

  ```

✅ **Short-circuit lookups**: Use `-bogus-priv` (default: true) to prevent private reverse lookups

(for example, `168.192.in-addr.arpa`) from leaking to NextDNS.

✅ **Hosts File**: Enable `use-hosts` (default: true) to ensure `/etc/hosts` entries on the router

are respected before any network query.

- [NextDNS CLI Wiki - Split-Horizon](https://github.com/nextdns/nextdns/wiki/Split-Horizon)

### 1.20 System Configuration

**Impact: HIGH (Configuring local system DNS settings to use NextDNS)**

Modifying system-wide DNS resolver settings

Modifying system-wide DNS resolver settings

The `nextdns` command can automatically manage the local machine's DNS settings to point to the

local proxy.

To point your local system resolver to the NextDNS CLI proxy:

This command will:

- Modify `/etc/resolv.conf` on Linux/macOS.

- Update DNS settings for active network interfaces on Windows.

- Ensure all system DNS traffic is routed through the local NextDNS proxy.

To restore the system's original DNS settings:

This should be used if you want to bypass the local proxy or if you are uninstalling the CLI.

You can configure the daemon to automatically activate/deactivate at startup and exit:

- [NextDNS CLI - Configuration](https://github.com/nextdns/nextdns/wiki#configuration)

### 1.21 Troubleshooting

**Impact: HIGH (Diagnosing and fixing DNS resolution and connectivity issues)**

Essential steps to resolve DNS outages and misconfigurations

Essential steps to resolve DNS outages and misconfigurations

When DNS is not working or not pointing to NextDNS correctly, follow these diagnostic steps.

First, verify if NextDNS is actually being used:

The output will tell you if you are using NextDNS, which protocol (DoH, DoT), and which profile ID

is active.

1. **Restart the service**: Most configuration issues are resolved by a simple restart.

   ```bash

   sudo nextdns restart

   ```

2. **Verify Status**: Ensure the daemon is running.

   ```bash

   nextdns status

   ```

3. **Check Logs**: Look for errors in the service log.

   ```bash

   nextdns log

   ```

4. **Debug Mode**: Enable verbose logging to see exactly why queries are failing or where they are

   going.

   ```bash

   sudo nextdns config set -debug=true

   sudo nextdns restart

   nextdns log

   ```

If the initial installation script fails, run it in debug mode to see more detailed output:

If NextDNS fails to start, another service might be using port 53 (common on Linux with `dnsmasq` or

`systemd-resolved`).

- Check using: `sudo lsof -i :53` or `sudo netstat -nlp | grep :53`.

- Solution: Stop the conflicting service or configure NextDNS to listen on a different IP/interface

  using the `-listen` flag.

If you are at a hotel or airport and cannot connect:

- Enable captive portal detection: `sudo nextdns config set -detect-captive-portals=true`.

- This allows the system to temporarily use the local network's DNS to handle the login page.

NextDNS provides a diagnostic tool to help support staff:

- [NextDNS CLI - Troubleshooting](https://github.com/nextdns/nextdns/wiki/Troubleshooting)

### 1.22 Windows Installation

**Impact: HIGH ()**

Critical for proper NextDNS deployment on Windows systems

Critical for proper NextDNS deployment on Windows systems

NextDNS offers two installation methods for Windows: an official GUI application with a Systray icon

for easy management, and a manual CLI installation for advanced users who prefer command-line

control.

The recommended method for most users is the official GUI application, which provides a

user-friendly Systray interface.

1. **Download**: Get the latest stable release from

   [https://nextdns.io/download/windows/stable](https://nextdns.io/download/windows/stable).

2. **Install**: Run the installer and follow the setup wizard.

3. **Configure**: Right-click the Systray icon, open **Settings**, and enter your Configuration ID.

4. **Activate**: Right-click the Systray icon and click **Enable** to start DNS protection.

The GUI app automatically handles service installation, Windows Firewall rules, and network adapter

configuration.

For advanced users, server deployments, or automated setups, the CLI method provides more control.

Download the latest Windows binary from

[GitHub Releases](https://github.com/nextdns/nextdns/releases).

1. **Create Directory**: Create a dedicated folder for the NextDNS binary:

   ```dos

   mkdir "C:\Program Files\NextDNS"

   ```

2. **Move Binary**: Place the downloaded `nextdns.exe` into `C:\Program Files\NextDNS\`.

3. **Install Service**: Open an **Administrator** Command Prompt and run:

   ```dos

   "C:\Program Files\NextDNS\nextdns.exe" install ^

     -config <your_config_id> ^

     -report-client-info ^

     -auto-activate

   ```

   **Note**: Replace `<your_config_id>` with your actual NextDNS Configuration ID (for example, `abc123`).

- `-config <your_config_id>`: Specifies your NextDNS profile.

- `-report-client-info`: Enables device identification in the NextDNS dashboard.

- `-auto-activate`: Automatically configures Windows DNS settings to use NextDNS.

After installation, verify NextDNS is running:

- [NextDNS CLI - Windows](https://github.com/nextdns/nextdns/wiki/Windows)

---

## 2. Efficiency rules

**Impact: MEDIUM**

### 2.1 Best Practices

**Impact: MEDIUM (Optimization, security, and performance recommendations for the CLI)**

Optimizing your NextDNS CLI setup for stability and speed

Optimizing your NextDNS CLI setup for stability and speed

Follow these recommendations to get the most out of your NextDNS CLI installation.

Local caching significantly reduces latency by avoiding unnecessary network round-trips for repeated

queries.

Use `-max-ttl` to prevent devices on your network from caching DNS records for too long. This

ensures changes in your NextDNS web dashboard apply quickly.

EDNS allows NextDNS to see which regional network you are on, helping CDNs (like Netflix or Akamai)

serve content from the closest server to you.

If you use split-horizon DNS, specify multiple local servers for failover.

Ensure NextDNS takes over system DNS automatically at boot.

- [NextDNS CLI - Best Practices](https://github.com/nextdns/nextdns#best-practices)

### 2.2 Upgrade and Uninstall

**Impact: MEDIUM (Safely updating or removing the NextDNS CLI service)**

Maintaining or cleaning up the NextDNS installation

Maintaining or cleaning up the NextDNS installation

To keep the NextDNS CLI secure and feature-rich, you should periodically check for updates.

The easiest way to upgrade is to simply re-run the universal installation script:

The installer will detect your existing installation and offer an **Upgrade** option if a newer

version is available. It will preserve your configuration settings.

To remove NextDNS CLI from your system, use the same universal script:

1. Select the **Uninstall** option from the menu.

2. The script will:

   - Stop the daemon.

   - Remove the service from the system (systemd, launchd, and more).

   - Restore original system DNS settings (equivalent to `nextdns deactivate`).

   - Remove the binary from your system path.

It is good practice to run `sudo nextdns deactivate` before a manual uninstallation to ensure your

system DNS is not left pointing to a non-existent local proxy.

If an upgrade fails:

1. Try to uninstall first and then perform a fresh installation.

2. Check for residual files in `/etc/nextdns.conf` or the binary location (usually

   `/usr/local/bin/nextdns` or `/usr/bin/nextdns`).

3. Ensure no other process is locking the configuration file or the service manager.

- [NextDNS CLI - Installation](https://github.com/nextdns/nextdns/wiki#installation)

---

