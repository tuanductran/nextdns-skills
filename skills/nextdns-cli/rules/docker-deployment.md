---
title: 'Docker Deployment'
impact: HIGH
impactDescription:
  'Proper Docker deployment ensures NextDNS CLI runs efficiently with correct network configuration
  for host detection and client IP visibility'
type: capability
tags:
  - docker
  - container
  - DockerHub
  - host network
  - port mapping
  - deployment
---

# Docker Deployment

Essential container deployment patterns for optimal DNS resolution and client tracking

NextDNS CLI is available as pre-built Docker images on DockerHub (`nextdns/nextdns`), enabling
containerized deployments across various platforms. The networking mode significantly affects
functionality, particularly for host detection and client IP visibility.

## Host Network Mode (Recommended)

Using host network mode allows the NextDNS CLI container to see actual LAN IP addresses and enables
host detection features:

```bash
docker run -d --network host --restart unless-stopped nextdns/nextdns run -listen=:53 -profile=abc123
```

### Why Host Network Mode?

- **Real IP Visibility**: The CLI sees actual client IP addresses from your LAN instead of Docker's
  internal NAT IPs.
- **Host Detection**: Automatic device identification works properly since the CLI can observe
  network traffic patterns.
- **Performance**: Eliminates NAT overhead for DNS queries.
- **Simplicity**: No port mapping required, direct access to port 53.

### Important Considerations

- Host network mode only works on Linux hosts.
- The container shares the host's network stack directly.
- Ensure no other service is listening on port 53 on the host.

## Port Translation Mode

When host network mode is not available or desired, use port mapping:

```bash
docker run -d -p 53:53/tcp -p 53:53/udp --restart unless-stopped nextdns/nextdns run -listen=:53 -profile=abc123
```

### Limitations

- **NAT IP Addresses**: All clients appear as internal Docker NATed IP addresses (typically from the
  Docker bridge network).
- **No Host Detection**: Device identification features will not work properly.
- **Query Attribution**: All queries appear to come from the Docker container's IP rather than
  individual clients.

### When to Use

- On macOS or Windows Docker Desktop where host networking is not supported.
- In environments where network isolation is required.
- For testing or development purposes.

## Persistence Configuration

The `--restart unless-stopped` flag ensures the container automatically restarts on system boot and
after Docker daemon restarts:

```bash
docker run -d \
    --name nextdns \
    --network host \
    --restart unless-stopped \
    nextdns/nextdns run -listen=:53 -profile=abc123
```

### Restart Policy Options

- `unless-stopped`: Container restarts automatically unless explicitly stopped (recommended for
  production).
- `always`: Container always restarts, even after manual stops (not recommended).
- `on-failure`: Only restarts on non-zero exit codes.
- `no`: No automatic restart (default, not recommended for DNS services).

## Configuration File Persistence

To persist configuration across container restarts, mount the configuration directory:

```bash
docker run -d \
    --name nextdns \
    --network host \
    --restart unless-stopped \
    -v /etc/nextdns:/etc/nextdns \
    nextdns/nextdns run -listen=:53 -profile=abc123
```

This allows the CLI to store and read configuration from `/etc/nextdns` on the host system.

## Best Practices

- **Always Use Restart Policy**: DNS services must be highly available. Use
  `--restart unless-stopped` for production deployments.
- **Prefer Host Network Mode**: On Linux systems, host network mode provides the best functionality
  and performance.
- **Profile ID Management**: Store profile IDs securely, consider using Docker secrets or
  environment variables for sensitive configurations.
- **Resource Limits**: In production, consider setting memory and CPU limits to prevent resource
  exhaustion.
- **Logging**: Use Docker logging drivers to capture and rotate NextDNS CLI logs appropriately.

## Container Management

```bash
# View container status
docker ps -f name=nextdns

# View logs
docker logs nextdns

# Stop container
docker stop nextdns

# Remove container
docker rm nextdns

# Pull latest image
docker pull nextdns/nextdns:latest
```

## Troubleshooting

### Port Already in Use

If port 53 is already in use:

```bash
# Check what's using port 53
sudo lsof -i :53
# or
sudo netstat -tulpn | grep :53

# Common conflicts: systemd-resolved, dnsmasq
# Disable systemd-resolved if needed
sudo systemctl disable systemd-resolved
sudo systemctl stop systemd-resolved
```

### Container Not Starting

Check logs for errors:

```bash
docker logs nextdns
```

## Reference

- [NextDNS CLI - Docker](https://github.com/nextdns/nextdns/wiki/Docker)
