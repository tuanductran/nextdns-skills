---
title: "Tailscale Integration"
impact: HIGH
impactDescription: "Without proper Tailscale integration, users cannot protect their mesh VPN traffic with NextDNS filtering. This leaves devices vulnerable to threats when accessing resources through Tailscale tunnels and prevents centralized DNS policy enforcement across distributed networks."
type: capability
tags: "tailscale, vpn, mesh network, doh, dns-over-https, acl, nodeattrs, global nameserver, split dns"
---
# Tailscale Integration

**Impact: HIGH** - Critical for protecting mesh VPN traffic with NextDNS filtering and enforcing DNS policies across distributed networks

Tailscale is a zero-config mesh VPN built on WireGuard that makes it easy to connect devices securely. By integrating NextDNS with Tailscale, you can ensure that all traffic flowing through your Tailscale network benefits from NextDNS filtering and protection.

## Integration Mechanism

Tailscale integrates with NextDNS using **DNS-over-HTTPS (DoH)** as the transport protocol. This ensures encrypted DNS queries across your entire mesh network, even when devices are on untrusted networks.

## Basic Setup: Global Nameserver

This configuration applies NextDNS to all devices in your Tailscale network (tailnet).

### Step 1: Obtain NextDNS IPv6 Endpoint

1. Log in to your NextDNS dashboard
2. Navigate to the **Setup** tab
3. Find the **Endpoints** section
4. Copy the **IPv6 address** (format: `2a07:a8c0::xx:xxxx`)

### Step 2: Configure Tailscale Admin Console

1. Open the [Tailscale Admin Console](https://login.tailscale.com/admin/dns)
2. Navigate to **DNS** settings
3. Under **Nameservers**, select **Custom**
4. Add your NextDNS IPv6 endpoint address
5. **Critical**: Enable **Override local DNS** to force all devices to use NextDNS

```text
Example Configuration:
Nameserver: 2a07:a8c0::ab:cd12
☑ Override local DNS
```

### Step 3: Enable Override DNS Servers (Critical)

This setting must be enabled to ensure NextDNS is actually used:

- Without this option, devices may continue using their local DNS settings
- Enabling it forces all DNS queries through Tailscale's resolver
- This is the most common cause of integration failures

## Advanced Configuration: Per-Device Profiles

Tailscale's Access Control List (ACL) system allows you to assign different NextDNS profiles to specific devices or user groups using node attributes.

### Assigning Profiles with nodeAttrs

You can specify which NextDNS profile each device should use through ACL policies:

```json
{
    "nodeAttrs": [
        {
            "target": ["tag:family"],
            "attr": ["nextdns:abc123"]
        },
        {
            "target": ["tag:work"],
            "attr": ["nextdns:xyz789"]
        },
        {
            "target": ["autogroup:admin"],
            "attr": ["nextdns:def456"]
        }
    ]
}
```

**Explanation**:
- `target`: Specifies which devices/users this rule applies to (uses Tailscale tags or autogroups)
- `attr`: The NextDNS profile ID to apply (format: `nextdns:YOUR_PROFILE_ID`)
- Replace `abc123`, `xyz789`, etc. with your actual NextDNS profile IDs

### Example: Family vs. Work Profiles

```json
{
    "nodeAttrs": [
        {
            "target": ["tag:kids"],
            "attr": ["nextdns:kids001"],
            "comment": "Strict parental controls for children's devices"
        },
        {
            "target": ["tag:adults"],
            "attr": ["nextdns:adult001"],
            "comment": "Standard protection for adult family members"
        },
        {
            "target": ["tag:servers"],
            "attr": ["nextdns:server001"],
            "comment": "Minimal filtering for servers and IoT devices"
        }
    ]
}
```

### Disabling Device Metadata Sharing

If you prefer not to share device information with NextDNS, use the `no-device-info` attribute:

```json
{
    "nodeAttrs": [
        {
            "target": ["autogroup:member"],
            "attr": ["nextdns:no-device-info"]
        }
    ]
}
```

This prevents Tailscale from sending device names, operating systems, and other metadata to NextDNS.

## Limitations

### Split DNS Not Supported

NextDNS cannot be used as a split DNS server alongside other DNS providers in Tailscale. You must choose one of the following:

- **Option A**: Use NextDNS exclusively for all DNS queries
- **Option B**: Use another DNS provider and forgo NextDNS integration

There is no hybrid configuration where some domains use NextDNS and others use different resolvers.

### IPv6 Requirement

The DoH integration requires IPv6 connectivity. Devices without IPv6 support may experience issues or fallback to local DNS.

## Verification

After configuration, verify the integration is working:

1. Visit [https://test.nextdns.io](https://test.nextdns.io) from a Tailscale-connected device
2. Confirm it shows "This device is using NextDNS with [your profile]"
3. Check the NextDNS logs to see queries from your Tailscale devices

## Best Practices

- **Test Before Full Deployment**: Configure a single device first to verify functionality
- **Use Tags Strategically**: Organize devices with Tailscale tags for easier profile management
- **Monitor Query Logs**: Check NextDNS analytics to ensure queries are being routed correctly
- **Document Profile Assignments**: Keep a reference of which tags use which NextDNS profiles
- **Regular ACL Review**: Audit your ACL configuration periodically to ensure correct profile assignments

## Common Pitfalls

- **Forgetting to Enable Override**: The most common mistake is not enabling "Override local DNS" in Tailscale settings
- **Wrong Endpoint Format**: Ensure you use the IPv6 address from NextDNS Endpoints, not the DoH URL
- **ACL Syntax Errors**: JSON formatting errors in ACLs will prevent the configuration from saving
- **Profile ID Typos**: Double-check NextDNS profile IDs in nodeAttrs to avoid routing to wrong profiles
- **No Fallback DNS**: If NextDNS is unavailable, DNS resolution may fail completely (consider testing backup scenarios)

## Troubleshooting

### DNS Not Working After Configuration

1. Verify "Override local DNS" is enabled in Tailscale Admin Console
2. Check that the NextDNS IPv6 endpoint is correctly entered
3. Restart the Tailscale client on affected devices
4. Test IPv6 connectivity: `ping6 2a07:a8c0::1`

### Wrong Profile Being Used

1. Review your ACL nodeAttrs configuration for syntax errors
2. Verify device tags are correctly assigned in Tailscale Admin Console
3. Check that profile IDs match your NextDNS dashboard
4. Use `tailscale status` to confirm device tags

### Queries Not Appearing in NextDNS Logs

1. Confirm devices are actually routing through Tailscale (check Tailscale status)
2. Verify the profile ID in your configuration is correct
3. Check if device metadata sharing is blocked by firewall rules
4. Review Tailscale logs for DNS-related errors

## Reference

- [Tailscale DNS Documentation](https://tailscale.com/kb/1054/dns/)
- [NextDNS Setup Guide](https://help.nextdns.io)
- [Tailscale ACL Documentation](https://tailscale.com/kb/1018/acls/)
