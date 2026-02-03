---
title: 'Daemon Control'
impact: MEDIUM
impactDescription: 'Managing the NextDNS service state and background processes'
type: capability
tags:
  - start
  - stop
  - restart
  - status
  - daemon
  - service
---

# Daemon Control

Controlling the background service process

Once installed as a service, use these commands to manage the NextDNS background daemon.

## Common Service Commands

| Action        | Command             | Description                                                            |
| ------------- | ------------------- | ---------------------------------------------------------------------- |
| **Start**     | `nextdns start`     | Starts the NextDNS background service.                                 |
| **Stop**      | `nextdns stop`      | Stops the NextDNS background service.                                  |
| **Restart**   | `nextdns restart`   | Restarts the NextDNS background service (useful after config changes). |
| **Status**    | `nextdns status`    | Displays the current running status of the daemon.                     |
| **Install**   | `nextdns install`   | Installs the NextDNS daemon as a system service.                       |
| **Uninstall** | `nextdns uninstall` | Removes the NextDNS daemon from system services.                       |

## Important Notes

- **Run Subcommand**: Avoid using `nextdns run` unless you are debugging and need to run the service
  in the foreground. Permanent installations should always use the service manager via
  `nextdns start`.
- **Permissions**: These commands usually require administrative privileges (`sudo` on Linux/macOS,
  Administrator privileges on Windows).
- **Restarting**: If you manually edit the configuration file without using `nextdns config set`,
  you MUST restart the service for changes to take effect.

## Reference

- [NextDNS CLI - Commands](https://github.com/nextdns/nextdns#commands)
