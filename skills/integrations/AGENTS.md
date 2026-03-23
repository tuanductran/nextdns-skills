# NextDNS Integrations

**Version 1.0.0**  
NextDNS Skills  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring NextDNS third-party platform integrations. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Best practices and guidelines for NextDNS third-party platform integrations, ordered by impact.

---

## Table of Contents

1. [Capability rules](#1-capability-rules) — **MEDIUM**
   - 1.1 [AsusWRT-Merlin Integration](#11-asuswrt-merlin-integration)
   - 1.2 [Browser Native DoH Configuration](#12-browser-native-doh-configuration)
   - 1.3 [DNSMasq Integration](#13-dnsmasq-integration)
   - 1.4 [Docker Compose Deployment](#14-docker-compose-deployment)
   - 1.5 [EdgeRouter and Firewalla Integration](#15-edgerouter-and-firewalla-integration)
   - 1.6 [GL.iNet Router Integration](#16-glinet-router-integration)
   - 1.7 [Home Assistant Integration](#17-home-assistant-integration)
   - 1.8 [Kubernetes Integration](#18-kubernetes-integration)
   - 1.9 [MDM Deployment (Jamf, Intune, Apple Configurator)](#19-mdm-deployment-jamf-intune-apple-configurator)
   - 1.10 [MikroTik DoH Setup](#110-mikrotik-doh-setup)
   - 1.11 [Mobile Native Encrypted DNS Configuration](#111-mobile-native-encrypted-dns-configuration)
   - 1.12 [OpenWrt Integration](#112-openwrt-integration)
   - 1.13 [pfSense and OPNsense Integration](#113-pfsense-and-opnsense-integration)
   - 1.14 [Public DNS and AdGuard Home Integration](#114-public-dns-and-adguard-home-integration)
   - 1.15 [Raspberry Pi Integration](#115-raspberry-pi-integration)
   - 1.16 [Synology Integration (DSM and SRM)](#116-synology-integration-dsm-and-srm)
   - 1.17 [Tailscale Integration](#117-tailscale-integration)
   - 1.18 [Ubiquiti (UniFi) Integration](#118-ubiquiti-unifi-integration)
2. [Efficiency rules](#2-efficiency-rules) — **HIGH**
   - 2.1 [Backup and Failover Configuration](#21-backup-and-failover-configuration)
   - 2.2 [Pi-hole to NextDNS Migration](#22-pi-hole-to-nextdns-migration)

---

## 1. Capability rules

**Impact: MEDIUM**

### 1.1 AsusWRT-Merlin Integration

**Impact: MEDIUM (Deploy NextDNS on Asus routers with Merlin firmware)**

Installing NextDNS on Asus routers running Merlin firmware provides network-wide encrypted DNS with

Installing NextDNS on Asus routers running Merlin firmware provides network-wide encrypted DNS with

client identification.

1. **Enable SSH Access**:

   - Log in to your router's web interface.

   - Navigate to **Administration** -> **System**.

   - Set **Enable SSH** to `LAN only`.

   - Click **Apply**.

2. **Connect via SSH**:

   ```bash

   ssh admin@192.168.1.1

   ```

3. **Run Installer**:

   ```bash

   sh -c "$(curl -sL https://nextdns.io/install)"

   ```

4. **Follow Prompts**:

   - Enter your **Profile ID**.

   - Enable **Setup Router** when asked.

   - Enable **Report Client Info** to see device names in logs.

For the best experience on AsusWRT-Merlin:

- **JFFS Scripts**: Ensure JFFS custom scripts are enabled in **Administration** -> **System**. The

  installer handles this, but it must stay enabled.

- **DNSSEC**: Disable the built-in DNSSEC in the Asus GUI if you enable it in NextDNS to avoid

  redundant processing.

If the installation fails, run the installer in debug mode:

- [NextDNS CLI Wiki - AsusWRT-Merlin](https://github.com/nextdns/nextdns/wiki/AsusWRT-Merlin)

- [SNBForums NextDNS Thread](https://www.snbforums.com/threads/nextdns-installer.61002/)

### 1.2 Browser Native DoH Configuration

**Impact: MEDIUM ()**

Enables NextDNS protection in restricted environments without system-wide changes or administrative

Enables NextDNS protection in restricted environments without system-wide changes or administrative

privileges

Modern browsers include built-in support for DNS-over-HTTPS (DoH), allowing encrypted DNS queries

without installing additional software or requiring system administrator rights. This is

particularly useful in corporate, educational, or restrictive network environments.

- **Corporate Networks**: When IT policies block software installation or system-wide DNS changes

- **Shared Computers**: Public libraries, internet cafes, or shared workstations

- **Restrictive Firewalls**: Networks that block standard DNS (port 53) but allow HTTPS (port 443)

- **Quick Setup**: No system configuration or administrative access required

- **Testing**: Verify NextDNS configuration before deploying system-wide

- **User-Specific Protection**: Different users on the same computer can have different DNS settings

- **Browser-only**: Only protects DNS queries from the browser itself, not other applications

- **Per-browser**: Must be configured separately in each browser

- **Profile-dependent**: Settings may not sync across devices unless using browser sync

Google Chrome and Microsoft Edge share the same Chromium-based architecture and use identical

configuration steps.

1. Open browser settings:

   - **Chrome**: `chrome://settings/security`

   - **Edge**: `edge://settings/privacy`

2. Navigate to:

   - **Privacy and security** → **Security**

3. Scroll to **Advanced** section

4. Locate **Use secure DNS** setting

5. Enable the toggle switch

6. Select **With: Custom**

7. Enter your NextDNS DoH URL: `https://dns.nextdns.io/<config_id>` Replace `<config_id>` with your

   actual NextDNS Configuration ID

8. Click **Save** or close settings (changes apply automatically)

1. Log in to [https://my.nextdns.io](https://my.nextdns.io)

2. Select your configuration

3. Your Configuration ID is displayed in the URL: `https://my.nextdns.io/<config_id>/setup`

4. The ID is a 6-character alphanumeric string (for example, `abc123`)

Firefox has its own implementation of DNS-over-HTTPS with slightly different terminology.

1. Open browser settings:

   - Navigate to `about:preferences#privacy`

   - Or go to **Settings** → **Privacy and Security**

2. Scroll to **DNS over HTTPS** section

3. Select **Max Protection** (recommended)

   - Alternative: **Increased Protection** (falls back to regular DNS if DoH fails)

4. In the dropdown, select **Custom**

5. Enter your NextDNS DoH URL: `https://dns.nextdns.io/<config_id>` Replace `<config_id>` with your

   actual NextDNS Configuration ID

6. Changes apply automatically

| Mode                     | Behavior                            | Use Case                                |

| ------------------------ | ----------------------------------- | --------------------------------------- |

| **Max Protection**       | Always use DoH, fail if unavailable | Best security, recommended              |

| **Increased Protection** | Use DoH, fallback to regular DNS    | Compatibility with problematic networks |

| **Off**                  | Disable DoH                         | Troubleshooting only                    |

After configuration, verify that DoH is working correctly:

1. Visit [https://test.nextdns.io](https://test.nextdns.io)

2. You should see:

   - ✓ **Protocol**: HTTPS (DoH)

   - ✓ **Status**: Connected

   - ✓ **Configuration ID**: Your config ID

1. Open DevTools (F12)

2. Navigate to **Network** tab

3. Filter by **Type: DNS**

4. Reload a webpage

5. Verify DNS queries are going to `dns.nextdns.io`

1. Type `about:networking#dns` in the address bar

2. Check the **TRR** (Trusted Recursive Resolver) status

3. Should show as "TRR only" for Max Protection

1. Log in to [https://my.nextdns.io](https://my.nextdns.io)

2. Navigate to **Logs** tab

3. Browse the web and verify queries appear in real-time

- **Use Max Protection** (Firefox) or enable DoH unconditionally (Chrome/Edge) for maximum security

- **Verify configuration** using test.nextdns.io after setup

- **Monitor Logs** in NextDNS dashboard to ensure queries are being received

- **Document Settings** for easier reconfiguration on new devices

- **Consider System-Wide Setup** for comprehensive protection beyond just browser traffic

Browser DoH only protects DNS queries originating from that browser. Other applications on your

system (email clients, games, system updates, and more) will use the system's default DNS settings.

DoH adds minimal latency (typically 5-15ms) compared to unencrypted DNS. This is generally

imperceptible for normal browsing.

Some corporate or school networks may:

- Block DoH traffic entirely

- Require using specific DNS servers for policy enforcement

- Monitor DNS queries for security purposes

Always respect organizational policies when configuring DoH in managed environments.

- [NextDNS Help Center](https://help.nextdns.io)

**Possible causes:**

1. **Incorrect Configuration ID**: Double-check your ID from the NextDNS dashboard

2. **Typo in URL**: Ensure the URL is `https://dns.nextdns.io/<config_id>` (no trailing slash)

3. **Network Blocking**: Some networks may block DoH traffic (port 443 to dns.nextdns.io)

4. **Browser Sync Conflict**: Disable browser sync temporarily to rule out conflicts

Temporarily use an invalid configuration ID to verify the browser is actually using DoH:

`https://dns.nextdns.io/invalid`

If DNS queries fail after setting this invalid ID, your browser is correctly using DoH. Restore your

real configuration ID to resume normal operation.

If you see a warning that secure DNS is unavailable:

1. Check if your network blocks port 443 to dns.nextdns.io

2. Try temporarily disabling browser extensions that modify network traffic

3. Clear browser cache and DNS cache

4. Restart the browser

If Firefox falls back to system DNS (when using "Increased Protection" mode):

1. Switch to "Max Protection" mode to prevent fallback

2. Verify the custom URL is entered correctly

3. Check browser console (F12) for DNS-related errors

### 1.3 DNSMasq Integration

**Impact: MEDIUM ()**

Enables DNSMasq and NextDNS to run together while preserving client reporting and conditional

Enables DNSMasq and NextDNS to run together while preserving client reporting and conditional

configuration capabilities

DNSMasq is a lightweight DNS forwarder commonly bundled with router firmwares. It is possible to run

DNSMasq and NextDNS together on the same system while maintaining full NextDNS functionality,

including client reporting and conditional configuration features.

This integration allows DNSMasq to continue handling local DNS resolution and DHCP services while

forwarding external DNS queries to NextDNS for filtering and protection.

NextDNS must be configured to listen on a different port to avoid conflicts with DNSMasq, which

typically uses port 53.

This configuration ensures NextDNS binds to port 5555 instead of the default port 53, allowing

DNSMasq to continue operating on port 53.

Add the following parameters to your DNSMasq configuration to forward DNS queries to NextDNS while

preserving client information:

These parameters ensure that:

- `--server=127.0.0.1#5555`: All DNS queries are forwarded to NextDNS running on port 5555

- `--add-mac`: Client MAC addresses are included in DNS queries, enabling device identification

- `--add-subnet=32,128`: Client subnet information is added for IPv4 (/32) and IPv6 (/128),

  supporting conditional configuration

On router firmwares that ship with DNSMasq pre-installed, the above configuration can often be

handled automatically.

When running NextDNS installation on such routers, use the `-setup-router` parameter:

The `-setup-router` flag automatically detects DNSMasq and configures both services to work together

without manual intervention. This is the recommended approach for router environments.

- **Use alternative port**: Always configure NextDNS to use a non-standard port (for example, 5555) when

  running alongside DNSMasq

- **Preserve client information**: Ensure `--add-mac` and `--add-subnet` parameters are set to

  maintain client reporting features

- **Prefer automatic setup**: On router firmwares, use `-setup-router` parameter for automatic

  configuration

- **Verify forwarding**: Test DNS resolution after configuration to ensure queries are properly

  forwarded to NextDNS

- **Check logs**: Monitor both DNSMasq and NextDNS logs to verify proper operation and client

  identification

If you encounter port binding errors, verify that:

- DNSMasq is running on port 53

- NextDNS is configured to use an alternative port (for example, 5555)

- No other services are using the chosen alternative port

If client devices are not appearing correctly in NextDNS analytics:

- Verify `--add-mac` parameter is enabled in DNSMasq configuration

- Check that `--add-subnet` parameter is properly configured

- Ensure DNS queries are being forwarded to NextDNS (check DNSMasq logs)

If `-setup-router` fails or doesn't configure properly:

- Fall back to manual configuration using Steps 1 and 2

- Check router firmware documentation for DNSMasq configuration location

- Ensure you have appropriate permissions to modify DNSMasq configuration

- [NextDNS CLI - DNSMasq](https://github.com/nextdns/nextdns/wiki/DNSMasq)

### 1.4 Docker Compose Deployment

**Impact: MEDIUM (Without network_mode: host on Linux, all DNS clients appear as a single Docker NAT IP, breaking per-device identification and conditional profiles)**

Deploy NextDNS CLI as a Docker Compose service with persistent configuration and host networking

Deploy NextDNS CLI as a Docker Compose service with persistent configuration and host networking

Docker Compose provides a declarative way to run NextDNS CLI in production environments alongside

other containerised services. Using `network_mode: host` on Linux is critical for correct operation

— it allows the container to see real client IP addresses and enables per-device identification and

conditional profiles.

- **Use `network_mode: host` on Linux**: This is the only way to obtain real client IPs and enable

  per-device identification.

- **Mount `/etc/nextdns` as a volume**: This preserves your configuration file across container

  recreations and image updates.

- **Use `restart: unless-stopped`**: Ensures the container starts on boot and after crashes, but

  respects manual `docker stop` commands.

- **Pin image version for production**: Replace `latest` with a specific version tag (for example,

  `nextdns/nextdns:1.42.0`) to prevent unexpected breakage from image updates.

- [NextDNS CLI Docker Hub](https://hub.docker.com/r/nextdns/nextdns)

- [NextDNS CLI Wiki — Docker](https://github.com/nextdns/nextdns/wiki/Docker)

- [Docker Compose Documentation](https://docs.docker.com/compose/)

**Correct: Minimal Compose file (Linux)**

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

**Correct:**

```bash
# ✅ Start the service
docker compose up -d

# ✅ View logs
docker compose logs -f nextdns

# ✅ Check status
docker compose exec nextdns nextdns status
```

**Correct: Full production Compose file with environment variable**

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

**Correct:**

```bash
# ✅ .env file (gitignored)
NEXTDNS_PROFILE_ID=abc123
```

**Correct: Port-mapped Compose file (macOS/Windows Docker Desktop)**

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

**Correct: Multi-profile setup (different subnets)**

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

**Correct: Management commands**

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

**Incorrect:**

```yaml
# ❌ Using bridge networking instead of host on Linux
services:
  nextdns:
    image: nextdns/nextdns:latest
    ports:
      - "53:53/udp"   # ❌ On Linux, use network_mode: host instead
```

**Incorrect:**

```yaml
# ❌ No restart policy — service stops permanently on crash or reboot
services:
  nextdns:
    image: nextdns/nextdns:latest
    # ❌ Missing: restart: unless-stopped
```

### 1.5 EdgeRouter and Firewalla Integration

**Impact: MEDIUM (Deploy NextDNS on professional gateways like EdgeOS and Firewalla)**

Strategic deployment of NextDNS on Ubiquiti EdgeRouter (EdgeOS) and Firewalla hardware.

Strategic deployment of NextDNS on Ubiquiti EdgeRouter (EdgeOS) and Firewalla hardware.

- Go to **System** tab (bottom left).

- Check **Enable** in the **SSH Server** section.

- Click **Save**.

Firewalla runs a customized Ubuntu-based OS. You can install the CLI directly on the box.

- In the Firewalla app: **Settings** -> **Advanced** -> **Configurations** -> **SSH Server**.

- Note the password.

✅ **Client Reporting**: Always enable `Discovery DNS` and `MDNS` in the NextDNS CLI configuration

to ensure Firewalla/EdgeRouter can map internal IP addresses to hostnames in your NextDNS dashboard.

❌ **Port Conflicts**: Ensure no other service is listening on port 53. On EdgeRouter, the NextDNS

installer typically handles `dnsmasq` integration automatically.

- [NextDNS CLI Wiki - EdgeOS](https://github.com/nextdns/nextdns/wiki/EdgeOS)

- [NextDNS CLI Wiki - Firewalla](https://github.com/nextdns/nextdns/wiki/Firewalla)

### 1.6 GL.iNet Router Integration

**Impact: HIGH (GL.iNet routers ship with AdGuard Home enabled — installing NextDNS CLI without disabling it causes port conflicts and unreliable DNS for all network clients)**

Install NextDNS CLI on GL.iNet routers by first disabling the pre-installed AdGuard Home

Install NextDNS CLI on GL.iNet routers by first disabling the pre-installed AdGuard Home

GL.iNet produces a range of portable and home routers (Beryl AX, Slate AX, Flint 2, Mango, and

more) that run a customised OpenWrt firmware with a polished web UI. They are popular as travel

routers and home network devices.

**The critical issue**: GL.iNet firmware bundles AdGuard Home as a built-in DNS filter and enables

it by default. AdGuard Home and NextDNS CLI both need port 53 — they cannot run simultaneously

without explicit port coordination.

1. Connect to the router's Wi-Fi or Ethernet

2. Open `http://192.168.8.1` in a browser

3. Log in with your admin credentials

1. Navigate to **Applications → AdGuard Home** in the left sidebar

2. Toggle the switch to **Disabled**

3. Click **Apply**

If the Applications menu is not visible, update your firmware first via **System → Upgrade**.

1. Navigate to **System → Advanced → SSH** (or **System → SSH** on older firmware)

2. Enable **SSH Access** on port 22

3. Optionally restrict to LAN only for security

During installation:

- Set your Profile ID

- Choose **Yes** for router setup (integrates with dnsmasq)

- Choose **Yes** for client info reporting (enables device names in dashboard)

GL.iNet firmware updates often re-enable AdGuard Home and may remove the NextDNS CLI installation.

After any firmware update:

- [NextDNS CLI Wiki — OpenWrt](https://github.com/nextdns/nextdns/wiki/OpenWrt)

- [GL.iNet Documentation](https://docs.gl-inet.com/)

- [GL.iNet Forum — NextDNS discussion](https://forum.gl-inet.com/)

### 1.7 Home Assistant Integration

**Impact: MEDIUM ()**

Enables automated DNS control and monitoring through Home Assistant smart home platform

Enables automated DNS control and monitoring through Home Assistant smart home platform

Home Assistant is a popular open-source home automation platform that can integrate with NextDNS to

provide smart DNS control and monitoring. This integration allows you to automate DNS settings based

on time, location, or other triggers, and provides real-time visibility into network activity.

Before setting up the integration, you need:

- **API Key**: Generate from NextDNS Account Settings

- **Profile ID**: Located in your NextDNS profile settings (format: `abc123`)

1. Navigate to **Settings → Devices and Services** in Home Assistant

2. Click **Add Integration** and search for "NextDNS"

3. Enter your NextDNS API Key and Profile ID

4. The integration will automatically discover and configure available entities

The integration provides multiple entity types for monitoring and control:

- **Connection Status**: Indicates whether NextDNS is actively connected and responding

- **Clear Logs**: Instantly clear all DNS query logs for the profile

- **Blocked Queries**: Total count of blocked DNS queries

- **Query Ratios**: Percentage breakdown of blocked vs. allowed queries

- **Protocol Statistics**: Distribution of DNS queries by protocol (DoH, DoT, UDP, TCP)

- **Encryption Status**: Count of encrypted vs. unencrypted queries

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

This automation demonstrates blocking social media for children during evening hours:

Complement the evening block with a morning unblock:

Automatically clear logs when a high number of threats are detected:

- [NextDNS API Documentation](https://nextdns.github.io/api/)

### 1.8 Kubernetes Integration

**Impact: HIGH (Without proper DNS policy configuration, pods bypass NextDNS filtering entirely)**

Deploy NextDNS CLI in a Kubernetes cluster as a node-level DNS proxy

Deploy NextDNS CLI in a Kubernetes cluster as a node-level DNS proxy

Running NextDNS in Kubernetes requires deploying the CLI as a `DaemonSet` so every node gets a local

DNS proxy. Pods then route DNS queries through the node-local NextDNS instance either via

`dnsPolicy: None` or by configuring CoreDNS as an upstream forwarder.

Two approaches are covered:

1. **DaemonSet + dnsPolicy per Pod** — pods explicitly use the node IP as their nameserver.

2. **CoreDNS Forwarder** — CoreDNS forwards all or specific queries to the node-local NextDNS

   daemon, requiring no pod-level changes.

- **Use `127.0.0.1:5300`** instead of `:53` to avoid conflicts with existing node DNS services.

- **Always add `NET_ADMIN` capability**: NextDNS CLI needs it to configure system-level DNS.

- **Use `hostNetwork: true`**: Ensures the DaemonSet container shares the node network namespace.

- **Separate profiles per namespace**: Use `dnsPolicy: None` on pods that need a different NextDNS

  profile from the cluster default.

- **Monitor with `nextdns log`**: Exec into a DaemonSet pod to inspect DNS query logs.

**Symptoms**: DNS queries time out or return SERVFAIL after applying the CoreDNS forwarder.

**Solution**: Verify the DaemonSet pods are running and NextDNS is listening on the configured port:

**Symptoms**: Changes to the Corefile are not taking effect.

**Solution**: Force a CoreDNS rollout restart after ConfigMap changes:

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)

- [Kubernetes DNS Configuration](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)

- [CoreDNS Forwarder Plugin](https://coredns.io/plugins/forward/)

**Correct: Daemonset manifest**

```yaml
# ✅ nextdns-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nextdns
  namespace: kube-system
  labels:
    app: nextdns
spec:
  selector:
    matchLabels:
      app: nextdns
  template:
    metadata:
      labels:
        app: nextdns
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      tolerations:
        - effect: NoSchedule
          operator: Exists
      containers:
        - name: nextdns
          image: nextdns/nextdns:latest
          args:
            - run
            - -profile
            - abc123
            - -listen
            - 127.0.0.1:5300
            - -report-client-info
          securityContext:
            capabilities:
              add: [NET_ADMIN]
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 100m
              memory: 64Mi
```

Apply:

**Correct:**

```bash
kubectl apply -f nextdns-daemonset.yaml
```

**Correct: Pod-level DNS configuration**

```yaml
# ✅ Pod spec with explicit NextDNS nameserver
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  dnsPolicy: None
  dnsConfig:
    nameservers:
      - 127.0.0.1 # node-local NextDNS proxy
    searches:
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
    options:
      - name: ndots
        value: '5'
  containers:
    - name: my-app
      image: my-app:latest
```

**Correct: CoreDNS forwarder (cluster-wide)**

```bash
# ✅ Edit CoreDNS ConfigMap
kubectl edit configmap coredns -n kube-system
```

Update the `Corefile`:

**Correct:**

```text
# ✅ Forward all non-cluster traffic to node-local NextDNS
.:53 {
    errors
    health {
       lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
    }
    prometheus :9153
    forward . 127.0.0.1:5300 {
       max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

Restart CoreDNS to apply:

**Correct:**

```bash
kubectl rollout restart deployment coredns -n kube-system
```

**Incorrect:**

```yaml
# ❌ hostPort without hostNetwork — DNS on port 53 requires hostNetwork: true
spec:
  containers:
    - name: nextdns
      ports:
        - containerPort: 53
          hostPort: 53 # ❌ Unreliable without hostNetwork: true
```

**Incorrect:**

```yaml
# ❌ Running as root without NET_ADMIN capability — service will fail to configure DNS
securityContext:
  runAsUser: 0 # ❌ Must also add NET_ADMIN capability
```

### 1.9 MDM Deployment (Jamf, Intune, Apple Configurator)

**Impact: HIGH (Manual per-device DNS configuration is error-prone at scale — MDM deployment ensures 100% fleet coverage and prevents employees from disabling DNS filtering)**

Deploy NextDNS DNS configuration to an entire device fleet via MDM without manual per-device setup

Deploy NextDNS DNS configuration to an entire device fleet via MDM without manual per-device setup

For organisations managing tens or hundreds of devices, MDM (Mobile Device Management) is the only

scalable way to enforce DNS filtering. Instead of configuring each device manually, you push a DNS

profile to the entire fleet — or to specific groups — from a central management console.

This rule covers:

- Apple devices (iOS, iPadOS, macOS) via Jamf Pro, Jamf School, Apple Configurator 2, or Microsoft

  Intune

- Windows devices via Microsoft Intune (encrypted DNS policy)

Apple's DNS configuration uses `.mobileconfig` profiles. NextDNS generates these profiles for you.

1. Log in to `https://my.nextdns.io/{profile-id}/setup`

2. Select **Apple** from the platform list

3. Click **Download Configuration Profile** — this generates a signed `.mobileconfig` file

Or generate via the API:

1. In Jamf Pro, navigate to **Computers / Devices → Configuration Profiles**

2. Click **+ New**

3. Under **General**, set the profile name (for example, "NextDNS DNS Filter")

4. Click **+ Add** → search for **DNS Settings** (macOS) or navigate to **Custom Settings** (iOS)

5. For iOS/iPadOS: use **Custom Payload** → upload the NextDNS `.mobileconfig` payload content

6. Set **Distribution Method** to **Automatic** for automatic push to targeted devices

7. Set the **Scope** to the devices or groups that should receive the profile

8. Click **Save**

For macOS via Jamf's built-in DNS settings:

1. Connect device(s) to Mac running Apple Configurator 2

2. Select the device(s) in the organiser

3. Choose **Actions → Add → Profiles**

4. Select the downloaded `nextdns.mobileconfig` file

5. Click **Add** — the profile is pushed silently without user confirmation on supervised devices

1. Navigate to **Devices → Configuration Profiles → Create Profile**

2. Platform: **iOS/iPadOS** or **macOS**

3. Profile type: **Templates → Custom**

4. Upload the NextDNS `.mobileconfig` file

5. Assign to the target group

6. Click **Review + Create**

For supervised devices (corporate-owned), mark the profile as non-removable:

In the `.mobileconfig` file, set:

This prevents users from removing the DNS configuration from **Settings → VPN and Device

Management**.

Windows 11 supports encrypted DNS (DoH) via Group Policy or Intune Settings Catalog.

1. Navigate to **Devices → Configuration Profiles → Create Profile**

2. Platform: **Windows 10 and later**

3. Profile type: **Settings Catalog**

4. Click **+ Add Settings** and search for "DNS over HTTPS"

5. Configure:

1. Assign to the Windows device group

1. Click **Review + Create**

- **Use supervised/enrolled devices** for the strongest enforcement — unsupervised devices can

  remove profiles.

- **Set `PayloadRemovalDisallowed: true`** for corporate devices where DNS filtering is mandatory.

- **Deploy to groups, not all devices**: Start with a pilot group (for example, IT department) before

  rolling out to the entire fleet.

- **Include the Root CA in the same deployment**: If you plan to enable the Block Page, push the

  NextDNS Root CA as a separate configuration profile in the same Jamf/Intune deployment.

- **Test with one device first**: Validate that the profile does not break any business-critical

  applications before fleet-wide deployment.

**Cause**: The device is not supervised, or there is already a DNS profile installed from another

MDM.

**Solution**: Remove the existing DNS profile first, or ensure the device is enrolled in your MDM

as supervised.

**Symptoms**: `nslookup` still uses plain DNS after applying the Intune policy.

**Solution**: Force a policy sync:

- [Apple — DNS Settings payload](https://developer.apple.com/documentation/devicemanagement/dnssettings)

- [Jamf Pro Documentation](https://docs.jamf.com)

- [Microsoft Intune — Custom profiles](https://learn.microsoft.com/en-us/intune/intune-service/configuration/custom-settings-configure)

- [NextDNS Dashboard — Setup](https://my.nextdns.io)

### 1.10 MikroTik DoH Setup

**Impact: HIGH (Ensures secure DNS on MikroTik routers via DNS-over-HTTPS (DoH))**

Comprehensive guide for configuring NextDNS with DNS-over-HTTPS on MikroTik RouterOS devices.

Comprehensive guide for configuring NextDNS with DNS-over-HTTPS on MikroTik RouterOS devices.

MikroTik RouterOS (v6.47+) supports DNS-over-HTTPS (DoH). Configuring NextDNS via DoH provides

encrypted DNS for the entire network without relying on the command-line installer.

1. **System Time**: MikroTik MUST have the correct system time for HTTPS verification. Check

   `/system clock print`.

2. **Certificate Name**: Ensure the certificate was imported correctly and is visible in

   `/certificate print`.

- Ensure `max-udp-packet-size` is set to `4096` in `/ip dns set`.

- Use RouterOS v7.x for significantly better DoH performance and stability compared to v6.x.

- [MikroTik DNS Documentation](https://help.mikrotik.com/docs/display/ROS/DNS)

- [NextDNS Setup Guide](https://my.nextdns.io/setup)

**Correct: 1. Import security certificate**

```bash
# ✅ Import DigiCert Root CA (Required for dns.nextdns.io)
/tool fetch url=https://cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
/certificate import file-name=DigiCertGlobalRootCA.crt.pem name=DigiCertGlobalRootCA
```

**Correct: 2. Configure static DNS**

```bash
# ✅ Set static entries for the DoH hostname
/ip dns static
add address=45.90.28.0 name=dns.nextdns.io
add address=45.90.30.0 name=dns.nextdns.io
```

**Correct: 3. Enable DoH**

```bash
# ✅ Configure DoH Server (Replace abc123 with your Profile ID)
/ip dns set use-doh-server=https://dns.nextdns.io/abc123 verify-doh-cert=yes
/ip dns set allow-remote-requests=yes
```

**Incorrect:**

```bash
# ❌ Incorrect: Standard servers still present
/ip dns set servers=8.8.8.8,1.1.1.1
```

### 1.11 Mobile Native Encrypted DNS Configuration

**Impact: HIGH ()**

Enables NextDNS protection on mobile devices using built-in OS features without battery-draining

Enables NextDNS protection on mobile devices using built-in OS features without battery-draining

background apps

Modern mobile operating systems include native support for encrypted DNS protocols, eliminating the

need for third-party apps. This provides a lightweight, battery-efficient method for NextDNS

protection on smartphones and tablets.

- **No Background Process**: Zero battery impact from background services

- **OS-Level Integration**: More reliable than third-party apps

- **System-Wide Protection**: Covers all apps and system services

- **Automatic Reconnection**: No manual intervention needed after device restart

- **No App Permissions**: No privacy concerns from third-party applications

- **Always Active**: Cannot be accidentally closed or force-stopped

- You need advanced features like:

  - Custom DNS server selection per network

  - Analytics and diagnostics on the device

  - Detailed connection logs

  - Manual profile switching

Android 9 (Pie) and later include **Private DNS** support using DNS-over-TLS (DoT).

1. Open **Settings** on your Android device

2. Navigate to:

   - **Network and internet** (or **Connections** on Samsung devices)

3. Select **Private DNS** (or **Advanced** → **Private DNS**)

4. Choose **Private DNS provider hostname**

5. Enter your NextDNS hostname: `<config_id>.dns.nextdns.io` Replace `<config_id>` with your actual

   NextDNS Configuration ID

6. Tap **Save**

1. Log in to [https://my.nextdns.io](https://my.nextdns.io)

2. Select your configuration

3. Your Configuration ID is the 6-character alphanumeric code in the URL

iOS 14 and later support **Encrypted DNS Profiles** using DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT)

via signed configuration profiles.

1. On your iOS device, visit [https://my.nextdns.io](https://my.nextdns.io)

2. Navigate to your configuration → **Setup** tab

3. Select **iOS** from the platform list

4. Tap **Download Configuration Profile**

5. When prompted, tap **Allow** to download the profile

6. Open **Settings** app (a notification will appear)

7. Tap **Profile Downloaded** near the top of settings

8. Review the profile details:

   - **Name**: NextDNS (your config name)

   - **Type**: DNS Settings

   - **Signed by**: NextDNS, Inc.

9. Tap **Install** in the top right

10. Enter your device passcode when prompted

11. Tap **Install** again to confirm

12. Tap **Done** when installation completes

If you have a `.mobileconfig` file from NextDNS:

1. AirDrop or email the file to your iOS device

2. Tap the file to open

3. Follow steps 6-11 above

- [NextDNS Help Center](https://help.nextdns.io)

**Stock Android:**

**Samsung: One UI**

1. Visit [https://test.nextdns.io](https://test.nextdns.io) in your browser

2. You should see:

   - ✓ **Protocol**: TLS (DoT)

   - ✓ **Status**: Connected

   - ✓ **Configuration ID**: Your config ID

**Symptoms:** Websites not loading, "Couldn't connect to server" errors

**Solutions:**

1. **Check hostname format:**

   - Correct: `abc123.dns.nextdns.io`

   - Incorrect: `https://abc123.dns.nextdns.io` (no protocol)

   - Incorrect: `abc123.dns1.nextdns.io` (wrong subdomain)

2. **Test with automatic setting:**

   - Temporarily select **Automatic**

   - If internet works, the issue is with the hostname

   - If it doesn't work, the issue is network-related

3. **Network restrictions:**

   - Some networks (corporate, public Wi-Fi) may block DNS-over-TLS (port 853)

   - Try switching between Wi-Fi and mobile data

   - Contact network administrator if on corporate network

4. **Clear DNS cache:** `Settings → Apps → Show system apps → DNS Client → Storage → Clear cache`

### 1.12 OpenWrt Integration

**Impact: HIGH ()**

Essential for deploying NextDNS on OpenWrt routers with proper installation methods and

Essential for deploying NextDNS on OpenWrt routers with proper installation methods and

troubleshooting guidance

OpenWrt is a popular open-source firmware for routers that provides extensive customization and

control. This rule provides comprehensive guidance for installing, upgrading, and troubleshooting

NextDNS on OpenWrt devices.

OpenWrt supports two installation methods depending on your version and preferences.

This method works on all OpenWrt versions and provides the most reliable installation experience.

| Step | Action                                                                              |

| ---- | ----------------------------------------------------------------------------------- |

| 1    | Enable SSH in the Web GUI: Navigate to **System → Administration**                  |

| 2    | Connect to your router via SSH                                                      |

| 3    | Install curl: `opkg update && opkg install curl`                                    |

| 4    | Run the NextDNS installer: `sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'` |

| 5    | Follow the on-screen instructions to complete setup                                 |

This method is only available for OpenWrt version 19.07.01-rc2 and later. It provides a graphical

interface for configuration.

| Step | Action                                                   |

| ---- | -------------------------------------------------------- |

| 1    | Navigate to **System → Software** in the Web GUI         |

| 2    | Click **Update lists** to refresh the package repository |

| 3    | Search for and install the `luci-app-nextdns` package    |

| 4    | Configure NextDNS at **Services → NextDNS**              |

To upgrade an existing NextDNS installation on OpenWrt:

1. Re-run the installer script:

   ```bash

   sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'

   ```

2. The installer will detect the existing installation and offer an upgrade option if a new version

   is available.

If the installation fails or encounters errors, run the installer in debug mode to generate detailed

logs:

This will output verbose information that can help identify the root cause of installation issues.

- **curl not found**: Ensure curl is installed with `opkg update && opkg install curl`

- **Permission denied**: Make sure you're running commands as root or with sufficient privileges

- **Port 53 conflict**: Check if another DNS service (like dnsmasq) is already using port 53

- **Package not available**: For Method B, verify your OpenWrt version is 19.07.01-rc2 or later

- [NextDNS CLI - OpenWrt](https://github.com/nextdns/nextdns/wiki/OpenWrt)

### 1.13 pfSense and OPNsense Integration

**Impact: HIGH ()**

Critical for deploying NextDNS on enterprise-grade firewalls with proper encrypted DNS configuration

Critical for deploying NextDNS on enterprise-grade firewalls with proper encrypted DNS configuration

and awareness of platform-specific limitations

pfSense and OPNsense are FreeBSD-based firewall/router platforms widely used in enterprise and home

environments. This rule provides platform-specific guidance for integrating NextDNS with their

native DNS resolvers.

pfSense uses Unbound as its DNS resolver. There are two methods to integrate NextDNS.

Configure Unbound to forward all DNS queries to NextDNS over TLS.

1. Navigate to **Services → DNS Resolver → General Settings**

2. Scroll to **Custom Options** section

3. Add the following configuration:

1. Replace `<config_id>` with your actual NextDNS Configuration ID

2. Click **Save** and **Apply Changes**

**pfSense uses Unbound as a recursive resolver. Unbound chases CNAMEs by design, which can result in

unexpected behavior when used in conjunction with a blocking DNS resolver like NextDNS.**

OPNsense provides a dedicated user interface for DNS-over-TLS configuration, making it more

straightforward than pfSense.

OPNsense has a built-in UI for configuring DNS-over-TLS, which is the preferred method.

1. Navigate to **Services → Unbound DNS → DNS over TLS**

2. Click **Add** button

3. Configure the following settings:

| Setting         | Value                             |

| --------------- | --------------------------------- |

| **Server IP**   | `45.90.28.0` or `45.90.30.0`      |

| **Server Port** | `853`                             |

| **Verify CN**   | `<your_config_id>.dns.nextdns.io` |

1. Replace `<your_config_id>` with your actual NextDNS Configuration ID

2. Click **Save** and **Apply**

| Feature                  | pfSense                          | OPNsense                  |

| ------------------------ | -------------------------------- | ------------------------- |

| **DoT UI**               | ❌ Manual configuration required | ✅ Dedicated UI available |

| **Configuration Method** | Custom Options (YAML)            | Web UI form               |

| **CNAME Chasing**        | ⚠️ Yes (known issue)             | ⚠️ Yes (Unbound behavior) |

| **CLI Support**          | ✅ Yes (FreeBSD)                 | ✅ Yes (FreeBSD)          |

| **Ease of Setup**        | Moderate                         | Easy                      |

After configuration, verify that NextDNS is working correctly:

1. Check DNS resolution: `nslookup example.com 127.0.0.1`

2. Verify NextDNS is being used:

   - Visit [https://test.nextdns.io](https://test.nextdns.io)

   - You should see your Configuration ID and "✓ This device is using NextDNS"

3. Check the NextDNS logs:

   - Navigate to your NextDNS dashboard

   - Verify queries from your firewall are appearing in the logs

- [NextDNS CLI - pfSense](https://github.com/nextdns/nextdns/wiki/pfSense)

**What this means:**

- If NextDNS blocks a domain that uses a CNAME record, Unbound may still resolve the CNAME target

- This can bypass some of your blocking rules

- This is a known limitation of Unbound (see Unbound issue #132)

**Mitigation:**

- Be aware of this behavior when troubleshooting unexpected access to blocked domains

- Consider using Method 2 (CLI) if this limitation affects your use case

- Test your blocking rules after configuration to verify expected behavior

Install the NextDNS CLI directly on pfSense (FreeBSD-compatible).

**Advantages:**

- Avoids CNAME chasing issues

- Provides device-level analytics

- Better integration with NextDNS features

**Why Verify CN matters:**

- Ensures the connection is encrypted and authenticated

- Links the traffic to your specific NextDNS profile

- Prevents man-in-the-middle attacks

Repeat the steps above with the secondary server for redundancy:

| Setting         | Value                                         |

| --------------- | --------------------------------------------- |

| **Server IP**   | `45.90.30.0` (if you used `45.90.28.0` above) |

| **Server Port** | `853`                                         |

| **Verify CN**   | `<your_config_id>.dns.nextdns.io`             |

OPNsense also supports the CLI installer:

### 1.14 Public DNS and AdGuard Home Integration

**Impact: HIGH ()**

Critical for unlinked device setup and AdGuard Home upstream configuration

Critical for unlinked device setup and AdGuard Home upstream configuration

NextDNS provides public DNS servers (anycast) that can be used for devices that cannot link to a

specific configuration profile, as well as integration with AdGuard Home as an upstream DNS

provider. This guide covers browser setup, operating system configuration, and AdGuard Home

integration patterns.

NextDNS operates the following public DNS servers for unlinked devices:

Configure secure DNS in Chromium-based browsers:

1. Navigate to **Settings**

2. Go to **Privacy and security**

3. Select **Security**

4. Enable **Use secure DNS**

5. Select **Custom** provider

6. Enter: `https://dns.nextdns.io/`

Configure DNS over HTTPS in Firefox:

1. Navigate to **Settings**

2. Go to **Privacy and Security**

3. Enable **DNS over HTTPS**

4. Select **Max Protection**

5. Choose **NextDNS** from the provider list

Configure DNS settings with DoH support:

1. Open **Settings**

2. Navigate to **Network and internet**

3. Select your connection (**Wi-Fi** or **Ethernet**)

4. Click **Hardware properties**

5. Under **DNS Server Assignment**, click **Edit**

6. Set **IPv4 DNS servers**:

   - Preferred: `45.90.28.0`

   - Alternate: `45.90.30.0`

7. Set **IPv6 DNS servers**:

   - Preferred: `2a07:a8c0::`

   - Alternate: `2a07:a8c1::`

8. Set **DNS over HTTPS** to **On (manual template)**

9. Enter template: `https://dns.nextdns.io/`

Configure Private DNS for system-wide encrypted DNS:

1. Open **Settings**

2. Navigate to **Network and internet**

3. Select **Private DNS**

4. Choose **Private DNS provider hostname**

5. Enter: `dns.nextdns.io`

iOS requires installing a configuration profile:

1. Visit the [Apple configuration generator](https://apple.nextdns.io)

2. Generate and download the `.mobileconfig` profile for your configuration

3. Install the profile on your iOS device

4. Navigate to **Settings** → **General** → **VPN and Device Management**

5. Select and install the NextDNS profile

**Note:** The profile must be generated from the official NextDNS Apple generator to ensure proper

signing and compatibility.

Configure NextDNS as upstream DNS in AdGuard Home for load balancing:

- Use DNS over HTTPS (DoH) or DNS over TLS (DoT) whenever possible for encrypted DNS queries

- Configure both IPv4 and IPv6 DNS servers for dual-stack networks

- Always set bootstrap DNS servers in AdGuard Home to avoid ECS issues

- Use load-balanced endpoints (`dns1` and `dns2`) for better reliability in AdGuard Home

- Test DNS configuration after setup using online DNS leak test tools

- **Missing Bootstrap DNS:** AdGuard Home may fail to resolve NextDNS upstream servers without

  proper bootstrap configuration

- **IPv6 Only:** Ensure both IPv4 and IPv6 are configured on dual-stack networks

- **DoH Template Format:** Windows 11 requires the full `https://` URL format for DoH templates

- **iOS Profile Expiry:** Configuration profiles may need to be reinstalled after iOS updates

- [NextDNS Help Center](https://help.nextdns.io)

**IPv4 Addresses:**

- Primary: `45.90.28.0`

- Secondary: `45.90.30.0`

**IPv6 Addresses:**

- Primary: `2a07:a8c0::`

- Secondary: `2a07:a8c1::`

**DNS over HTTPS: DoH**

- Endpoint: `https://dns.nextdns.io/`

**DNS over TLS (DoT) / Android Private DNS:**

- Hostname: `dns.nextdns.io`

**Recommended Configuration:**

**Alternative Protocols:**

- **DNS over TLS:** Use `tls://dns1.nextdns.io/` and `tls://dns2.nextdns.io/`

- **DNS over QUIC:** Use `quic://dns1.nextdns.io/` and `quic://dns2.nextdns.io/`

**Critical:** Bootstrap DNS servers must be configured to ensure AdGuard Home can resolve NextDNS

upstream hostnames and maintain EDNS Client Subnet (ECS) functionality for optimal routing.

**Recommended Bootstrap Servers:**

These public resolvers ensure that AdGuard Home can properly resolve the NextDNS upstream hostnames

and maintain ECS functionality for optimal routing.

**DNS Not Resolving:**

- Verify DNS server addresses are entered correctly

- Check firewall rules allow DNS traffic (port 53, 443 for DoH, 853 for DoT)

- Test with `nslookup` or `dig` commands

**AdGuard Home Connection Issues:**

- Ensure bootstrap DNS servers are configured

- Verify network connectivity to NextDNS endpoints

- Check AdGuard Home logs for upstream DNS errors

**ECS Not Working:**

- Confirm bootstrap DNS servers are set to public resolvers

- Verify AdGuard Home upstream configuration uses hostnames (not IP addresses)

### 1.15 Raspberry Pi Integration

**Impact: HIGH (Without proper DHCP configuration pointing LAN devices to the Pi, NextDNS CLI runs on the Pi but provides no network-wide protection)**

Deploy NextDNS CLI on a Raspberry Pi as a dedicated DNS server for your entire home network

Deploy NextDNS CLI on a Raspberry Pi as a dedicated DNS server for your entire home network

Running NextDNS CLI on a Raspberry Pi provides network-wide encrypted DNS filtering without

configuring each device individually. All DNS queries from every device on your network pass

through the Pi to NextDNS.

This is the most popular alternative to Pi-hole — you get powerful filtering without maintaining

local blocklists.

- Raspberry Pi running Raspberry Pi OS Bookworm/Bullseye or Ubuntu Server for ARM

- Pi connected to your network via Ethernet (recommended) or Wi-Fi

- Router admin access to change DHCP DNS settings

- A static IP for the Pi

Configure your router to always assign the same IP to the Pi via DHCP reservation (preferred):

1. Log into your router admin panel

2. Find the DHCP reservations / static leases section

3. Find the Pi's MAC address and assign it `192.168.1.2` (or your preferred IP)

Answer the installer prompts:

In your router's DHCP settings, set the DNS server to the Pi's IP:

After saving, devices that renew their DHCP lease will automatically use the Pi for DNS.

For the NextDNS dashboard to show device names (for example, "Samsung Galaxy", "MacBook Pro") instead

of IP addresses, the CLI needs to read from mDNS/ARP:

The installer creates a systemd service automatically. Verify:

If the Pi is offline, devices will fall back to the Secondary DNS set in your router (Quad9 in the

example above). This means filtering is temporarily disabled but internet access continues.

For higher availability, run NextDNS CLI on a second Pi and set it as the secondary DNS.

Force devices to renew their DHCP lease:

- [NextDNS CLI GitHub](https://github.com/nextdns/nextdns)

- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)

- [Raspberry Pi Documentation (GitHub)](https://github.com/raspberrypi/documentation)

### 1.16 Synology Integration (DSM and SRM)

**Impact: MEDIUM ()**

Essential for deploying NextDNS on Synology NAS (DSM) and routers (SRM) with proper SSH access and

Essential for deploying NextDNS on Synology NAS (DSM) and routers (SRM) with proper SSH access and

network configuration

Synology provides two operating systems: **DSM** for NAS devices and **SRM** for routers. This rule

provides platform-specific guidance for installing the NextDNS CLI on both platforms.

| Platform | Full Name               | Device Type | Use Case                          |

| -------- | ----------------------- | ----------- | --------------------------------- |

| **DSM**  | DiskStation Manager     | NAS         | Network storage, local DNS server |

| **SRM**  | Synology Router Manager | Router      | Network gateway, DHCP server      |

1. Log in to DSM Web Interface

2. Navigate to **Control Panel**

3. Select **Terminal and SNMP**

4. Check **Enable SSH service**

5. Click **Apply**

SRM requires an additional critical step to enable root access via the admin user.

⚠️ **This step is mandatory for SRM. Skipping it will prevent SSH access.**

1. Log in to SRM Web Interface

2. Navigate to **Control Panel**

3. Select **User** tab

4. Locate the **admin** user in the list

5. Click **Edit**

6. **Uncheck** "Disable this account"

7. Set a strong password for the admin user

8. Click **OK**

1. In **Control Panel**, navigate to **Services**

2. Locate **SSH** section

3. Check **Enable SSH services**

4. Click **Apply**

**Important:** Connect using the `root` username (not `admin`) with the admin password you set.

After installing NextDNS on your Synology device, configure your network to use it as the DNS

server.

If you're using SRM as your router, configure DHCP to automatically assign the NextDNS-enabled

device as the DNS server:

1. Navigate to **Network Center** → **DHCP Server**

2. Under **DNS Server**, set:

   - **Primary DNS**: IP address of your Synology router (for example, `192.168.1.1`)

3. Click **Apply**

If you're using DSM as a local DNS server for your network:

1. Access your router's DHCP settings (non-Synology router)

2. Set the **Primary DNS** to your DSM device IP (for example, `192.168.1.10`)

3. Apply the changes

**Recommendation:** Set a static IP address for your Synology device to prevent DNS resolution

issues if the IP changes.

1. Navigate to **Control Panel** → **Network** → **Network Interface**

2. Select your network interface and click **Edit**

3. Under IPv4, select **Use manual configuration**

4. Enter your desired static IP, subnet mask, and gateway

5. Click **OK**

1. Navigate to **Network Center** → **Local Network** → **Network Interface**

2. Select your WAN or LAN interface

3. Configure a static IP address

4. Click **Apply**

After installation, verify that NextDNS is working:

Visit [https://test.nextdns.io](https://test.nextdns.io) from a device on your network to confirm

NextDNS is active.

If the installation fails or you encounter issues, run the installer in debug mode:

This will output verbose information to help identify the problem.

**Cause:** The admin user is disabled (default state on SRM).

**Solution:** Follow Step 1 under "SRM Installation" to enable the admin user.

**Cause:** DHCP clients are not using the Synology device as their DNS server.

- [NextDNS CLI - Synology](https://github.com/nextdns/nextdns/wiki/Synology)

**Solution:**

1. Check DHCP server configuration

2. Verify the Synology device has a static IP

3. Renew DHCP leases on client devices (`ipconfig /release && ipconfig /renew` on Windows, or

   reconnect Wi-Fi)

**Cause:** Port 53 may be in use by another service.

**Solution:**

### 1.17 Tailscale Integration

**Impact: HIGH ()**

Critical for protecting mesh VPN traffic with NextDNS filtering and enforcing DNS policies across

Critical for protecting mesh VPN traffic with NextDNS filtering and enforcing DNS policies across

distributed networks

Tailscale is a zero-config mesh VPN built on WireGuard that makes it easy to connect devices

securely. By integrating NextDNS with Tailscale, you can ensure that all traffic flowing through

your Tailscale network benefits from NextDNS filtering and protection.

Tailscale integrates with NextDNS using **DNS-over-HTTPS (DoH)** as the transport protocol. This

ensures encrypted DNS queries across your entire mesh network, even when devices are on untrusted

networks.

This configuration applies NextDNS to all devices in your Tailscale network (tailnet).

1. Log in to your NextDNS dashboard

2. Navigate to the **Setup** tab

3. Find the **Endpoints** section

4. Copy the **IPv6 address** (format: `2a07:a8c0::xx:xxxx`)

1. Open the [Tailscale Admin Console](https://login.tailscale.com/admin/dns)

2. Navigate to **DNS** settings

3. Under **Nameservers**, select **Custom**

4. Add your NextDNS IPv6 endpoint address

5. **Critical**: Enable **Override local DNS** to force all devices to use NextDNS

This setting must be enabled to ensure NextDNS is actually used:

- Without this option, devices may continue using their local DNS settings

- Enabling it forces all DNS queries through Tailscale's resolver

- This is the most common cause of integration failures

Tailscale's Access Control List (ACL) system allows you to assign different NextDNS profiles to

specific devices or user groups using node attributes.

You can specify which NextDNS profile each device should use through ACL policies:

NextDNS cannot be used as a split DNS server alongside other DNS providers in Tailscale. You must

choose one of the following:

- **Option A**: Use NextDNS exclusively for all DNS queries

- **Option B**: Use another DNS provider and forgo NextDNS integration

There is no hybrid configuration where some domains use NextDNS and others use different resolvers.

The DoH integration requires IPv6 connectivity. Devices without IPv6 support may experience issues

or fallback to local DNS.

After configuration, verify the integration is working:

1. Visit [https://test.nextdns.io](https://test.nextdns.io) from a Tailscale-connected device

2. Confirm it shows "This device is using NextDNS with `your profile`"

3. Check the NextDNS logs to see queries from your Tailscale devices

- **Test Before Full Deployment**: Configure a single device first to verify functionality

- **Use Tags Strategically**: Organize devices with Tailscale tags for easier profile management

- **Monitor Query Logs**: Check NextDNS analytics to ensure queries are being routed correctly

- **Document Profile Assignments**: Keep a reference of which tags use which NextDNS profiles

- **Regular ACL Review**: Audit your ACL configuration periodically to ensure correct profile

  assignments

- **Forgetting to Enable Override**: The most common mistake is not enabling "Override local DNS" in

  Tailscale settings

- **Wrong Endpoint Format**: Ensure you use the IPv6 address from NextDNS Endpoints, not the DoH URL

- **ACL Syntax Errors**: JSON formatting errors in ACLs will prevent the configuration from saving

- **Profile ID Typos**: Double-check NextDNS profile IDs in nodeAttrs to avoid routing to wrong

  profiles

- **No Fallback DNS**: If NextDNS is unavailable, DNS resolution may fail completely (consider

  testing backup scenarios)

1. Verify "Override local DNS" is enabled in Tailscale Admin Console

2. Check that the NextDNS IPv6 endpoint is correctly entered

3. Restart the Tailscale client on affected devices

4. Test IPv6 connectivity: `ping6 2a07:a8c0::1`

1. Review your ACL nodeAttrs configuration for syntax errors

2. Verify device tags are correctly assigned in Tailscale Admin Console

3. Check that profile IDs match your NextDNS dashboard

4. Use `tailscale status` to confirm device tags

1. Confirm devices are actually routing through Tailscale (check Tailscale status)

2. Verify the profile ID in your configuration is correct

3. Check if device metadata sharing is blocked by firewall rules

4. Review Tailscale logs for DNS-related errors

- [NextDNS Help Center](https://help.nextdns.io)

**Explanation**:**

- `target`: Specifies which devices/users this rule applies to (uses Tailscale tags or autogroups)

- `attr`: The NextDNS profile ID to apply (format: `nextdns:YOUR_PROFILE_ID`)

- Replace `abc123`, `xyz789`, and more with your actual NextDNS profile IDs

If you prefer not to share device information with NextDNS, use the `no-device-info` attribute:

This prevents Tailscale from sending device names, operating systems, and other metadata to NextDNS.

### 1.18 Ubiquiti (UniFi) Integration

**Impact: HIGH ()**

Essential for preventing DNS conflicts on Ubiquiti UniFi Dream Machines and Gateways

Essential for preventing DNS conflicts on Ubiquiti UniFi Dream Machines and Gateways

Ubiquiti UniFi devices (UDM, UDM-Pro, UDM-SE, UXG-Pro, and UXG-Max families) are popular network

gateways that can integrate with NextDNS. However, improper configuration can cause conflicts with

UniFi's built-in DNS features, resulting in network-wide DNS failures.

Ubiquiti devices support two methods for NextDNS integration, depending on firmware version and use

case.

**Availability**: UniFi OS 3.0 and later

DNS Shield is a native feature that provides DNS-over-HTTPS without requiring command-line

configuration.

1. Open the UniFi Network Application

2. Navigate to **Settings → Security → DNS Shield**

3. Toggle **Enable DNS Shield**

4. Select **Custom Provider**

5. Enter your NextDNS DoH URL: `https://dns.nextdns.io/YOUR_PROFILE_ID`

6. Click **Apply Changes**

If installation fails, run the installer with debug output enabled:

This generates verbose logs that help identify the root cause of failures.

If you encounter APT repository errors (common on older UDM firmware), the Debian Stretch

repositories may be archived:

- **Prefer DNS Shield** when available (UniFi OS 3.0+) for better compatibility and update

  resilience

- **Document Configuration**: Keep notes on which method you're using and the profile ID

- **Test After Updates**: Verify NextDNS functionality after UniFi firmware updates

- **Monitor Logs**: Check NextDNS analytics regularly to ensure queries are being logged

- **Backup Settings**: Export UniFi configuration before making DNS changes

- **Use CLI for Advanced Needs**: Only use CLI method if you need features not available in DNS

  Shield

- **Not Disabling Conflicts**: The most critical mistake is leaving Content Filtering or Ad Blocking

  enabled with CLI installation

- **Wrong Profile ID**: Double-check your NextDNS profile ID during setup

- **Hardcoded DNS on Devices**: Some devices may have static DNS configured, bypassing the router

- **Post-Update Testing**: Always verify DNS after UniFi firmware updates

- **SSH Access**: Ensure SSH remains enabled if you need to troubleshoot CLI installations

| Feature                | DNS Shield (Native) | NextDNS CLI                  |

| ---------------------- | ------------------- | ---------------------------- |

| **UniFi OS Version**   | 3.0+ required       | All versions                 |

| **Installation**       | GUI-based           | SSH/Command-line             |

| **Update Persistence** | Automatic           | May require reinstall        |

| **Advanced Routing**   | Limited             | Full control                 |

| **Complexity**         | Low                 | Medium-High                  |

| **Conflicts**          | None                | Must disable UniFi filtering |

- [NextDNS CLI - Ubiquiti](https://github.com/nextdns/nextdns/wiki/Ubiquiti)

**Benefits**:**

- No SSH access required

- Survives firmware updates automatically

- Managed through the UniFi web interface

- Simpler troubleshooting

**Limitations**:**

- Only available on UniFi OS 3.0+

- Limited advanced configuration options

**Use Cases**:**

- UniFi OS versions below 3.0

- Advanced routing configurations

- Conditional DNS forwarding

- Integration with custom scripts

- SSH access to the device

- Root privileges

- Internet connectivity from the device

1. Open UniFi Network Application

2. Navigate to **Settings → System → Console Settings**

3. Enable SSH and note your password

Or use the device's IP address:

Execute the official installer script:

Follow the interactive prompts to complete installation.

The NextDNS CLI is **incompatible** with UniFi's built-in DNS filtering features. You **must**

disable both features to prevent DNS failures:

1. Navigate to **Settings → Network**

2. Locate **Content Filtering**

3. Set to **None**

4. Click **Apply Changes**

1. Navigate to **Settings → Application Firewall → General**

2. Locate **Ad Blocking**

3. Uncheck **Enable Ad Blocking**

4. Click **Apply Changes**

**Warning**: Failing to disable these features will cause DNS resolution conflicts, potentially

breaking network connectivity for all devices.

Queries originating from the UDM/UXG device itself (not network clients) will **not** be routed

through NextDNS. Only traffic from connected network devices will be filtered. This is a known

limitation of the CLI installation method.

**Fix**:**

Then retry the NextDNS installation.

Verify the NextDNS service is running:

Expected output: `running`

Verify your profile ID is correctly configured.

**Possible Causes**:**

- Content Filtering or Ad Blocking still enabled (check Settings again)

- Incorrect profile ID in configuration

- Network devices using hardcoded DNS servers (bypass router)

- VPN or proxy configurations overriding DNS settings

**Verification Steps**:**

1. From a client device, visit: [https://test.nextdns.io](https://test.nextdns.io)

2. Confirm it detects your NextDNS profile

3. Check the NextDNS logs for recent queries from your network

**CLI Method Only**: Firmware updates may remove the NextDNS CLI installation.

**Solution**:**

- Re-run the installer after firmware updates

- Consider switching to DNS Shield (Method 1) if available on your firmware version

---

## 2. Efficiency rules

**Impact: HIGH**

### 2.1 Backup and Failover Configuration

**Impact: HIGH (Ensure continuous internet access even if NextDNS is unreachable)**

A resilient network configuration ensures that DNS resolution continues even if the primary NextDNS

A resilient network configuration ensures that DNS resolution continues even if the primary NextDNS

connection is interrupted.

DNS is a single point of failure. If your router is configured _only_ to use NextDNS and the service

or your connection to it fails, all internet access on your network will appear "down."

Most advanced routers (OpenWrt, pfSense, EdgeRouter) allow multiple DNS upstreams. Configure NextDNS

as the primary and a privacy-respecting public DNS as a secondary.

- ✅ **Primary**: `45.90.28.abc (NextDNS Anycast/Linked IP)`

- ✅ **Secondary**: `9.9.9.9 (Quad9)` or `1.1.1.1 (Cloudflare)`

The NextDNS CLI supports multiple server definitions for the same domain or as a global failover.

Operating systems (Windows, macOS, iOS, Android) often attempt to query multiple DNS servers if the

first one times out. Adding a secondary DNS server in your DHCP settings provides this safety net.

⚠️ **Caution**: Adding a non-NextDNS secondary server (like 8.8.8.8) may lead to "DNS leaks" where

some queries bypass NextDNS filtering even when it is online. This happens because some OS

algorithms query all available servers and use the fastest response.

- **For maximum privacy**: Use only NextDNS across multiple bootstrap IPs or DoH endpoints.

- **For maximum availability**: Use NextDNS as primary and Quad9 (which also blocks malware) as

  secondary.

- [NextDNS Help Center - Reliability](https://help.nextdns.io/)

### 2.2 Pi-hole to NextDNS Migration

**Impact: MEDIUM (Migrating without exporting custom blocklist entries causes loss of tailored domain rules accumulated over months or years of Pi-hole use)**

Migrate from Pi-hole to NextDNS while preserving custom blocklist entries, local DNS records, and DHCP settings

Migrate from Pi-hole to NextDNS while preserving custom blocklist entries, local DNS records, and DHCP settings

Pi-hole users switching to NextDNS typically want to preserve:

1. **Custom blocked domains** (ad-hoc additions to Pi-hole's blocklist)

2. **Custom allowed domains** (allowlist entries for false positives)

3. **Local DNS records** (hostname → IP mappings for home devices)

4. **DHCP settings** (if Pi-hole was acting as the DHCP server)

NextDNS does not import Pi-hole databases directly, but its API makes it straightforward to

replicate these settings programmatically.

After verifying the import in the NextDNS dashboard:

1. **Stop Pi-hole's DNS** (but keep it running for DHCP if needed):

   ```bash

   sudo systemctl stop pihole-FTL

   ```

2. **Change your router's DHCP DNS** to your NextDNS CLI installation or NextDNS's linked IP

3. **Force DHCP renewal** on clients

4. **Monitor the NextDNS Logs tab** for 24 hours — add any false positives to the allowlist

- **Pi-hole's DHCP server**: NextDNS is DNS-only. If you used Pi-hole as a DHCP server, migrate

  that function to your router or keep Pi-hole running for DHCP only.

- **Pi-hole's regex blocking**: NextDNS denylist supports exact domains and wildcards

  (`*.example.com`) but not full regex patterns.

- **Pi-hole's query logs stored locally**: NextDNS logs are stored in the cloud (your chosen

  region). If you need on-device log storage, this is a limitation.

- [NextDNS API — Denylist](https://nextdns.github.io/api/#profile)

- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)

- [Pi-hole Documentation](https://docs.pi-hole.net)

---

