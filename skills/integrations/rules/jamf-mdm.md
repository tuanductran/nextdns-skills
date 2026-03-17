---
title: 'MDM Deployment (Jamf, Intune, Apple Configurator)'
impact: HIGH
impactDescription: 'Manual per-device DNS configuration is error-prone at scale — MDM deployment ensures 100% fleet coverage and prevents employees from disabling DNS filtering'
type: capability
tags:
  - mdm
  - jamf
  - intune
  - apple configurator
  - mobileconfig
  - enterprise
  - fleet
  - ios
  - macos
  - windows
---

<!-- @case-police-ignore Api -->
# MDM deployment (jamf, intune, apple configurator)

Deploy NextDNS DNS configuration to an entire device fleet via MDM without manual per-device setup

## Overview

For organisations managing tens or hundreds of devices, MDM (Mobile Device Management) is the only
scalable way to enforce DNS filtering. Instead of configuring each device manually, you push a DNS
profile to the entire fleet — or to specific groups — from a central management console.

This rule covers:

- Apple devices (iOS, iPadOS, macOS) via Jamf Pro, Jamf School, Apple Configurator 2, or Microsoft
  Intune
- Windows devices via Microsoft Intune (encrypted DNS policy)

## Apple devices (iOS, iPadOS, macOS)

Apple's DNS configuration uses `.mobileconfig` profiles. NextDNS generates these profiles for you.

### Step 1: generate the mobileconfig file

1. Log in to `https://my.nextdns.io/{profile-id}/setup`
2. Select **Apple** from the platform list
3. Click **Download Configuration Profile** — this generates a signed `.mobileconfig` file

Or generate via the API:

```bash
# ✅ The profile is available as a downloadable file from the setup page
# Download it and inspect the DoH/DoT settings it configures
# No direct API endpoint exists — download from the dashboard manually
curl -o nextdns.mobileconfig \
  -H "X-Api-Key: YOUR_API_KEY" \
  "https://apple.nextdns.io/?profile=abc123&model=iPhone"
```

### Step 2a: deploy via Jamf Pro

1. In Jamf Pro, navigate to **Computers / Devices → Configuration Profiles**
2. Click **+ New**
3. Under **General**, set the profile name (for example, "NextDNS DNS Filter")
4. Click **+ Add** → search for **DNS Settings** (macOS) or navigate to **Custom Settings** (iOS)
5. For iOS/iPadOS: use **Custom Payload** → upload the NextDNS `.mobileconfig` payload content
6. Set **Distribution Method** to **Automatic** for automatic push to targeted devices
7. Set the **Scope** to the devices or groups that should receive the profile
8. Click **Save**

For macOS via Jamf's built-in DNS settings:

```text
Protocol: DNS over HTTPS
Server URL: https://dns.nextdns.io/abc123
On Demand Rules: (optional — for conditional activation)
```

### Step 2b: deploy via Apple configurator 2 (supervised devices)

1. Connect device(s) to Mac running Apple Configurator 2
2. Select the device(s) in the organiser
3. Choose **Actions → Add → Profiles**
4. Select the downloaded `nextdns.mobileconfig` file
5. Click **Add** — the profile is pushed silently without user confirmation on supervised devices

### Step 2c: deploy via Microsoft Intune (Apple)

1. Navigate to **Devices → Configuration Profiles → Create Profile**
2. Platform: **iOS/iPadOS** or **macOS**
3. Profile type: **Templates → Custom**
4. Upload the NextDNS `.mobileconfig` file
5. Assign to the target group
6. Click **Review + Create**

### Preventing users from removing the profile

For supervised devices (corporate-owned), mark the profile as non-removable:

In the `.mobileconfig` file, set:

```xml
<key>PayloadRemovalDisallowed</key>
<true/>
```

This prevents users from removing the DNS configuration from **Settings → VPN and Device
Management**.

## Windows devices (Microsoft Intune)

Windows 11 supports encrypted DNS (DoH) via Group Policy or Intune Settings Catalog.

### Configure via Intune Settings Catalog

1. Navigate to **Devices → Configuration Profiles → Create Profile**
2. Platform: **Windows 10 and later**
3. Profile type: **Settings Catalog**
4. Click **+ Add Settings** and search for "DNS over HTTPS"
5. Configure:

```text
DNS over HTTPS (DoH): Allowed (or Required for mandatory enforcement)
DNS over HTTPS server address: https://dns.nextdns.io/abc123

IPv4 address: 45.90.28.0
IPv6 address: 2a07:a8c0::  
```

1. Assign to the Windows device group
1. Click **Review + Create**

### Configure via Group Policy (on-premises)

```text
Computer Configuration → Administrative Templates → Network → DNS Client
→ Configure DNS over HTTPS (DoH) name resolution

Value: Encrypted Preferred or Encrypted Required
Custom DoH server: https://dns.nextdns.io/{profile-id}
```

## Best practices

- **Use supervised/enrolled devices** for the strongest enforcement — unsupervised devices can
  remove profiles.
- **Set `PayloadRemovalDisallowed: true`** for corporate devices where DNS filtering is mandatory.
- **Deploy to groups, not all devices**: Start with a pilot group (for example, IT department) before
  rolling out to the entire fleet.
- **Include the Root CA in the same deployment**: If you plan to enable the Block Page, push the
  NextDNS Root CA as a separate configuration profile in the same Jamf/Intune deployment.
- **Test with one device first**: Validate that the profile does not break any business-critical
  applications before fleet-wide deployment.

## Troubleshooting

### Issue: iOS shows "Cannot Install Profile"

**Cause**: The device is not supervised, or there is already a DNS profile installed from another
MDM.

**Solution**: Remove the existing DNS profile first, or ensure the device is enrolled in your MDM
as supervised.

### Issue: Windows DoH policy not applying

**Symptoms**: `nslookup` still uses plain DNS after applying the Intune policy.

**Solution**: Force a policy sync:

```powershell
# Force Intune sync
Start-Process "ms-device-enrollment:?mode=refresh"

# Verify the policy applied
Get-DnsClientGlobalSetting | Select-Object -Property EnableDnsDo*
```

## Reference

- [Apple — DNS Settings payload](https://developer.apple.com/documentation/devicemanagement/dnssettings)
- [Jamf Pro Documentation](https://docs.jamf.com)
- [Microsoft Intune — Custom profiles](https://learn.microsoft.com/en-us/intune/intune-service/configuration/custom-settings-configure)
- [NextDNS Dashboard — Setup](https://my.nextdns.io)
