---
title: "pfSense and OPNsense Integration"
impact: HIGH
impactDescription: "Proper configuration of NextDNS on pfSense and OPNsense firewalls enables network-wide DNS protection with encrypted DNS transport. Without this guidance, users may face CNAME chasing issues on pfSense or fail to leverage OPNsense's native DoT capabilities."
type: capability
tags: "pfsense, opnsense, firewall, router, unbound, dns-over-tls, dot, freebsd, dns resolver"
---
# pfSense and OPNsense Integration

**Impact: HIGH** - Critical for deploying NextDNS on enterprise-grade firewalls with proper encrypted DNS configuration and awareness of platform-specific limitations

pfSense and OPNsense are FreeBSD-based firewall/router platforms widely used in enterprise and home environments. This rule provides platform-specific guidance for integrating NextDNS with their native DNS resolvers.

## pfSense Configuration

pfSense uses Unbound as its DNS resolver. There are two methods to integrate NextDNS.

### Method 1: Native Unbound with DNS-over-TLS (Recommended)

Configure Unbound to forward all DNS queries to NextDNS over TLS.

#### Configuration Steps

1. Navigate to **Services → DNS Resolver → General Settings**
2. Scroll to **Custom Options** section
3. Add the following configuration:

```yaml
server:
  forward-zone:
    name: "."
    forward-tls-upstream: yes
    forward-addr: 45.90.28.0#<config_id>.dns1.nextdns.io
    forward-addr: 2a07:a8c0::#<config_id>.dns1.nextdns.io
    forward-addr: 45.90.30.0#<config_id>.dns2.nextdns.io
    forward-addr: 2a07:a8c1::#<config_id>.dns2.nextdns.io
```

1. Replace `<config_id>` with your actual NextDNS Configuration ID
2. Click **Save** and **Apply Changes**

#### ⚠️ Critical Warning: CNAME Chasing Behavior

**pfSense uses Unbound as a recursive resolver. Unbound chases CNAMEs by design, which can result in unexpected behavior when used in conjunction with a blocking DNS resolver like NextDNS.**

**What this means:**
- If NextDNS blocks a domain that uses a CNAME record, Unbound may still resolve the CNAME target
- This can bypass some of your blocking rules
- This is a known limitation of Unbound (see Unbound issue #132)

**Mitigation:**
- Be aware of this behavior when troubleshooting unexpected access to blocked domains
- Consider using Method 2 (CLI) if this limitation affects your use case
- Test your blocking rules after configuration to verify expected behavior

### Method 2: NextDNS CLI Installation

Install the NextDNS CLI directly on pfSense (FreeBSD-compatible).

```bash
# Connect via SSH to pfSense
ssh admin@your-pfsense-ip

# Run the NextDNS installer
sh -c "$(curl -sL https://nextdns.io/install)"

# Follow the interactive prompts
```

**Advantages:**
- Avoids CNAME chasing issues
- Provides device-level analytics
- Better integration with NextDNS features

## OPNsense Configuration

OPNsense provides a dedicated user interface for DNS-over-TLS configuration, making it more straightforward than pfSense.

### Method 1: Native Unbound with DoT UI (Recommended)

OPNsense has a built-in UI for configuring DNS-over-TLS, which is the preferred method.

#### Configuration Steps

1. Navigate to **Services → Unbound DNS → DNS over TLS**
2. Click **Add** button
3. Configure the following settings:

| Setting | Value |
|---------|-------|
| **Server IP** | `45.90.28.0` or `45.90.30.0` |
| **Server Port** | `853` |
| **Verify CN** | `<your_config_id>.dns.nextdns.io` |

1. Replace `<your_config_id>` with your actual NextDNS Configuration ID
2. Click **Save** and **Apply**

**Why Verify CN matters:**
- Ensures the connection is encrypted and authenticated
- Links the traffic to your specific NextDNS profile
- Prevents man-in-the-middle attacks

#### Optional: Add Secondary Server

Repeat the steps above with the secondary server for redundancy:

| Setting | Value |
|---------|-------|
| **Server IP** | `45.90.30.0` (if you used `45.90.28.0` above) |
| **Server Port** | `853` |
| **Verify CN** | `<your_config_id>.dns.nextdns.io` |

### Method 2: NextDNS CLI Installation

OPNsense also supports the CLI installer:

```bash
# Connect via SSH to OPNsense
ssh root@your-opnsense-ip

# Run the NextDNS installer
sh -c "$(curl -sL https://nextdns.io/install)"

# Follow the interactive prompts
```

## Comparison: pfSense vs OPNsense

| Feature | pfSense | OPNsense |
|---------|---------|----------|
| **DoT UI** | ❌ Manual configuration required | ✅ Dedicated UI available |
| **Configuration Method** | Custom Options (YAML) | Web UI form |
| **CNAME Chasing** | ⚠️ Yes (known issue) | ⚠️ Yes (Unbound behavior) |
| **CLI Support** | ✅ Yes (FreeBSD) | ✅ Yes (FreeBSD) |
| **Ease of Setup** | Moderate | Easy |

## Verification Steps

After configuration, verify that NextDNS is working correctly:

1. Check DNS resolution:
    ```bash
    nslookup example.com 127.0.0.1
```text

2. Verify NextDNS is being used:
    - Visit [https://test.nextdns.io](https://test.nextdns.io)
    - You should see your Configuration ID and "✓ This device is using NextDNS"

3. Check the NextDNS logs:
    - Navigate to your NextDNS dashboard
    - Verify queries from your firewall are appearing in the logs

## Troubleshooting

### DNS Resolution Not Working

```
# Check Unbound status
pfctl -s state | grep 53
# or on OPNsense
service unbound status
```bash

### Verify DoT Connection

```
# Test TLS connection to NextDNS
openssl s_client -connect 45.90.28.0:853 -servername <config_id>.dns1.nextdns.io
```bash

### Debug Mode Installation (CLI Method)

```
DEBUG=1 sh -c "$(curl -sL https://nextdns.io/install)"
```text
