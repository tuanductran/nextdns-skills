---
title: 'Advanced systemd-resolved Integration'
impact: HIGH
impactDescription: 'Misconfiguring systemd-resolved leaves port 53 occupied, preventing NextDNS from binding and causing silent DNS failures across all applications'
type: capability
tags:
  - linux
  - systemd-resolved
  - systemd
  - resolvectl
  - port 53
  - stub resolver
  - dns leak
---

# Advanced systemd-resolved integration

Configure NextDNS CLI alongside systemd-resolved on modern Linux distributions correctly

## Overview

Most modern Linux distributions (Ubuntu 20.04+, Fedora, Arch, Debian 11+) use `systemd-resolved`
as a stub resolver listening on `127.0.0.53:53`. This conflicts with NextDNS CLI which also needs
port 53.

There are two integration strategies:

1. **Disable systemd-resolved** and let NextDNS manage `/etc/resolv.conf` directly (simpler,
   recommended for dedicated DNS servers).
2. **Integrate alongside systemd-resolved** by configuring `systemd-resolved` to use NextDNS as its
   upstream (preserves DNSSEC, mDNS, and per-link resolution).

## Strategy 1: disable systemd-resolved (recommended)

Use this approach on workstations and servers where you want NextDNS to have full control.

```bash
# ✅ Stop and disable systemd-resolved
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved

# ✅ Remove the symlink managed by systemd-resolved
sudo rm /etc/resolv.conf

# ✅ NextDNS activate will now manage /etc/resolv.conf directly
sudo nextdns install \
  -profile abc123 \
  -report-client-info \
  -auto-activate

sudo nextdns activate
```

```bash
# ✅ Verify resolution is working
resolvectl status 2>/dev/null || cat /etc/resolv.conf
curl https://test.nextdns.io
```

## Strategy 2: integrate alongside systemd-resolved

Use this approach when you need systemd-resolved features (per-interface DNS, LLMNR, mDNS).

### Step 1: configure NextDNS on a non-standard port

```bash
# ✅ Install NextDNS listening on 127.0.0.1:5300 instead of :53
sudo nextdns install \
  -profile abc123 \
  -report-client-info \
  -listen 127.0.0.1:5300

sudo nextdns start
```

### Step 2: configure systemd-resolved to use NextDNS

```bash
# ✅ Edit /etc/systemd/resolved.conf
sudo tee /etc/systemd/resolved.conf > /dev/null <<'EOF'
[Resolve]
DNS=127.0.0.1:5300
DNSStubListener=no
DNSSEC=no
EOF
```

### Step 3: restore `/etc/resolv.conf` symlink

```bash
# ✅ Point resolv.conf to systemd-resolved's result file
sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
```

### Step 4: restart systemd-resolved

```bash
sudo systemctl restart systemd-resolved

# ✅ Verify the upstream is set correctly
resolvectl status | grep -A 5 "DNS Servers"
```

## Verifying the configuration

```bash
# ✅ Check what is listening on port 53
sudo ss -tlnup | grep :53

# ✅ Check active DNS servers
resolvectl status

# ✅ Test that NextDNS is being used
curl https://test.nextdns.io

# ✅ Flush systemd-resolved cache after config changes
sudo resolvectl flush-caches
```

## Checking for DNS leaks

```bash
# ✅ Confirm all queries route through NextDNS
# All queries should show NextDNS IPs, not your ISP DNS
nextdns log
```

## Do NOT Use

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

## Troubleshooting

### Issue: "listen tcp :53: bind: address already in use"

```bash
# Find what is using port 53
sudo ss -tlnup | grep :53
# If systemd-resolved: stop it or set DNSStubListener=no
sudo systemctl stop systemd-resolved
# Then restart NextDNS
sudo nextdns restart
```

### Issue: DNS resolution broken after disabling systemd-resolved

**Symptoms**: Commands like `ping google.com` fail with "Name or service not known".

**Solution**: NextDNS must be activated to write `/etc/resolv.conf`:

```bash
sudo nextdns activate
cat /etc/resolv.conf
# Should contain: nameserver 127.0.0.1
```

### Issue: per-network DNS not working with Strategy 2

**Symptoms**: VPN split-DNS or company domain resolution stops working.

**Solution**: With Strategy 2, `systemd-resolved` forwards all queries through NextDNS. Use
NextDNS CLI's `-forwarder` option instead to route internal domains directly:

```bash
sudo nextdns config set -forwarder corp.example.com=10.0.0.1
sudo nextdns restart
```

## Reference

- [systemd-resolved man page](https://www.freedesktop.org/software/systemd/man/resolved.conf.html)
- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
