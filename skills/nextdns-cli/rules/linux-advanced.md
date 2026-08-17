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

# Advanced Linux distribution support

Manual and advanced installation methods for Alpine Linux, Arch Linux, and other distributions.

## Overview

While the standard installer script works for most, specific distributions like Alpine (musl-based)
or Arch (AUR-centric) benefit from native package management for better lifecycle control.

## Correct usage

### 1. Arch Linux (via aur)

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

### 2. Alpine Linux (manual apk)

Useful for lightweight Docker hosts or Alpine-based routers.

```bash
# ✅ Use the official installer; it detects Alpine and configures the apk path
sudo sh -c 'sh -c "$(curl -sL https://raw.githubusercontent.com/nextdns/nextdns/master/install.sh)"'

# The installer detects Alpine, installs the package, and then prompts for profile/setup.
# For a non-interactive follow-up configuration:
sudo nextdns install -profile abc123 -setup-router
```

### 3. Rpm-based (fedora/centos/rhel)

Manual RPM repository setup if the official installer script fails. The legacy `/rpm` URL is not a repository definition; use the downloaded `nextdns.repo` file instead.

```bash
# ✅ Install the official repository definition
sudo mkdir -p /etc/yum.repos.d
sudo curl -Ls https://repo.nextdns.io/nextdns.repo \
  -o /etc/yum.repos.d/nextdns.repo

# ✅ Install
sudo dnf install nextdns
```

## Troubleshooting

### Musl vs glibc (alpine)

If using the binary directly on Alpine, ensure you use the `alpine` specific downloads if not using
`apk`, as standard binaries might fail due to missing `glibc`.

### Permission errors

Always run `nextdns install` or `nextdns config` commands with `sudo` to ensure the systemd or init
services can be correctly registered.

## Reference

- [NextDNS Wiki - Linux Setup](https://github.com/nextdns/nextdns/wiki)
