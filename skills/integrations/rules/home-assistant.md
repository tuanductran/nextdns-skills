---
title: Home Assistant Integration
impact: MEDIUM
impactDescription: Without this integration guidance, users cannot leverage Home Assistant for automated DNS control and monitoring. This prevents the creation of time-based parental controls, smart blocking rules, and real-time analytics tracking for home automation systems.
type: capability
tags: home assistant, hass, integration, automation, parental control, api, sensors, switches, blocklist
---

# Home Assistant Integration

**Impact: MEDIUM** - Enables automated DNS control and monitoring through Home Assistant smart home platform

Home Assistant is a popular open-source home automation platform that can integrate with NextDNS to provide smart DNS control and monitoring. This integration allows you to automate DNS settings based on time, location, or other triggers, and provides real-time visibility into network activity.

## Prerequisites

Before setting up the integration, you need:

- **API Key**: Generate from NextDNS Account Settings
- **Profile ID**: Located in your NextDNS profile settings (format: `abc123`)

## Installation

1. Navigate to **Settings → Devices & Services** in Home Assistant
2. Click **Add Integration** and search for "NextDNS"
3. Enter your NextDNS API Key and Profile ID
4. The integration will automatically discover and configure available entities

## Available Entities

The integration provides multiple entity types for monitoring and control:

### Binary Sensors

- **Connection Status**: Indicates whether NextDNS is actively connected and responding

### Buttons

- **Clear Logs**: Instantly clear all DNS query logs for the profile

### Sensors

- **Blocked Queries**: Total count of blocked DNS queries
- **Query Ratios**: Percentage breakdown of blocked vs. allowed queries
- **Protocol Statistics**: Distribution of DNS queries by protocol (DoH, DoT, UDP, TCP)
- **Encryption Status**: Count of encrypted vs. unencrypted queries

### Switches

Control various NextDNS features through boolean switches:

- **AI Threat Detection**: Toggle real-time threat intelligence
- **Parental Controls**: Enable/disable content filtering categories
- **Blocklist Controls**: Individual switches for specific services:
    - Block TikTok
    - Block Facebook
    - Block Tinder
    - Block Social Networks (aggregate)
    - Block Gaming platforms
    - Block Dating apps

## Automation Examples

### Time-Based Parental Control

This automation demonstrates blocking social media for children during evening hours:

```yaml
automation:
  - alias: Block social media for kids in the evening
    triggers:
      - trigger: time
        at: "20:00:00"
    actions:
      - action: switch.turn_off
        target:
          entity_id: switch.kids_block_social_networks
```

### Morning Unblock Automation

Complement the evening block with a morning unblock:

```yaml
automation:
  - alias: Unblock social media for kids in the morning
    triggers:
      - trigger: time
        at: "07:00:00"
    actions:
      - action: switch.turn_on
        target:
          entity_id: switch.kids_block_social_networks
```

### High Threat Response

Automatically clear logs when a high number of threats are detected:

```yaml
automation:
  - alias: Clear logs after threat detection
    triggers:
      - trigger: numeric_state
        entity_id: sensor.nextdns_blocked_queries
        above: 1000
    actions:
      - action: button.press
        target:
          entity_id: button.nextdns_clear_logs
```
