---
title: 'Pi-hole to NextDNS Migration'
impact: MEDIUM
impactDescription: 'Migrating without exporting custom blocklist entries causes loss of tailored domain rules accumulated over months or years of Pi-hole use'
type: efficiency
tags:
  - pi-hole
  - migration
  - blocklist
  - allowlist
  - denylist
  - local dns
  - transition
---

# Pi-hole to NextDNS migration

Migrate from Pi-hole to NextDNS while preserving custom blocklist entries, local DNS records, and DHCP settings

## Overview

Pi-hole users switching to NextDNS typically want to preserve:

1. **Custom blocked domains** (ad-hoc additions to Pi-hole's blocklist)
2. **Custom allowed domains** (whitelist entries for false positives)
3. **Local DNS records** (hostname → IP mappings for home devices)
4. **DHCP settings** (if Pi-hole was acting as the DHCP server)

NextDNS does not import Pi-hole databases directly, but its API makes it straightforward to
replicate these settings programmatically.

## Step 1: export custom domains from Pi-hole

### Export custom blocklist (exact domains)

```bash
# ✅ On the Pi-hole device — export exact domain blacklist
# Pi-hole stores custom exact blocks in its gravity database
sqlite3 /etc/pihole/gravity.db \
  "SELECT domain FROM domainlist WHERE type=1 AND enabled=1;" \
  > ~/pihole-blacklist.txt

echo "Custom blocked domains:"
wc -l ~/pihole-blacklist.txt
```

### Export whitelist (exact domains)

```bash
# ✅ Export exact whitelist entries
sqlite3 /etc/pihole/gravity.db \
  "SELECT domain FROM domainlist WHERE type=0 AND enabled=1;" \
  > ~/pihole-whitelist.txt

echo "Whitelisted domains:"
wc -l ~/pihole-whitelist.txt
```

### Export local DNS records (custom A records)

```bash
# ✅ Local DNS records are in /etc/pihole/custom.list
cat /etc/pihole/custom.list > ~/pihole-local-dns.txt

# Format: IP_ADDRESS hostname
# Example: 192.168.1.100 nas.home
cat ~/pihole-local-dns.txt
```

## Step 2: import blocklist entries into NextDNS

```javascript
// ✅ Import Pi-hole blacklist into NextDNS denylist via API
import fs from 'node:fs';

const API_KEY = 'YOUR_API_KEY';
const PROFILE_ID = 'abc123';

async function importDenylist(filepath) {
  const domains = fs.readFileSync(filepath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  console.log(`Importing ${domains.length} blocked domains…`);

  let imported = 0;
  let skipped = 0;

  for (const domain of domains) {
    // Basic domain validation
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      skipped++;
      continue;
    }

    const res = await fetch(
      `https://api.nextdns.io/profiles/${PROFILE_ID}/denylist`,
      {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: domain, active: true }),
      }
    );

    const json = await res.json();

    if (json.errors) {
      const code = json.errors[0].code;
      if (code === 'duplicate') {
        skipped++;
      } else {
        console.warn(`Skipped ${domain}: ${json.errors[0].detail}`);
        skipped++;
      }
    } else {
      imported++;
    }

    // Rate limit: pause between requests
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`Done: ${imported} imported, ${skipped} skipped`);
}

await importDenylist('./pihole-blacklist.txt');
```

## Step 3: import allowlist entries into NextDNS

```javascript
// ✅ Import Pi-hole whitelist into NextDNS allowlist via API
async function importAllowlist(filepath) {
  const domains = fs.readFileSync(filepath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  console.log(`Importing ${domains.length} allowed domains…`);

  for (const domain of domains) {
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) continue;

    await fetch(
      `https://api.nextdns.io/profiles/${PROFILE_ID}/allowlist`,
      {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: domain, active: true }),
      }
    );

    await new Promise(r => setTimeout(r, 150));
  }

  console.log('Allowlist import complete');
}

await importAllowlist('./pihole-whitelist.txt');
```

## Step 4: import local DNS records into NextDNS rewrites

```javascript
// ✅ Convert Pi-hole local DNS (custom.list) to NextDNS rewrites
async function importLocalDns(filepath) {
  const lines = fs.readFileSync(filepath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  for (const line of lines) {
    const [ip, hostname] = line.split(/\s+/);
    if (!ip || !hostname) continue;

    await fetch(
      `https://api.nextdns.io/profiles/${PROFILE_ID}/rewrites`,
      {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: hostname, content: ip }),
      }
    );

    console.log(`Rewrite added: ${hostname} → ${ip}`);
    await new Promise(r => setTimeout(r, 150));
  }
}

await importLocalDns('./pihole-local-dns.txt');
```

## Step 5: switch DNS to NextDNS

After verifying the import in the NextDNS dashboard:

1. **Stop Pi-hole's DNS** (but keep it running for DHCP if needed):
   ```bash
   sudo systemctl stop pihole-FTL
   ```
2. **Change your router's DHCP DNS** to your NextDNS CLI installation or NextDNS's linked IP
3. **Force DHCP renewal** on clients
4. **Monitor the NextDNS Logs tab** for 24 hours — add any false positives to the allowlist

## What NextDNS cannot replace

- **Pi-hole's DHCP server**: NextDNS is DNS-only. If you used Pi-hole as a DHCP server, migrate
  that function to your router or keep Pi-hole running for DHCP only.
- **Pi-hole's regex blocking**: NextDNS denylist supports exact domains and wildcards
  (`*.example.com`) but not full regex patterns.
- **Pi-hole's query logs stored locally**: NextDNS logs are stored in the cloud (your chosen
  region). If you need on-device log storage, this is a limitation.

## Reference

- [NextDNS API — Denylist](https://nextdns.github.io/api/#profile)
- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)
- [Pi-hole Documentation](https://docs.pi-hole.net)
