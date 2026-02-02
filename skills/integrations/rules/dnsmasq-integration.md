---
title: "DNSMasq Integration"
impact: "MEDIUM"
impactDescription: "Running DNSMasq alongside NextDNS without proper configuration can result in loss of client reporting and conditional configuration features. This guidance ensures both services work together seamlessly while maintaining full NextDNS functionality."
type: "capability"
tags: "dnsmasq, dns, router, client reporting, conditional configuration, port configuration, setup-router"
---
# DNSMasq Integration

**Impact: MEDIUM** - Enables DNSMasq and NextDNS to run together while preserving client reporting and conditional configuration capabilities

## Overview

DNSMasq is a lightweight DNS forwarder commonly bundled with router firmwares. It is possible to run DNSMasq and NextDNS together on the same system while maintaining full NextDNS functionality, including client reporting and conditional configuration features.

This integration allows DNSMasq to continue handling local DNS resolution and DHCP services while forwarding external DNS queries to NextDNS for filtering and protection.

## Configuration Steps

### Step 1: Configure NextDNS to Listen on Alternative Port

NextDNS must be configured to listen on a different port to avoid conflicts with DNSMasq, which typically uses port 53.

```bash
# Configure NextDNS to listen on port 5555 on localhost
nextdns install -listen 127.0.0.1:5555
```

This configuration ensures NextDNS binds to port 5555 instead of the default port 53, allowing DNSMasq to continue operating on port 53.

### Step 2: Configure DNSMasq to Forward to NextDNS

Add the following parameters to your DNSMasq configuration to forward DNS queries to NextDNS while preserving client information:

```conf
# Forward DNS queries to NextDNS on port 5555
--server=127.0.0.1#5555

# Include client MAC address in DNS queries
--add-mac

# Include client subnet information (IPv4: /32, IPv6: /128)
--add-subnet=32,128
```

These parameters ensure that:

- `--server=127.0.0.1#5555`: All DNS queries are forwarded to NextDNS running on port 5555
- `--add-mac`: Client MAC addresses are included in DNS queries, enabling device identification
- `--add-subnet=32,128`: Client subnet information is added for IPv4 (/32) and IPv6 (/128), supporting conditional configuration

## Automatic Configuration for Router Firmwares

On router firmwares that ship with DNSMasq pre-installed, the above configuration can often be handled automatically.

When running NextDNS installation on such routers, use the `-setup-router` parameter:

```bash
# Automatic router setup (handles DNSMasq configuration)
nextdns install -setup-router
```

The `-setup-router` flag automatically detects DNSMasq and configures both services to work together without manual intervention. This is the recommended approach for router environments.

## Best Practices

- **Use alternative port**: Always configure NextDNS to use a non-standard port (e.g., 5555) when running alongside DNSMasq
- **Preserve client information**: Ensure `--add-mac` and `--add-subnet` parameters are set to maintain client reporting features
- **Prefer automatic setup**: On router firmwares, use `-setup-router` parameter for automatic configuration
- **Verify forwarding**: Test DNS resolution after configuration to ensure queries are properly forwarded to NextDNS
- **Check logs**: Monitor both DNSMasq and NextDNS logs to verify proper operation and client identification

## Troubleshooting

### Port Conflicts

If you encounter port binding errors, verify that:

- DNSMasq is running on port 53
- NextDNS is configured to use an alternative port (e.g., 5555)
- No other services are using the chosen alternative port

```bash
# Check which service is using port 53
netstat -tulpn | grep :53

# Verify NextDNS is listening on the configured port
netstat -tulpn | grep :5555
```

### Client Reporting Not Working

If client devices are not appearing correctly in NextDNS analytics:

- Verify `--add-mac` parameter is enabled in DNSMasq configuration
- Check that `--add-subnet` parameter is properly configured
- Ensure DNS queries are being forwarded to NextDNS (check DNSMasq logs)

### Router Firmware Issues

If `-setup-router` fails or doesn't configure properly:

- Fall back to manual configuration using Steps 1 and 2
- Check router firmware documentation for DNSMasq configuration location
- Ensure you have appropriate permissions to modify DNSMasq configuration

## Reference

- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [DNSMasq Documentation](https://thekelleys.org.uk/dnsmasq/doc.html)
- [NextDNS Setup Guide](https://help.nextdns.io)
