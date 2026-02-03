---
title: 'Logs Download'
impact: MEDIUM
impactDescription: 'Download logs as a file'
type: efficiency
tags:
  - download logs
  - export logs
  - redirect
  - file download
---

# Logs Download

Download DNS logs as a file

## Endpoint

```http
GET /profiles/:profile/logs/download
```

## Basic Usage

By default, this endpoint redirects to the public URL of the log file:

```javascript
// Browser - automatic download
window.location.href = 'https://api.nextdns.io/profiles/abc123/logs/download';

// Fetch - follows redirect
const response = await fetch('https://api.nextdns.io/profiles/abc123/logs/download', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

// Response is the file content
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'nextdns-logs.csv';
a.click();
```

## Get URL Without Redirect

Use `redirect=0` to get the URL as JSON instead of redirecting:

```javascript
const response = await fetch('https://api.nextdns.io/profiles/abc123/logs/download?redirect=0', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const result = await response.json();
// { "data": { "url": "https://..." } }

const downloadUrl = result.data.url;
```

## With Loading Indicator

Useful when showing a loader while the file is being generated:

```javascript
async function downloadLogs(profileId, apiKey) {
  // Show loading indicator
  showLoader('Generating log file...');

  try {
    // Get the download URL
    const response = await fetch(
      `https://api.nextdns.io/profiles/${profileId}/logs/download?redirect=0`,
      { headers: { 'X-Api-Key': apiKey } }
    );

    const result = await response.json();

    if (result.errors) {
      throw new Error('Failed to generate log file');
    }

    // Download the file
    window.location.href = result.data.url;
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download logs');
  } finally {
    hideLoader();
  }
}
```

## React Example

```javascript
import { useState } from 'react';

function LogsDownloadButton({ profileId, apiKey }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(
        `https://api.nextdns.io/profiles/${profileId}/logs/download?redirect=0`,
        { headers: { 'X-Api-Key': apiKey } }
      );

      const result = await response.json();

      if (result.errors) {
        throw new Error('Failed to generate log file');
      }

      // Trigger download
      window.location.href = result.data.url;
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download logs');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? 'Generating...' : 'Download Logs'}
    </button>
  );
}
```

## Node.js Example

```javascript
import fs from 'fs';
import fetch from 'node-fetch';

async function downloadLogs(profileId, apiKey, outputPath) {
  // Get download URL
  const response = await fetch(
    `https://api.nextdns.io/profiles/${profileId}/logs/download?redirect=0`,
    { headers: { 'X-Api-Key': apiKey } }
  );

  const result = await response.json();

  if (result.errors) {
    throw new Error('Failed to generate log file');
  }

  // Download file
  const fileResponse = await fetch(result.data.url);
  const buffer = await fileResponse.buffer();

  // Save to disk
  fs.writeFileSync(outputPath, buffer);
  console.log(`Logs saved to ${outputPath}`);
}

// Usage
await downloadLogs('abc123', process.env.NEXTDNS_API_KEY, './nextdns-logs.csv');
```

## File Format

The downloaded file is in CSV format with the following columns:

- Timestamp
- Domain
- Root Domain
- Type (A, AAAA, etc.)
- Status (default, blocked, allowed)
- Reasons (if blocked)
- Client IP
- Device Name
- Device Model
- Protocol (DoH, DoT, UDP, etc.)
- Encrypted (yes/no)

## Query Parameters

The download endpoint supports the same filtering parameters as the logs endpoint:

```javascript
// Download only blocked logs
const url = new URL('https://api.nextdns.io/profiles/abc123/logs/download');
url.searchParams.set('status', 'blocked');
url.searchParams.set('from', '-7d');
url.searchParams.set('redirect', '0');

const response = await fetch(url, {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

### Supported Parameters

- `from` - Start date
- `to` - End date
- `device` - Filter by device
- `status` - Filter by status (blocked, allowed, default)
- `search` - Search for domain
- `raw` - Include all queries (true/false)
- `redirect` - Return URL instead of redirecting (0/1)

## Complete Example with Filters

```javascript
async function downloadFilteredLogs(profileId, apiKey, filters = {}) {
  const url = new URL(`https://api.nextdns.io/profiles/${profileId}/logs/download`);

  // Add filters
  if (filters.from) url.searchParams.set('from', filters.from);
  if (filters.to) url.searchParams.set('to', filters.to);
  if (filters.device) url.searchParams.set('device', filters.device);
  if (filters.status) url.searchParams.set('status', filters.status);
  if (filters.search) url.searchParams.set('search', filters.search);
  if (filters.raw !== undefined) url.searchParams.set('raw', filters.raw ? '1' : '0');

  // Get URL without redirect
  url.searchParams.set('redirect', '0');

  const response = await fetch(url, {
    headers: { 'X-Api-Key': apiKey },
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error('Failed to generate log file');
  }

  return result.data.url;
}

// Usage: Download blocked logs from last 7 days
const downloadUrl = await downloadFilteredLogs('abc123', process.env.NEXTDNS_API_KEY, {
  status: 'blocked',
  from: '-7d',
});

window.location.href = downloadUrl;
```

## Do NOT Use

```javascript
// ❌ Not handling redirect parameter
const response = await fetch(url).then((r) => r.json());
// This will fail because default is redirect, not JSON

// ❌ Not checking for errors
const { data } = await fetch(url + '?redirect=0').then((r) => r.json());
window.location.href = data.url; // Might not exist if there are errors

// ✅ Correct
const response = await fetch(url + '?redirect=0', { headers }).then((r) => r.json());
if (response.errors) {
  throw new Error('Failed to generate log file');
}
window.location.href = response.data.url;
```

## Reference

- [NextDNS API - Logs Download](https://nextdns.github.io/api/#download)
