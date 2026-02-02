---
title: Mobile Native Encrypted DNS Configuration
impact: HIGH
impactDescription: Native encrypted DNS support on mobile devices provides lightweight protection without battery-draining background apps. Without this guidance, users may unnecessarily install third-party apps when the OS provides built-in encrypted DNS capabilities.
type: capability
tags: mobile, android, ios, iphone, ipad, private-dns, dot, dns-over-tls, configuration-profile, mobileconfig, native, lightweight
---

# Mobile Native Encrypted DNS Configuration

**Impact: HIGH** - Enables NextDNS protection on mobile devices using built-in OS features without battery-draining background apps

Modern mobile operating systems include native support for encrypted DNS protocols, eliminating the need for third-party apps. This provides a lightweight, battery-efficient method for NextDNS protection on smartphones and tablets.

## Why Use Native Configuration Over Apps

### Advantages of Native Integration

- **No Background Process**: Zero battery impact from background services
- **OS-Level Integration**: More reliable than third-party apps
- **System-Wide Protection**: Covers all apps and system services
- **Automatic Reconnection**: No manual intervention needed after device restart
- **No App Permissions**: No privacy concerns from third-party applications
- **Always Active**: Cannot be accidentally closed or force-stopped

### When to Use the NextDNS App Instead

- You need advanced features like:
    - Custom DNS server selection per network
    - Analytics and diagnostics on the device
    - Detailed connection logs
    - Manual profile switching

## Android Configuration (Version 9+)

Android 9 (Pie) and later include **Private DNS** support using DNS-over-TLS (DoT).

### Configuration Steps

1. Open **Settings** on your Android device

2. Navigate to:
    - **Network & internet** (or **Connections** on Samsung devices)

3. Select **Private DNS** (or **Advanced** → **Private DNS**)

4. Choose **Private DNS provider hostname**

5. Enter your NextDNS hostname:
    ```text
    <config_id>.dns.nextdns.io
    ```
    Replace `<config_id>` with your actual NextDNS Configuration ID

6. Tap **Save**

### Finding Your Configuration ID

1. Log in to [https://my.nextdns.io](https://my.nextdns.io)
2. Select your configuration
3. Your Configuration ID is the 6-character alphanumeric code in the URL

### Visual Path Reference

**Stock Android:**
```text
Settings
  └─ Network & internet
       └─ Advanced
            └─ Private DNS
                 └─ Private DNS provider hostname
                      └─ [Enter hostname]
```

**Samsung (One UI):**
```text
Settings
  └─ Connections
       └─ More connection settings
            └─ Private DNS
                 └─ Private DNS provider hostname
                      └─ [Enter hostname]
```

### Verification on Android

1. Visit [https://test.nextdns.io](https://test.nextdns.io) in your browser
2. You should see:
    - ✓ **Protocol**: TLS (DoT)
    - ✓ **Status**: Connected
    - ✓ **Configuration ID**: Your config ID

### Troubleshooting Android

#### Private DNS Not Working

**Symptoms:** Websites not loading, "Couldn't connect to server" errors

**Solutions:**

1. **Check hostname format:**
    - Correct: `abc123.dns.nextdns.io`
    - Incorrect: `https://abc123.dns.nextdns.io` (no protocol)
    - Incorrect: `abc123.dns1.nextdns.io` (wrong subdomain)

2. **Test with automatic setting:**
    - Temporarily select **Automatic**
    - If internet works, the issue is with the hostname
    - If it doesn't work, the issue is network-related

3. **Network restrictions:**
    - Some networks (corporate, public Wi-Fi) may block DNS-over-TLS (port 853)
    - Try switching between Wi-Fi and mobile data
    - Contact network administrator if on corporate network

4. **Clear DNS cache:**
    ```text
    Settings → Apps → Show system apps → DNS Client → Storage → Clear cache
    ```

## iOS Configuration (Version 14+)

iOS 14 and later support **Encrypted DNS Profiles** using DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT) via signed configuration profiles.

### Configuration Steps

#### Method 1: Via NextDNS Setup Page (Recommended)

1. On your iOS device, visit [https://my.nextdns.io](https://my.nextdns.io)

2. Navigate to your configuration → **Setup** tab

3. Select **iOS** from the platform list

4. Tap **Download Configuration Profile**

5. When prompted, tap **Allow** to download the profile

6. Open **Settings** app (a notification will appear)

7. Tap **Profile Downloaded** near the top of settings

8. Review the profile details:
    - **Name**: NextDNS (your config name)
    - **Type**: DNS Settings
    - **Signed by**: NextDNS, Inc.

9. Tap **Install** in the top right

10. Enter your device passcode when prompted

11. Tap **Install** again to confirm

12. Tap **Done** when installation completes

#### Method 2: Manual Profile Installation

If you have a `.mobileconfig` file from NextDNS:

1. AirDrop or email the file to your iOS device
2. Tap the file to open
3. Follow steps 6-11 above

### Visual Path Reference

```text
Safari (my.nextdns.io)
  └─ Setup tab → iOS
       └─ Download Configuration Profile
            └─ Allow download

Settings
  └─ Profile Downloaded [notification]
       └─ Review profile
            └─ Install
                 └─ Enter Passcode
                      └─ Install (confirm)
                           └─ Done
```
