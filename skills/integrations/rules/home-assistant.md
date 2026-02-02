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

## Polling Intervals

The integration uses different polling intervals for various data types:

- **Connection Status**: 5 minutes
- **Analytics Data**: 10 minutes
- **Settings/Configuration**: 1 minute

These intervals balance real-time updates with API rate limits.

## Verification

After setting up the integration, verify it's working correctly:

1. Check that all entities appear in **Developer Tools → States**
2. Search for entities starting with `sensor.nextdns_`, `switch.nextdns_`, `binary_sensor.nextdns_`, and `button.nextdns_`
3. Visit [https://test.nextdns.io](https://test.nextdns.io) from a device on your network to confirm NextDNS is active
4. Verify the connection status sensor shows "Connected"
5. Check the NextDNS dashboard to see recent queries from your network

## Best Practices

- **Use Profile-Specific Integrations**: Set up separate integrations for each family member's profile to enable granular control
- **Combine with Presence Detection**: Link DNS controls to home/away automations for context-aware filtering
- **Monitor Blocked Queries**: Create dashboards to visualize network activity and identify unwanted traffic patterns
- **Test Automations**: Verify time-based blocks work as expected before relying on them for parental controls
- **Backup Configuration**: Export automation YAML to preserve rules during Home Assistant updates

## Common Pitfalls

- **API Rate Limits**: Avoid creating automations that trigger switches too frequently (respect 1-minute minimum intervals)
- **Profile Conflicts**: Ensure each device uses the correct profile; mixing profiles causes inconsistent behavior
- **Entity Naming**: Entity IDs are generated automatically; check Developer Tools → States to find exact names
- **Time Zones**: Verify Home Assistant time zone matches your local time for accurate time-based triggers

## Troubleshooting

### Integration Not Discovering Entities

1. Verify API Key has correct permissions in NextDNS Account Settings
2. Check Profile ID is correct (6-character alphanumeric)
3. Restart Home Assistant after initial setup
4. Review Home Assistant logs for authentication errors

### Switches Not Responding

- Check that the feature is enabled in NextDNS web interface
- Verify no rate limiting is occurring (wait 60 seconds between changes)
- Ensure the profile isn't locked or restricted by organization policies

### Sensor Data Not Updating

- Confirm network connectivity between Home Assistant and NextDNS servers
- Check polling intervals haven't been customized too aggressively
- Review integration configuration for errors

## Reference

- [NextDNS API Documentation](https://nextdns.github.io/api/)
- [Home Assistant NextDNS Integration](https://www.home-assistant.io/integrations/nextdns/)
- [Home Assistant Automation Guide](https://www.home-assistant.io/docs/automation/)
