---
title: Synology Integration (DSM and SRM)
impact: MEDIUM
impactDescription: Proper installation of NextDNS on Synology devices (DSM NAS and SRM routers) enables network-wide DNS protection. Without this guidance, users may struggle with SSH access, especially the critical step of enabling the admin user on SRM for root access.
type: capability
tags: synology, dsm, srm, nas, router, ssh, cli, dhcp, network
---

# Synology Integration (DSM and SRM)

**Impact: MEDIUM** - Essential for deploying NextDNS on Synology NAS (DSM) and routers (SRM) with proper SSH access and network configuration

Synology provides two operating systems: **DSM** for NAS devices and **SRM** for routers. This rule provides platform-specific guidance for installing the NextDNS CLI on both platforms.

## Platform Overview

| Platform | Full Name | Device Type | Use Case |
|----------|-----------|-------------|----------|
| **DSM** | DiskStation Manager | NAS | Network storage, local DNS server |
| **SRM** | Synology Router Manager | Router | Network gateway, DHCP server |

## DSM (NAS) Installation

### Step 1: Enable SSH Access

1. Log in to DSM Web Interface
2. Navigate to **Control Panel**
3. Select **Terminal & SNMP**
4. Check **Enable SSH service**
5. Click **Apply**

### Step 2: Connect via SSH

```bash
# Connect to your Synology NAS
ssh admin@synology-nas-ip

# You may be prompted to accept the SSH fingerprint
# Type 'yes' and press Enter
```

### Step 3: Install NextDNS CLI

```bash
# Run the NextDNS installer
sh -c "$(curl -sL https://nextdns.io/install)"

# Follow the interactive prompts:
# - Enter your NextDNS Configuration ID
# - Choose whether to report device names
# - Configure additional options as needed
```

## SRM (Router) Installation

SRM requires an additional critical step to enable root access via the admin user.

### Step 1: Enable Admin User (CRITICAL)

⚠️ **This step is mandatory for SRM. Skipping it will prevent SSH access.**

1. Log in to SRM Web Interface
2. Navigate to **Control Panel**
3. Select **User** tab
4. Locate the **admin** user in the list
5. Click **Edit**
6. **Uncheck** "Disable this account"
7. Set a strong password for the admin user
8. Click **OK**

### Step 2: Enable SSH Service

1. In **Control Panel**, navigate to **Services**
2. Locate **SSH** section
3. Check **Enable SSH services**
4. Click **Apply**

### Step 3: Connect via SSH as Root

**Important:** Connect using the `root` username (not `admin`) with the admin password you set.

```bash
# Connect to your Synology Router
ssh root@synology-router-ip

# Use the password you set for the admin user
```

### Step 4: Install NextDNS CLI

```bash
# Run the NextDNS installer
sh -c "$(curl -sL https://nextdns.io/install)"

# Follow the interactive prompts
```

## Post-Installation: Network Configuration

After installing NextDNS on your Synology device, configure your network to use it as the DNS server.

### Configure DHCP (SRM Only)

If you're using SRM as your router, configure DHCP to automatically assign the NextDNS-enabled device as the DNS server:

1. Navigate to **Network Center** → **DHCP Server**
2. Under **DNS Server**, set:
    - **Primary DNS**: IP address of your Synology router (e.g., `192.168.1.1`)
3. Click **Apply**

### Configure DHCP (DSM as Local DNS)

If you're using DSM as a local DNS server for your network:

1. Access your router's DHCP settings (non-Synology router)
2. Set the **Primary DNS** to your DSM device IP (e.g., `192.168.1.10`)
3. Apply the changes

**Recommendation:** Set a static IP address for your Synology device to prevent DNS resolution issues if the IP changes.

### Setting a Static IP

#### On DSM
1. Navigate to **Control Panel** → **Network** → **Network Interface**
2. Select your network interface and click **Edit**
3. Under IPv4, select **Use manual configuration**
4. Enter your desired static IP, subnet mask, and gateway
5. Click **OK**

#### On SRM
1. Navigate to **Network Center** → **Local Network** → **Network Interface**
2. Select your WAN or LAN interface
3. Configure a static IP address
4. Click **Apply**

## Verification

After installation, verify that NextDNS is working:

```bash
# Check NextDNS service status
nextdns status

# Test DNS resolution
nslookup example.com 127.0.0.1
```

Visit [https://test.nextdns.io](https://test.nextdns.io) from a device on your network to confirm NextDNS is active.

## Troubleshooting

### Debug Mode Installation

If the installation fails or you encounter issues, run the installer in debug mode:

```bash
DEBUG=1 sh -c "$(curl -sL https://nextdns.io/install)"
```

This will output verbose information to help identify the problem.

### Common Issues

#### Cannot SSH to SRM (Permission Denied)

**Cause:** The admin user is disabled (default state on SRM).

**Solution:** Follow Step 1 under "SRM Installation" to enable the admin user.

#### DNS Resolution Not Working

**Cause:** DHCP clients are not using the Synology device as their DNS server.

**Solution:**
1. Check DHCP server configuration
2. Verify the Synology device has a static IP
3. Renew DHCP leases on client devices (`ipconfig /release && ipconfig /renew` on Windows, or reconnect Wi-Fi)

#### NextDNS Service Not Starting

**Cause:** Port 53 may be in use by another service.

**Solution:**
```bash
# Check what's using port 53
netstat -tulnp | grep :53

# Stop conflicting services if necessary
# Then restart NextDNS
nextdns restart
```
