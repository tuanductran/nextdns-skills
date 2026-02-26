---
title: 'NixOS Installation'
impact: HIGH
impactDescription:
  'NixOS uses declarative configuration — imperative install commands are silently overwritten on
  rebuild'
type: capability
tags:
  - nix
  - nixos
  - declarative
  - configuration.nix
  - services.nextdns
---

# NixOS Installation

Install and configure NextDNS CLI on NixOS using declarative system configuration

## Overview

NixOS manages system state declaratively through `/etc/nixos/configuration.nix`. The standard
`sh -c "$(curl -sL https://nextdns.io/install)"` installer **will not persist** across
`nixos-rebuild switch` because NixOS regenerates system files from configuration. Always use the
native `services.nextdns` NixOS module instead.

## Correct Usage

### Minimal Host Mode

Edit `/etc/nixos/configuration.nix`:

```nix
# ✅ Enable NextDNS as a managed systemd service
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

Apply the configuration:

```bash
sudo nixos-rebuild switch
```

### Router Mode (LAN DNS)

```nix
# ✅ Router mode — listen on all interfaces for LAN clients
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-report-client-info"
      "-listen" ":53"
      "-setup-router"
    ];
  };

  # Allow DNS traffic through the firewall
  networking.firewall.allowedUDPPorts = [ 53 ];
  networking.firewall.allowedTCPPorts = [ 53 ];
}
```

### Conditional Profiles (Subnet-Based)

```nix
# ✅ Assign different profiles per subnet
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "10.0.0.0/24=abc123"
      "-profile" "10.0.1.0/24=def456"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

### With Cache Boost

```nix
# ✅ Enable local DNS cache
{ config, pkgs, ... }:
{
  services.nextdns = {
    enable = true;
    arguments = [
      "-profile" "abc123"
      "-cache-size" "10MB"
      "-report-client-info"
      "-auto-activate"
    ];
  };
}
```

## Do NOT Use

```bash
# ❌ Running the imperative installer on NixOS
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
# Changes will be overwritten on the next nixos-rebuild switch

# ❌ Manually editing /etc/resolv.conf or systemd-resolved on NixOS
# NixOS manages these files declaratively
```

## Managing the Service

After `nixos-rebuild switch`, manage the service with standard systemd commands:

```bash
# Check status
sudo systemctl status nextdns

# View logs
sudo journalctl -u nextdns -f

# Restart after config change
sudo nixos-rebuild switch
```

## Upgrade

Upgrades are handled by the Nix package manager. Update the package in your channel and rebuild:

```bash
# Update channel and rebuild to get latest nextdns version
sudo nix-channel --update
sudo nixos-rebuild switch
```

## Troubleshooting

### Issue: Service not starting after rebuild

**Symptoms**: `systemctl status nextdns` shows failed state.

**Solution**: Check the arguments syntax — each flag and value must be a separate list item in the
`arguments` array.

```nix
# ❌ Wrong — flag and value in same string
arguments = [ "-profile abc123" ];

# ✅ Correct — separate list items
arguments = [ "-profile" "abc123" ];
```

### Issue: DNS not resolving after activation

**Symptoms**: `/etc/resolv.conf` still points to old nameservers.

**Solution**: Ensure `-auto-activate` is in `arguments`, or set `networking.nameservers` explicitly:

```nix
networking.nameservers = [ "127.0.0.1" ];
```

## Reference

- [NextDNS CLI Wiki — Nix](https://github.com/nextdns/nextdns/wiki/Nix)
- [NixOS Manual — Services](https://nixos.org/manual/nixos/stable/)
- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
