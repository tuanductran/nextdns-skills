---
title: 'AsusWRT-Merlin Integration'
impact: MEDIUM
impactDescription: 'Deploy NextDNS on Asus routers with Merlin firmware'
type: capability
tags:
  - asus
  - merlin
  - asuswrt
  - router
  - installation
---

# AsusWRT-Merlin Integration

Installing NextDNS on Asus routers running Merlin firmware provides network-wide encrypted DNS with
client identification.

## Installation Steps

1. **Enable SSH Access**:
   - Log in to your router's web interface.
   - Navigate to **Administration** -> **System**.
   - Set **Enable SSH** to `LAN only`.
   - Click **Apply**.
2. **Connect via SSH**:
   ```bash
   ssh admin@192.168.1.1
   ```
3. **Run Installer**:
   ```bash
   sh -c "$(curl -sL https://nextdns.io/install)"
   ```
4. **Follow Prompts**:
   - Enter your **Profile ID**.
   - Enable **Setup Router** when asked.
   - Enable **Report Client Info** to see device names in logs.

## Performance Optimization

For the best experience on AsusWRT-Merlin:

- **JFFS Scripts**: Ensure JFFS custom scripts are enabled in **Administration** -> **System**. The
  installer handles this, but it must stay enabled.
- **DNSSEC**: Disable the built-in DNSSEC in the Asus GUI if you enable it in NextDNS to avoid
  redundant processing.

## Troubleshooting

If the installation fails, run the installer in debug mode:

```bash
DEBUG=1 sh -c "$(curl -sL https://nextdns.io/install)"
```

## Reference

- [NextDNS CLI Wiki - AsusWRT-Merlin](https://github.com/nextdns/nextdns/wiki/AsusWRT-Merlin)
- [SNBForums NextDNS Thread](https://www.snbforums.com/threads/nextdns-installer.61002/)
