---
title: Monitoring
impact: MEDIUM
impactDescription: Monitoring DNS queries, logs, and client activity
type: capability
tags: log, cache-stats, discovered clients, monitoring, debug
---

# Monitoring

**Impact: MEDIUM** - Real-time observation and metrics of DNS traffic

Use these commands to monitor the health and activity of the NextDNS proxy.

## Checking Logs

To view the real-time activity and startup logs of the daemon:

```bash
# View recent logs
nextdns log

# Enable debug logs for detailed troubleshooting
sudo nextdns config set -debug=true
sudo nextdns restart
nextdns log
```

## Cache Statistics

If you have caching enabled, you can monitor its performance:

```bash
# View cache usage and hit rates
nextdns cache-stats
```

## Client Discovery

See which clients are currently being discovered on the local network (useful for router installations):

```bash
# List discovered clients and their names
nextdns discovered
```

## Query Logging

Enable direct logging of DNS queries to the console (useful for debugging specific blocked domains):

```bash
sudo nextdns config set -log-queries=true
sudo nextdns restart
nextdns log
```

**Note**: Query logging can produce a lot of data and is not recommended for long-term use in high-traffic environments.
