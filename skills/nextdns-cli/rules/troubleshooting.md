---
title: Troubleshooting
impact: HIGH
impactDescription: Diagnosing and fixing DNS resolution and connectivity issues
type: capability
tags: diagnostic, connection test, DNS leak, debug
---

# Troubleshooting

**Impact: HIGH** - Essential steps to resolve DNS outages and misconfigurations

When DNS is not working or not pointing to NextDNS correctly, follow these diagnostic steps.

## Initial Health Check

First, verify if NextDNS is actually being used:

```bash
# Test command to check NextDNS status
curl https://test.nextdns.io
```

The output will tell you if you are using NextDNS, which protocol (DoH, DoT), and which profile ID is active.

## Common CLI Fixes

1. **Restart the service**: Most configuration issues are resolved by a simple restart.
    ```bash
    sudo nextdns restart
    ```
2. **Verify Status**: Ensure the daemon is running.
    ```bash
    nextdns status
    ```
3. **Check Logs**: Look for errors in the service log.
    ```bash
    nextdns log
    ```
4. **Debug Mode**: Enable verbose logging to see exactly why queries are failing or where they are going.
    ```bash
    sudo nextdns config set -debug=true
    sudo nextdns restart
    nextdns log
    ```

### Installation Failures
If the initial installation script fails, run it in debug mode to see more detailed output:
```bash
DEBUG=1 sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

### Port 53 Conflict
If NextDNS fails to start, another service might be using port 53 (common on Linux with `dnsmasq` or `systemd-resolved`).
- Check using: `sudo lsof -i :53` or `sudo netstat -nlp | grep :53`.
- Solution: Stop the conflicting service or configure NextDNS to listen on a different IP/interface using the `-listen` flag.

### captive Portals
If you are at a hotel or airport and cannot connect:
- Enable captive portal detection: `sudo nextdns config set -detect-captive-portals=true`.
- This allows the system to temporarily use the local network's DNS to handle the login page.

## Diagnostic Tool
NextDNS provides a diagnostic tool to help support staff:
```bash
# Run a full diagnostic check and output a link to results
sudo nextdns diagnostics
```
Visit the generated URL to see detailed information about your connection to NextDNS.
