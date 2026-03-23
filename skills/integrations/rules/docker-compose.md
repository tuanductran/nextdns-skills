---
title: 'Docker Compose Deployment'
impact: MEDIUM
impactDescription: 'Without network_mode: host on Linux, all DNS clients appear as a single Docker NAT IP, breaking per-device identification and conditional profiles'
type: capability
tags:
  - docker
  - docker-compose
  - container
  - host network
  - compose
  - deployment
  - production
---

# Docker Compose deployment

Deploy NextDNS CLI as a Docker Compose service with persistent configuration and host networking

## Overview

Docker Compose provides a declarative way to run NextDNS CLI in production environments alongside
other containerised services. Using `network_mode: host` on Linux is critical for correct operation
— it allows the container to see real client IP addresses and enables per-device identification and
conditional profiles.

## Correct usage

### Minimal Compose file (Linux)

```yaml
# ✅ docker-compose.yml — Linux host, recommended configuration
services:
  nextdns:
    image: nextdns/nextdns:latest
    container_name: nextdns
    network_mode: host
    restart: unless-stopped
    command: run -profile abc123 -listen :53 -report-client-info
    volumes:
      - /etc/nextdns:/etc/nextdns   # Persist configuration
```

```bash
# ✅ Start the service
docker compose up -d

# ✅ View logs
docker compose logs -f nextdns

# ✅ Check status
docker compose exec nextdns nextdns status
```

### Full production Compose file with environment variable

```yaml
# ✅ Production configuration with profile ID from environment
services:
  nextdns:
    image: nextdns/nextdns:latest
    container_name: nextdns
    network_mode: host
    restart: unless-stopped
    environment:
      - NEXTDNS_PROFILE=${NEXTDNS_PROFILE_ID}
    command: >
      run
      -profile ${NEXTDNS_PROFILE_ID}
      -listen :53
      -report-client-info
      -cache-size 10MB
      -max-ttl 5s
    volumes:
      - nextdns-config:/etc/nextdns
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  nextdns-config:
```

```bash
# ✅ .env file (gitignored)
NEXTDNS_PROFILE_ID=abc123
```

### Port-mapped Compose file (macOS/Windows Docker Desktop)

`network_mode: host` is not supported on macOS and Windows Docker Desktop. Use port mapping as a
fallback — note that all clients will appear as the Docker bridge IP.

```yaml
# ✅ docker-compose.yml — macOS / Windows fallback
services:
  nextdns:
    image: nextdns/nextdns:latest
    container_name: nextdns
    restart: unless-stopped
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    command: run -profile abc123 -listen :53
    volumes:
      - nextdns-config:/etc/nextdns

volumes:
  nextdns-config:
```

### Multi-profile setup (different subnets)

```yaml
# ✅ Advanced: multiple profiles for multiple network segments
services:
  nextdns:
    image: nextdns/nextdns:latest
    container_name: nextdns
    network_mode: host
    restart: unless-stopped
    command: >
      run
      -profile 10.0.1.0/24=PROFILE_HOME
      -profile 10.0.2.0/24=PROFILE_KIDS
      -profile PROFILE_DEFAULT
      -listen :53
      -report-client-info
    volumes:
      - nextdns-config:/etc/nextdns

volumes:
  nextdns-config:
```

### Management commands

```bash
# ✅ Update to the latest NextDNS image
docker compose pull nextdns
docker compose up -d nextdns

# ✅ Reload configuration without downtime
docker compose restart nextdns

# ✅ View real-time DNS query logs
docker compose exec nextdns nextdns log

# ✅ Check cache statistics
docker compose exec nextdns nextdns cache-stats
```

## Do NOT Use

```yaml
# ❌ Using bridge networking instead of host on Linux
services:
  nextdns:
    image: nextdns/nextdns:latest
    ports:
      - "53:53/udp"   # ❌ On Linux, use network_mode: host instead
```

```yaml
# ❌ No restart policy — service stops permanently on crash or reboot
services:
  nextdns:
    image: nextdns/nextdns:latest
    # ❌ Missing: restart: unless-stopped
```

## Best practices

- **Use `network_mode: host` on Linux**: This is the only way to obtain real client IPs and enable
  per-device identification.
- **Mount `/etc/nextdns` as a volume**: This preserves your configuration file across container
  recreations and image updates.
- **Use `restart: unless-stopped`**: Ensures the container starts on boot and after crashes, but
  respects manual `docker stop` commands.
- **Pin image version for production**: Replace `latest` with a specific version tag (for example,
  `nextdns/nextdns:1.42.0`) to prevent unexpected breakage from image updates.

## Troubleshooting

### Issue: port 53 is already in use on the host

```bash
# Check what occupies port 53
sudo ss -tlnup | grep :53

# Common conflict: systemd-resolved
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
docker compose up -d nextdns
```

### Issue: container starts but DNS queries fail

```bash
# View container logs
docker compose logs nextdns

# Test DNS from inside the container
docker compose exec nextdns nslookup example.com 127.0.0.1

# Test from the host
nslookup example.com 127.0.0.1
```

## Reference

- [NextDNS CLI Docker Hub](https://hub.docker.com/r/nextdns/nextdns)
- [NextDNS CLI Wiki — Docker](https://github.com/nextdns/nextdns/wiki/Docker)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
