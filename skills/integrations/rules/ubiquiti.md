---
title: 'Ubiquiti (UniFi) Integration'
impact: HIGH
impactDescription:
  "Without proper Ubiquiti integration guidance, users risk conflicts between NextDNS and UniFi's
  built-in filtering features, leading to DNS resolution failures and network outages. This rule
  prevents critical misconfigurations on UDM/UXG devices that could disrupt network-wide DNS
  services."
type: capability
tags:
  - ubiquiti
  - unifi
  - udm
  - uxg
  - dream machine
  - gateway
  - content filtering
  - ad blocking
  - ssh
  - cli
  - dns shield
---

# Ubiquiti (UniFi) Integration

Essential for preventing DNS conflicts on Ubiquiti UniFi Dream Machines and Gateways

Ubiquiti UniFi devices (UDM, UDM-Pro, UDM-SE, UXG-Pro, and UXG-Max families) are popular network
gateways that can integrate with NextDNS. However, improper configuration can cause conflicts with
UniFi's built-in DNS features, resulting in network-wide DNS failures.

## Integration Methods

Ubiquiti devices support two methods for NextDNS integration, depending on firmware version and use
case.

### Method 1: DNS Shield (Native - Recommended for UniFi OS 3.0+)

**Availability**: UniFi OS 3.0 and later

DNS Shield is a native feature that provides DNS-over-HTTPS without requiring command-line
configuration.

#### Setup Steps

1. Open the UniFi Network Application
2. Navigate to **Settings → Security → DNS Shield**
3. Toggle **Enable DNS Shield**
4. Select **Custom Provider**
5. Enter your NextDNS DoH URL: `https://dns.nextdns.io/YOUR_PROFILE_ID`
6. Click **Apply Changes**

**Benefits**:

- No SSH access required
- Survives firmware updates automatically
- Managed through the UniFi web interface
- Simpler troubleshooting

**Limitations**:

- Only available on UniFi OS 3.0+
- Limited advanced configuration options

### Method 2: NextDNS CLI (Advanced/Legacy)

**Use Cases**:

- UniFi OS versions below 3.0
- Advanced routing configurations
- Conditional DNS forwarding
- Integration with custom scripts

#### Prerequisites

- SSH access to the device
- Root privileges
- Internet connectivity from the device

#### Installation Steps

##### Step 1: Enable SSH Access

1. Open UniFi Network Application
2. Navigate to **Settings → System → Console Settings**
3. Enable SSH and note your password

##### Step 2: Connect to Device

```bash
ssh root@setup.ui.com
```

Or use the device's IP address:

```bash
ssh root@192.168.1.1
```

##### Step 3: Run NextDNS Installer

Execute the official installer script:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

Follow the interactive prompts to complete installation.

#### Critical Conflicts (Must Resolve)

The NextDNS CLI is **incompatible** with UniFi's built-in DNS filtering features. You **must**
disable both features to prevent DNS failures:

##### Disable Content Filtering

1. Navigate to **Settings → Network**
2. Locate **Content Filtering**
3. Set to **None**
4. Click **Apply Changes**

##### Disable Ad Blocking

1. Navigate to **Settings → Application Firewall → General**
2. Locate **Ad Blocking**
3. Uncheck **Enable Ad Blocking**
4. Click **Apply Changes**

**Warning**: Failing to disable these features will cause DNS resolution conflicts, potentially
breaking network connectivity for all devices.

#### Known Limitation: UDM Self-Queries

Queries originating from the UDM/UXG device itself (not network clients) will **not** be routed
through NextDNS. Only traffic from connected network devices will be filtered. This is a known
limitation of the CLI installation method.

## Troubleshooting

### Installation Failures

#### Debug Mode Installation

If installation fails, run the installer with debug output enabled:

```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

This generates verbose logs that help identify the root cause of failures.

#### APT Error on Debian Stretch

If you encounter APT repository errors (common on older UDM firmware), the Debian Stretch
repositories may be archived:

**Fix**:

```bash
sed -i -e 's/deb.debian.org/archive.debian.org/g' \
       -e 's|security.debian.org|archive.debian.org/|g' \
       -e '/stretch-updates/d' /etc/apt/sources.list
apt update
```

Then retry the NextDNS installation.

### DNS Resolution Failures

#### Check Service Status

Verify the NextDNS service is running:

```bash
nextdns status
```

Expected output: `running`

#### Restart Service

```bash
nextdns restart
```

#### Check Configuration

```bash
nextdns config
```

Verify your profile ID is correctly configured.

### Queries Not Appearing in NextDNS Logs

**Possible Causes**:

- Content Filtering or Ad Blocking still enabled (check Settings again)
- Incorrect profile ID in configuration
- Network devices using hardcoded DNS servers (bypass router)
- VPN or proxy configurations overriding DNS settings

**Verification Steps**:

1. From a client device, visit: [https://test.nextdns.io](https://test.nextdns.io)
2. Confirm it detects your NextDNS profile
3. Check the NextDNS logs for recent queries from your network

### Firmware Update Loses Configuration

**CLI Method Only**: Firmware updates may remove the NextDNS CLI installation.

**Solution**:

- Re-run the installer after firmware updates
- Consider switching to DNS Shield (Method 1) if available on your firmware version

## Best Practices

- **Prefer DNS Shield** when available (UniFi OS 3.0+) for better compatibility and update
  resilience
- **Document Configuration**: Keep notes on which method you're using and the profile ID
- **Test After Updates**: Verify NextDNS functionality after UniFi firmware updates
- **Monitor Logs**: Check NextDNS analytics regularly to ensure queries are being logged
- **Backup Settings**: Export UniFi configuration before making DNS changes
- **Use CLI for Advanced Needs**: Only use CLI method if you need features not available in DNS
  Shield

## Common Pitfalls

- **Not Disabling Conflicts**: The most critical mistake is leaving Content Filtering or Ad Blocking
  enabled with CLI installation
- **Wrong Profile ID**: Double-check your NextDNS profile ID during setup
- **Hardcoded DNS on Devices**: Some devices may have static DNS configured, bypassing the router
- **Post-Update Testing**: Always verify DNS after UniFi firmware updates
- **SSH Access**: Ensure SSH remains enabled if you need to troubleshoot CLI installations

## Comparison: DNS Shield vs. CLI

| Feature                | DNS Shield (Native) | NextDNS CLI                  |
| ---------------------- | ------------------- | ---------------------------- |
| **UniFi OS Version**   | 3.0+ required       | All versions                 |
| **Installation**       | GUI-based           | SSH/Command-line             |
| **Update Persistence** | Automatic           | May require reinstall        |
| **Advanced Routing**   | Limited             | Full control                 |
| **Complexity**         | Low                 | Medium-High                  |
| **Conflicts**          | None                | Must disable UniFi filtering |

## Reference

- [NextDNS CLI - Ubiquiti](https://github.com/nextdns/nextdns/wiki/Ubiquiti)
