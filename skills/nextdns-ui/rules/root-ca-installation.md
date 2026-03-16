---
title: 'Root CA Certificate Installation'
impact: HIGH
impactDescription: 'Without the NextDNS Root CA installed, enabling Block Page causes HTTPS certificate warnings on every blocked site instead of showing the block page'
type: capability
tags:
  - root ca
  - certificate
  - block page
  - https
  - ssl
  - windows
  - macos
  - ios
  - android
  - linux
---

# Root CA certificate installation

Install the NextDNS Root CA certificate to enable HTTPS block pages without browser security warnings

## Overview

When NextDNS blocks a domain requested over HTTPS, it intercepts the connection. To display a
friendly block page instead of a confusing browser error (`ERR_SSL_PROTOCOL_ERROR` or similar), the
NextDNS Root CA must be trusted by the device's certificate store.

Without the Root CA, enabling the Block Page feature in Settings causes every blocked HTTPS site to
display a browser certificate warning, which is confusing and alarming for users.

**Block Page should only be enabled after installing the Root CA on all devices that will use the
profile.**

## Download the root CA

Download from the NextDNS dashboard:

1. Navigate to `https://my.nextdns.io/{your-profile-id}/setup`
2. Scroll to **Root CA** section
3. Download the certificate file: `nextdns.crt`

Or download directly:

```bash
# ✅ Download via curl
curl -O https://nextdns.io/ca
mv ca nextdns.crt
```

## Installation by platform

### Windows

```powershell
# ✅ Install via PowerShell (as Administrator)
Import-Certificate -FilePath ".\nextdns.crt" -CertStoreLocation Cert:\LocalMachine\Root

# Verify installation
Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*NextDNS*" }
```

Or via GUI:

1. Double-click `nextdns.crt`
2. Click **Install Certificate**
3. Select **Local Machine** → **Place all certificates in the following store**
4. Browse → **Trusted Root Certification Authorities**
5. Click **Finish** → **Yes** to the security prompt

### macOS

```bash
# ✅ Install via Terminal
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nextdns.crt

# Verify
security find-certificate -a -c "NextDNS" /Library/Keychains/System.keychain
```

Or via Keychain Access:

1. Open **Keychain Access** → **System** keychain
2. Drag `nextdns.crt` into the window
3. Double-click the NextDNS certificate → expand **Trust**
4. Set **When using this certificate** to **Always Trust**

### iOS / iPadOS

1. Send `nextdns.crt` to the device (AirDrop, email attachment, or Safari download)
2. Tap the file — a prompt appears: **Profile Downloaded**
3. Open **Settings** → **General** → **VPN and Device Management**
4. Tap the NextDNS profile → **Install** → enter device passcode
5. **Critical final step**: Open **Settings** → **General** → **About** → **Certificate Trust
   Settings**
6. Toggle **NextDNS** under **Enable Full Trust for Root Certificates** → **Continue**

### Android

1. Transfer `nextdns.crt` to the device
2. Open **Settings** → **Security** → **Encryption and credentials**
   (Path varies by manufacturer: Samsung uses **Biometrics and Security** → **Install from
   device storage**)
3. Tap **Install a certificate** → **CA Certificate**
4. Tap **Install Anyway** on the warning
5. Select the `nextdns.crt` file

### Linux (Debian/Ubuntu)

```bash
# ✅ Install system-wide
sudo cp nextdns.crt /usr/local/share/ca-certificates/nextdns.crt
sudo update-ca-certificates

# Verify
ls /etc/ssl/certs/ | grep -i next
```

### Linux (Fedora/RHEL/CentOS)

```bash
# ✅ Install via update-ca-trust
sudo cp nextdns.crt /etc/pki/ca-trust/source/anchors/nextdns.crt
sudo update-ca-trust extract
```

### Firefox (all platforms)

Firefox maintains its own certificate store, separate from the OS. Install manually:

1. Open **Settings** → **Privacy and Security** → **Certificates** → **View Certificates**
2. Click **Authorities** tab → **Import**
3. Select `nextdns.crt`
4. Check **Trust this CA to identify websites** → **OK**

## Enable block page in dashboard

After installing the Root CA on all devices:

1. Navigate to `https://my.nextdns.io/{your-profile-id}/settings`
2. Under **Block Page**, toggle **Enable**
3. Test by navigating to a blocked domain — you should see the NextDNS block page, not a browser
   error

## Services that break with block page enabled

Even with the Root CA installed, these services do not tolerate certificate interception and may
stop working:

- **PayPal 2FA** — uses certificate pinning
- **iCloud Private Relay** — must be blocked via denylist instead
- **Microsoft Teams** — some features use certificate pinning
- **Yahoo! Mail** — certificate validation issues

If these services break, keep Block Page disabled and rely on NXDOMAIN responses instead.

## Troubleshooting

### Issue: iOS shows "Profile installation failed"

**Solution**: The certificate must be downloaded in Safari (not a third-party browser) for the
profile install prompt to appear correctly.

### Issue: browser still shows security warning after CA install

**Solution**: Clear the browser's HSTS cache. For Chrome: navigate to
`chrome://net-internals/#hsts` and delete the domain. For Firefox, clear site data in
Preferences → Privacy.

## Reference

- [NextDNS Help Center — Block Page](https://help.nextdns.io)
- [NextDNS Dashboard — Setup](https://my.nextdns.io)
- [Apple — Certificate Trust Settings](https://support.apple.com/en-us/111900)
