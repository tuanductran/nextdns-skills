---
title: "Windows Installation"
impact: "HIGH"
impactDescription: "Proper Windows-specific installation procedures ensure NextDNS CLI is correctly deployed with appropriate privileges and system integration"
type: "capability"
tags: "Windows, GUI, CLI, installation, setup, EXE, Systray"
---
# Windows Installation

**Impact: HIGH** - Critical for proper NextDNS deployment on Windows systems

NextDNS offers two installation methods for Windows: an official GUI application with a Systray icon for easy management, and a manual CLI installation for advanced users who prefer command-line control.

## Official GUI App Installation

The recommended method for most users is the official GUI application, which provides a user-friendly Systray interface.

### Download and Setup

1. **Download**: Get the latest stable release from <https://nextdns.io/download/windows/stable>.
2. **Install**: Run the installer and follow the setup wizard.
3. **Configure**: Right-click the Systray icon, open **Settings**, and enter your Configuration ID.
4. **Activate**: Right-click the Systray icon and click **Enable** to start DNS protection.

The GUI app automatically handles service installation, Windows Firewall rules, and network adapter configuration.

## Manual CLI Installation

For advanced users, server deployments, or automated setups, the CLI method provides more control.

### Download

Download the latest Windows binary from [GitHub Releases](https://github.com/nextdns/nextdns/releases).

### Installation Steps

1. **Create Directory**: Create a dedicated folder for the NextDNS binary:

    ```dos
    mkdir "C:\Program Files\NextDNS"
    ```

2. **Move Binary**: Place the downloaded `nextdns.exe` into `C:\Program Files\NextDNS\`.

3. **Install Service**: Open an **Administrator** Command Prompt and run:

    ```dos
    "C:\Program Files\NextDNS\nextdns.exe" install ^
      -config <your_config_id> ^
      -report-client-info ^
      -auto-activate
    ```
```text

    **Note**: Replace `<your_config_id>` with your actual NextDNS Configuration ID (e.g., `abc123`).

### Command Options

- `-config <your_config_id>`: Specifies your NextDNS profile.
- `-report-client-info`: Enables device identification in the NextDNS dashboard.
- `-auto-activate`: Automatically configures Windows DNS settings to use NextDNS.

## Verification

After installation, verify NextDNS is running:

```
"C:\Program Files\NextDNS\nextdns.exe" status
```text
