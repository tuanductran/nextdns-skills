---
title: 'DNS Rewrites'
impact: MEDIUM
impactDescription:
  'Misconfigured rewrites silently override DNS resolution and can break access to legitimate
  services'
type: capability
tags:
  - rewrites
  - custom dns
  - hostname override
  - local dns
  - cname
  - block override
---

# DNS rewrites

Override DNS resolution for specific hostnames from the NextDNS web dashboard

## Overview

The **Rewrites** tab of a NextDNS profile lets you define custom DNS records that take precedence
over all other resolution — including blocklists, security rules, and upstream DNS answers.

Navigate to **my.nextdns.io → \[Profile\] → Rewrites** to manage rewrite records.

Common use cases:

- Access local devices by friendly hostname (for example, `nas.home → 192.168.1.50`)
- Block a specific hostname by returning `0.0.0.0`
- Create a CNAME alias for a self-hosted service

## Correct usage

### Adding an a record IPv4

1. Click **Add a Rewrite**
2. Enter the **Name** (hostname, for example, `nas.home`)
3. Enter the **Answer** (IPv4 address, for example, `192.168.1.50`)
4. Click **Add**

```text
✅ Name:   nas.home
   Answer: 192.168.1.50       → Returns the specified IPv4 address
```

### Adding an AAAA record IPv6

```text
✅ Name:   nas.home
   Answer: fd00::1            → Returns the specified IPv6 address
```

### Adding a CNAME

```text
✅ Name:   blog.example.com
   Answer: myserver.example.com   → Returns CNAME pointing to the target
```

### Blocking a specific hostname

```text
✅ Name:   tracker.specific.com
   Answer: 0.0.0.0               → Blocks this exact hostname
```

## Do NOT Use

```text
❌ Wildcard names such as *.example.com
   Rewrites apply to exact hostnames only.
   Use the Denylist tab for wildcard blocking.

❌ Rewriting nextdns.io or dns.nextdns.io
   This breaks DNS-over-HTTPS connectivity to NextDNS itself.

❌ Expecting rewrites to cascade
   A CNAME rewrite to myserver.example.com does not apply
   any rewrite you may have defined for myserver.example.com.
```

## Best practices

- **Rewrites override everything**: A rewrite takes precedence over blocklists, security rules, and
  allowlists for that exact hostname.
- **Use `.home` or `.lan` for local devices**: These TLDs are not publicly registered, reducing the
  chance of accidental conflicts with real domains.
- **Prefer the Denylist for simple blocking**: Only use a rewrite to block when you need a specific
  non-zero answer. For straightforward blocking, the Denylist is simpler and supports wildcards.
- **Test resolution after adding**: Run `nslookup nas.home` from a device using NextDNS to confirm
  the rewrite is active.

## Troubleshooting

### Issue: rewrite NOT resolving correctly

**Symptoms**: Device still gets the original IP or NXDOMAIN after adding a rewrite.

**Solution**:

1. Confirm that the profile currently active on the device is the one where the rewrite was added.
2. Flush the local DNS cache on the querying device.
3. Check the **Logs** tab in the NextDNS dashboard to see what answer was returned.

```bash
# macOS — flush DNS cache
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Linux (systemd-resolved)
sudo resolvectl flush-caches

# Windows
ipconfig /flushdns
```

### Issue: a legitimate service stopped working after adding a rewrite

**Symptoms**: A website or app becomes inaccessible after adding a rewrite entry.

**Solution**: The rewrite overrides the real DNS answer for that hostname. Remove or correct the
entry in the Rewrites tab.

## Reference

- [NextDNS Help Center](https://help.nextdns.io)
- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)
