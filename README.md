# nextdns-skills

Agent skills for NextDNS API integration and DNS management.

> 🚧 **Early Experiment**
>
> This repository is an early experiment in creating specialized skills for AI agents to enhance their capabilities in NextDNS API integration and DNS management. The skills are derived from official API documentation and best practices.
>
> Please give feedback when encountering any issues.

## Installation

```bash
npx add-skill tuanductran/nextdns-skills
```

## Usage

For most reliable results, prefix your prompt with `use nextdns skill`:

```text
use nextdns skill, <your prompt here>
```

This explicitly triggers the skill and ensures the AI follows the documented patterns. Without the prefix, skill triggering may be inconsistent depending on how closely your prompt matches the skill's description keywords.

## Available Skills

### nextdns-api (17 rules)

NextDNS API integration best practices covering authentication, profile management, analytics, logs, and real-time streaming.

| Type       | Count | Examples                                                                                                                                                                       |
|------------|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capability | 15    | Authentication, Profile management, Security settings, Privacy settings, Parental control, Analytics queries, Time series data, Logs streaming, Error handling, Pagination |
| Efficiency | 2     | Response format parsing, Logs download                                                                                                                                         |

### nextdns-cli (10 rules)

NextDNS CLI client best practices for installation, configuration, and management of DNS-over-HTTPS proxy.

| Type       | Count | Examples                                                                                                                                                   |
|:-----------|:------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capability | 8     | Installation, Daemon control, System configuration, Profile configuration, Advanced features, Monitoring, Platform-specific, Troubleshooting                 |
| Efficiency | 2     | Upgrade/uninstall, Best practices                                                                                                                          |

### nextdns-ui (8 rules)

NextDNS Web UI configuration and management best practices via the web dashboard.

| Type       | Count | Examples                                                                                                                                                   |
|:-----------|:------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capability | 6     | Security settings, Privacy settings, Parental control, Denylist/Allowlist, Analytics & Logs, Configuration management                                      |
| Efficiency | 2     | Setup optimization, Troubleshooting via UI                                                                                                                 |

## Rule Types

Rules are classified into two categories:

- **Capability**: AI *cannot* solve the problem without the skill. These address API-specific patterns, authentication requirements, endpoint structures, or edge cases that require deep knowledge of the NextDNS API.

- **Efficiency**: AI *can* solve the problem but not well. These provide optimal patterns, best practices, and consistent approaches that improve solution quality and prevent common mistakes.

## Skills Overview

### NextDNS API Skills

#### Authentication & Setup

- **Authentication**: Proper API key usage with X-Api-Key header
- **Error Handling**: Handle API errors and validation responses correctly
- **Response Format**: Parse API response structure (data, meta, errors)

#### Profile Management

- **Profile Management**: Create, read, update, and delete NextDNS profiles
- **Nested Endpoints**: Work with nested objects and arrays in profile configuration
- **Security Settings**: Configure threat protection and security features
- **Privacy Settings**: Configure privacy blocklists and native tracking protection
- **Parental Control**: Configure parental controls and content filtering
- **Allowlist/Denylist**: Manage custom domain allow/deny lists

#### Analytics & Monitoring

- **Analytics Queries**: Use correct query parameters for analytics endpoints
- **Analytics Endpoints**: Access various analytics endpoints (status, domains, reasons, devices, protocols, etc.)
- **Time Series Data**: Retrieve time series data for charts and visualizations
- **Date Formats**: Use correct date formats (ISO 8601, Unix timestamp, relative dates)

#### Logs Management

- **Logs Management**: Query, filter, and search DNS logs
- **Logs Streaming**: Stream DNS logs in real-time using Server-Sent Events (SSE)
- **Logs Download**: Download logs as CSV files

#### Utilities

- **Pagination**: Correctly paginate through API responses using cursors

### NextDNS CLI Skills

#### Installation & Setup

- **Installation**: Install NextDNS CLI on various platforms (Linux, macOS, Windows, routers, NAS)
- **System Configuration**: Configure system DNS to use NextDNS (activate/deactivate)
- **Profile Configuration**: Configure NextDNS profile ID and settings

#### Daemon Management

- **Daemon Control**: Control NextDNS daemon (start, stop, restart, status)
- **Upgrade/Uninstall**: Upgrade or remove NextDNS CLI

#### Advanced Features

- **Advanced Features**: Conditional forwarders, profile selection, client detection
- **Platform Specific**: Platform-specific configurations (OpenWRT, pfSense, Synology, Ubiquiti)

#### Monitoring & Troubleshooting

- **Monitoring**: Monitor DNS queries, cache stats, and discovered clients
- **Troubleshooting**: Diagnose and fix DNS issues
- **Best Practices**: Performance optimization and security tips

### NextDNS Web UI Skills

#### Configuration & Security

- **Security Settings**: Advanced threat protection rules
- **Privacy Settings**: Blocklists and tracking protection
- **Parental Control**: Advanced filtering and schedules
- **Denylist/Allowlist**: Manual domain management

#### Monitoring & Management

- **Analytics & Logs**: Identify and analyze network traffic
- **Configuration Management**: Profile settings and performance
- **Setup Optimization**: Best practices for dashboard setup
- **Troubleshooting UI**: Debugging issues using the web interface

## Quick Examples

### API Examples

#### Create a Profile

```javascript
const profile = await fetch('https://api.nextdns.io/profiles', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Home Network',
    security: {
      threatIntelligenceFeeds: true,
      cryptojacking: true
    },
    privacy: {
      blocklists: [{ id: 'nextdns-recommended' }]
    }
  })
});
```

#### Get Analytics

```javascript
const analytics = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/domains?from=-7d&limit=50',
  { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
).then(r => r.json());
```

#### Stream Logs in Real-Time

```javascript
const eventSource = new EventSource(
  'https://api.nextdns.io/profiles/abc123/logs/stream?status=blocked',
  { headers: { 'X-Api-Key': 'YOUR_API_KEY' } }
);

eventSource.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log('Blocked:', log.domain);
};
```

### CLI Examples

#### Install NextDNS CLI

```bash
# One-line installation
sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'
```

#### Configure and Start

```bash
# Set profile ID
sudo nextdns config set -profile=abc123

# Install as service
sudo nextdns install

# Start daemon
sudo nextdns start

# Activate system DNS
sudo nextdns activate

# Verify
curl https://test.nextdns.io
```

#### Monitor DNS Queries

```bash
# View logs
nextdns log

# Check cache stats
nextdns cache-stats

# Show discovered clients
nextdns discovered
```

## Methodology

Every skill in this repository is created through a rigorous, evidence-based process:

### 1. Official Documentation Review

Skills are sourced from the official NextDNS API documentation and real-world integration patterns.

### 2. Best Practices Validation

Each skill is validated against:

- Official API specifications
- Common integration patterns
- Error handling requirements
- Performance considerations

### 3. Practical Testing

Skills are tested with:

- Multiple API endpoints
- Various query parameters
- Error scenarios
- Edge cases

## Resources

- [NextDNS API Documentation](https://nextdns.github.io/api/)
- [NextDNS Account](https://my.nextdns.io/account)
- [NextDNS Help Center](https://help.nextdns.io)

## License

MIT
