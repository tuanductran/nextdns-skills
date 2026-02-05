---
title: 'Advanced Linux Distribution Support'
impact: MEDIUM
impactDescription: 'Ensures reliable installation on non-standard Linux distributions'
type: capability
tags:
  - linux
  - arch
  - alpine
  - aur
  - apk
  - workstation
---

# Advanced Linux Distribution Support

Manual and advanced installation methods for Alpine Linux, Arch Linux, and other distributions.

## Overview

While the standard installer script works for most, specific distributions like Alpine (musl-based)
or Arch (AUR-centric) benefit from native package management for better lifecycle control.

## Correct Usage

### 1. Arch Linux (via AUR)

Using native package managers allows systemic updates.

```bash
# ✅ Install using yay or other AUR helper
yay -S nextdns

# ✅ Configure for workstation use
sudo nextdns install \
  -profile abc123 \
  -report-client-info \
  -auto-activate
```

### 2. Alpine Linux (Manual APK)

Useful for lightweight Docker hosts or Alpine-based routers.

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

### 3. RPM-Based (Fedora/CentOS/RHEL)

Manual repo setup if the installer script fails.

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

## Troubleshooting

### Musl vs Glibc (Alpine)

If using the binary directly on Alpine, ensure you use the `alpine` specific downloads if not using
`apk`, as standard binaries might fail due to missing `glibc`.

### Permission Errors

Always run `nextdns install` or `nextdns config` commands with `sudo` to ensure the systemd or init
services can be correctly registered.

## Reference

- [NextDNS Wiki - Linux Setup](https://github.com/nextdns/nextdns/wiki)
