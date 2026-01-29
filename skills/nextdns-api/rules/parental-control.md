---
title: Parental Control
impact: HIGH
impactDescription: Configure parental controls, safe search, and content filtering
type: capability
tags: parental control, safe search, youtube restricted mode, content filtering, services blocking
---

# Parental Control

**Impact: HIGH** - Configure parental controls and content filtering

## Parental Control Configuration

```javascript
const parentalControlSettings = {
  parentalControl: {
    // Block/allow specific services
    services: [
      { id: "tiktok", active: true },      // Block TikTok
      { id: "facebook", active: false },   // Allow Facebook
      { id: "instagram", active: true },   // Block Instagram
      { id: "snapchat", active: true },    // Block Snapchat
      { id: "twitter", active: false },    // Allow Twitter
      { id: "youtube", active: false },    // Allow YouTube
      { id: "twitch", active: true },      // Block Twitch
      { id: "discord", active: false },    // Allow Discord
      { id: "reddit", active: false },     // Allow Reddit
      { id: "whatsapp", active: false }    // Allow WhatsApp
    ],
    
    // Block/allow content categories
    categories: [
      { id: "porn", active: true },              // Block adult content
      { id: "gambling", active: true },          // Block gambling
      { id: "dating", active: true },            // Block dating sites
      { id: "piracy", active: true },            // Block piracy
      { id: "social-networks", active: false },  // Allow social networks
      { id: "gaming", active: false },           // Allow gaming
      { id: "streaming", active: false }         // Allow streaming
    ],
    
    // Search engine safety
    safeSearch: true,              // Enforce safe search
    youtubeRestrictedMode: true,   // Enable YouTube restricted mode
    blockBypass: true              // Block VPNs and proxies
  }
};
```

## Update Parental Control Settings

```javascript
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    safeSearch: true,
    youtubeRestrictedMode: true,
    blockBypass: true
  })
});
```

## Manage Services

```javascript
// Block a service
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: "tiktok", active: true })
});

// Update service status
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services/tiktok', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: false })
});

// Remove service from list
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services/tiktok', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Manage Categories

```javascript
// Block a category
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/categories', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: "gambling", active: true })
});

// Update category status
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/categories/gambling', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: false })
});
```

## Popular Services

| Service ID | Description |
|------------|-------------|
| `tiktok` | TikTok |
| `facebook` | Facebook |
| `instagram` | Instagram |
| `snapchat` | Snapchat |
| `twitter` | Twitter/X |
| `youtube` | YouTube |
| `twitch` | Twitch |
| `discord` | Discord |
| `reddit` | Reddit |
| `whatsapp` | WhatsApp |
| `telegram` | Telegram |
| `fortnite` | Fortnite |
| `roblox` | Roblox |
| `minecraft` | Minecraft |
| `netflix` | Netflix |
| `disney-plus` | Disney+ |
| `hulu` | Hulu |
| `spotify` | Spotify |

## Content Categories

| Category ID | Description |
|-------------|-------------|
| `porn` | Adult content |
| `gambling` | Gambling and betting |
| `dating` | Dating sites and apps |
| `piracy` | Piracy and torrents |
| `drugs` | Drug-related content |
| `violence` | Violent content |
| `weapons` | Weapons and ammunition |
| `hate-discrimination` | Hate speech |
| `social-networks` | Social media platforms |
| `gaming` | Gaming sites and platforms |
| `streaming` | Video streaming services |
| `shopping` | E-commerce sites |

## Features Explained

- **Services**: Block or allow specific apps and websites (TikTok, Facebook, etc.)
- **Categories**: Block entire categories of content (porn, gambling, etc.)
- **Safe Search**: Force safe search on Google, Bing, DuckDuckGo, etc.
- **YouTube Restricted Mode**: Enable YouTube's restricted mode
- **Block Bypass**: Block VPNs, proxies, and Tor to prevent circumvention

## Active vs Inactive

- `active: true` = Block the service/category
- `active: false` = Allow the service/category (but keep in list for quick toggling)

## Do NOT Use

```javascript
// ❌ Using boolean instead of object with active property
{
  parentalControl: {
    services: [
      { id: "tiktok", blocked: true } // ❌ Wrong property name
    ]
  }
}

// ✅ Correct format
{
  parentalControl: {
    services: [
      { id: "tiktok", active: true }
    ]
  }
}
```

## Reference

- [NextDNS Parental Control](https://help.nextdns.io/)
- [Available Services](https://github.com/nextdns/services)
