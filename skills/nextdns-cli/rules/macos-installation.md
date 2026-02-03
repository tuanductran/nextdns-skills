---
title: "macOS Installation"
impact: HIGH
impactDescription: "Proper installation and configuration of NextDNS CLI on macOS systems ensures optimal DNS protection and performance. Without following these guidelines, users may encounter installation failures, configuration issues, or suboptimal setup for their specific use case."
type: capability
tags: "macOS, Homebrew, App Store, installer, Mac, installation, setup"
---
# macOS Installation

**Impact: HIGH** - Essential setup methods and configuration options for macOS systems

This rule provides comprehensive guidance for installing and configuring NextDNS CLI on macOS, covering the universal installer, Homebrew installation, Mac App Store alternative, and platform-specific configuration options.

## Primary Installation

The recommended method for installing NextDNS CLI on macOS is using the universal one-liner command:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

This command will:

1. Download and execute the NextDNS installer script
2. Present an interactive menu to guide you through the setup
3. Prompt for your NextDNS configuration ID
4. Configure the system DNS settings automatically
5. Install and activate the NextDNS daemon

Follow the on-screen instructions to complete the installation. The installer will handle all necessary permissions and system configurations.

## Upgrade Path

To upgrade NextDNS CLI to the latest version, simply re-run the installer command:

```bash
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

The installer will detect the existing installation and automatically upgrade to the new version if available. No additional steps are required for upgrades.

## Manual Installation (Homebrew)

For users who prefer package management via Homebrew, NextDNS CLI is available through a custom tap:

### Install Binary

```bash
brew install nextdns/tap/nextdns
```

### Configuration for Workstation

For a personal workstation or laptop, use the following configuration:

```bash
sudo nextdns install -config <id> -report-client-info -auto-activate
```

Replace `<id>` with your NextDNS configuration ID. This command will:

- Install NextDNS with the specified configuration ID
- Enable client info reporting for better analytics
- Automatically activate DNS on system startup

### Configuration for Router/Server

For a router or server setup where NextDNS acts as a DNS proxy for other devices:

```bash
sudo nextdns install -config <id> -report-client-info -setup-router
```

Replace `<id>` with your NextDNS configuration ID. This command will:

- Install NextDNS with the specified configuration ID
- Enable client info reporting
- Configure NextDNS to operate in router mode with proper DHCP integration

## Official App Alternative

NextDNS is also available as a native Mac application through the Mac App Store. This provides a user-friendly GUI alternative to the CLI:

1. Download NextDNS from the Mac App Store
2. Launch the application
3. Open Preferences
4. Navigate to the "Custom config" section
5. Enter your NextDNS configuration ID

The Mac App Store version provides the same functionality as the CLI but with a graphical interface for easier management. It's ideal for users who prefer not to use the command line.

## Troubleshooting

If you encounter issues during installation or configuration, you can enable debug mode for detailed logging:

```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

This will provide verbose output to help diagnose installation problems. Common issues and their solutions:

- **Permission denied**: Ensure you're running commands with `sudo` when required
- **Port conflicts**: Check if other DNS services are running on port 53
- **Configuration not applying**: Verify your NextDNS configuration ID is correct

### Getting Help

If issues persist after troubleshooting, contact the NextDNS support team:

- Email: team@nextdns.io
- Include debug output and system information when reporting issues

## Best Practices

- Always verify your NextDNS configuration ID before installation
- Use `-report-client-info` to enable per-device analytics in your NextDNS dashboard
- For workstations, use `-auto-activate` to ensure DNS protection starts automatically
- For routers/servers, use `-setup-router` to properly integrate with local network services
- Keep NextDNS CLI updated by periodically re-running the installer

## Reference

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [NextDNS Documentation](https://help.nextdns.io)
- [Mac App Store - NextDNS](https://apps.apple.com/app/nextdns/id1464122853)
