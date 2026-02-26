---
title: 'FreeBSD Installation'
impact: HIGH
impactDescription:
  'FreeBSD uses rc.conf for service management — missing the rc.conf entry leaves the daemon
  non-persistent across reboots'
type: capability
tags:
  - freebsd
  - bsd
  - pkg
  - ports
  - rc.conf
  - service
---

# FreeBSD Installation

Install and configure NextDNS CLI on FreeBSD using pkg or the ports collection

## Overview

FreeBSD supports NextDNS CLI through the official package repository (`pkg`) and the ports
collection. Service management on FreeBSD uses `rc.conf` and the `service` command rather than
systemd. The standard universal installer also works on FreeBSD as an alternative.

## Correct Usage

### Method 1: Universal Installer (Recommended)

```bash
# ✅ Simplest method — handles binary, service registration, and activation
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

Follow the interactive prompts to set your profile ID and install mode (host or router).

### Method 2: pkg (Binary Package)

```bash
# ✅ Install from the official FreeBSD package repository
pkg install nextdns
```

After installing, configure and start the service:

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

### Method 3: Ports Collection

```bash
# ✅ Install from source using the ports collection
cd /usr/ports/dns/nextdns
make install clean
```

### Service Management

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

### Manual rc.conf Entry

If the service is not auto-registered, add it manually to `/etc/rc.conf`:

```bash
# ✅ Enable nextdns at boot
echo 'nextdns_enable="YES"' >> /etc/rc.conf

# ✅ Start immediately
service nextdns start
```

## Do NOT Use

```bash
# ❌ Using systemctl — FreeBSD does not use systemd
systemctl start nextdns   # ❌ Command not found on FreeBSD

# ❌ Using apt/yum — wrong package manager for FreeBSD
apt install nextdns   # ❌
yum install nextdns   # ❌
```

## Upgrade

```bash
# Upgrade via pkg
pkg upgrade nextdns

# Or re-run the universal installer and select "Upgrade"
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Uninstall

```bash
# Deactivate DNS configuration first
nextdns deactivate

# Uninstall the service
nextdns uninstall

# Remove the package
pkg delete nextdns
```

## Troubleshooting

### Issue: Installation fails with permission error

**Symptoms**: `Permission denied` when running the installer.

**Solution**: Run as root or with `sudo`:

```bash
sudo sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

### Issue: Service not persisting after reboot

**Symptoms**: NextDNS daemon is not running after a system reboot.

**Solution**: Verify `nextdns_enable="YES"` is present in `/etc/rc.conf`:

```bash
grep nextdns /etc/rc.conf
# Should output: nextdns_enable="YES"
```

### Issue: Debug installation failure

```bash
# Run installer in debug mode
sh -c 'DEBUG=1 sh -c "$(curl -sL https://nextdns.io/install)"'
```

## Reference

- [NextDNS CLI Wiki — FreeBSD](https://github.com/nextdns/nextdns/wiki/FreeBSD)
- [FreeBSD pkg Documentation](https://docs.freebsd.org/en/books/handbook/ports/#pkgng-intro)
- [FreeBSD Ports Collection](https://docs.freebsd.org/en/books/handbook/ports/#ports-using)
