# NextDNS UI Skills

**Version 1.0.0**  
NextDNS Skills  
March 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring NextDNS Web UI configuration and dashboard management. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Best practices and guidelines for NextDNS Web UI configuration and dashboard management, ordered by impact.

---

## Table of Contents

1. [Capability rules](#1-capability-rules) — **MEDIUM**
   - 1.1 [Analytics and Logs](#11-analytics-and-logs)
   - 1.2 [Configuration Management](#12-configuration-management)
   - 1.3 [Denylist and Allowlist](#13-denylist-and-allowlist)
   - 1.4 [Device Management](#14-device-management)
   - 1.5 [DNS Rewrites](#15-dns-rewrites)
   - 1.6 [Linked IP and DDNS](#16-linked-ip-and-ddns)
   - 1.7 [Parental Control](#17-parental-control)
   - 1.8 [Privacy Settings](#18-privacy-settings)
   - 1.9 [Root CA Certificate Installation](#19-root-ca-certificate-installation)
   - 1.10 [Security Settings](#110-security-settings)
   - 1.11 [Web3 Settings](#111-web3-settings)
2. [Efficiency rules](#2-efficiency-rules) — **MEDIUM**
   - 2.1 [Multiple Profiles Strategy](#21-multiple-profiles-strategy)
   - 2.2 [Recommended Configuration Guidelines](#22-recommended-configuration-guidelines)
   - 2.3 [Setup Optimization](#23-setup-optimization)
   - 2.4 [Threat Modeling & Strategy](#24-threat-modeling--strategy)
   - 2.5 [Troubleshooting via Web UI](#25-troubleshooting-via-web-ui)

---

## 1. Capability rules

**Impact: MEDIUM**

### 1.1 Analytics and Logs

**Impact: MEDIUM (Monitoring network activity and identifying blocked queries)**

Visibility and troubleshooting tools

Visibility and troubleshooting tools

Monitor your network activity and troubleshoot issues through real-time logs and detailed analytics.

- **Real-time Monitoring**: See every DNS query hitting the NextDNS resolver.

- **Search and Filter**:

  - **Blocked Queries Only**: Quickly identify what is being blocked.

  - **Raw DNS Logs**: View absolute DNS record details.

- **Identification**: To find out **why** a domain is blocked, hover over the information icon

  (**ⓘ**) next to the query. It will tell you the specific blocklist or security feature

  responsible.

- **Direct Action**: You can allow or block domains directly from the log entry using the checkmark

  or cross icons.

- **Reloading**: Use the reload icon to check for the most recent queries after making configuration

  changes.

- **Global Overview**: Track total queries and the percentage of blocked requests.

- **Insights**:

  - **Top Domains**: Identify the most requested domains.

  - **Top Reasons**: See which rules are triggering the most blocks.

  - **Top Clients**: Identify which devices are the most active on your network.

- **Retention**: Data in the Analytics tab respects your chosen retention period in Settings.

- Periodically check the **Blocked Queries Only** filter to ensure no essential services are being

  blocked.

- Use the **Analytics** to understand the traffic patterns on your network and identify potential

  issues (like a device making excessive requests).

- [NextDNS Help Center](https://help.nextdns.io)

### 1.2 Configuration Management

**Impact: MEDIUM (Global profile settings, log retention, and performance optimization)**

System-level profile settings and performance

System-level profile settings and performance

Manage your NextDNS profile settings, log storage, and performance optimizations.

- **Profile Name**: Use descriptive names like "Router - Stable" or "Browser - Aggressive".

- **Logs Enabled**: Toggle on/off log recording.

- **Log Retention**: Choose how long to keep logs (from 1 hour to 3 months).

- **Log Storage Location**: **Switzerland** is often recommended by privacy enthusiasts due to their

  strong data protection laws.

- **Block Page**: Display a dedicated page when a site is blocked.

  - **Caution**: This setting can break **PayPal 2FA**, **iCloud Private Relay**, **Microsoft

    Teams**, and **Yahoo! Mail**. Only enable if you have installed the NextDNS Root CA.

- **Anonymized EDNS Client Subnet**: Often enabled by default to improve CDN routing without

  exposing your full IP.

- **Cache Boost**: Recommended for performance. It tells clients to keep DNS answers longer.

- **CNAME Flattening**: Reduces the number of DNS queries.

  - **Warning**: May break compatibility with services like **Yahoo! Mail**.

- **Rewrites**: Manually redirect any domain or subdomain (for example, `local.home` to `192.168.1.1`).

- **Bypass Age Verification**: Allows accessing content that requires age verification via DNS

  identification.

- **Web3**: Enable resolution of decentralised domains (HNS, ENS, and more).

- **Set-and-Forget**: If you want a trouble-free experience, stick to the **NORMAL** or **PRO**

  blocklists and avoid aggressive security settings like "Block Newly Registered Domains".

- [NextDNS Help Center](https://help.nextdns.io)

### 1.3 Denylist and Allowlist

**Impact: MEDIUM (Manual management of domain-specific accessibility rules)**

Selective domain blocking and allowing

Selective domain blocking and allowing

Manually manage specific domains that should always be blocked or always allowed.

Use the **Denylist** to explicitly block domains that bypass your DNS settings or facilitate

tracking.

Prevents NextDNS from protecting iOS/macOS devices by overriding DNS settings. To force NextDNS

filtering, block:

- `mask.icloud.com`

- `mask-h2.icloud.com`

- `mask-canary.icloud.com`

Use the **Allowlist** to ensure essential services function correctly even with aggressive

blocklists.

- `nextdns.io`: Prevent blocking access to the NextDNS dashboard itself.

- **Apple Updates**: `xp.apple.com` (Needed for device updates).

- **Apple Features**: `smoot.apple.com` (Spotlight Search, iMessage GIFs).

- **Windows Features**: `settings-win.data.microsoft.com` (Blocked by native Windows tracking list).

- **Social Media Fixes**:

  - `graph.facebook.com`, `graph.instagram.com` (If app issues occur).

- **Video Services**:

  - `s.youtube.com` (If YouTube history is not working).

  - `imasdk.googleapis.com`, `pubads.g.doubleclick.net` (May be needed for Paramount+ or CBS

    livestream).

Only add domains to the Allowlist if you encounter a specific issue. Over-allowing can compromise

the effectiveness of your security and privacy filters.

- [NextDNS Help Center](https://help.nextdns.io)

### 1.4 Device Management

**Impact: MEDIUM (Unidentified devices appear as anonymous IPs in logs, making it impossible to troubleshoot per-device issues or apply device-specific filtering)**

Identify, name, and manage devices in the NextDNS dashboard for precise per-device visibility

Identify, name, and manage devices in the NextDNS dashboard for precise per-device visibility

The NextDNS dashboard can display each device by name (for example, "Alice's iPhone", "Smart TV") in

the Logs and Analytics tabs. Device identification depends on the DNS protocol the device uses to

reach NextDNS.

Understanding which protocol each device uses determines how you can identify it and whether you can

apply device-specific profiles.

| Protocol | Device visible in Logs | Per-device Profile | Client name shown |

|----------|----------------------|-------------------|-------------------|

| DoH (DNS-over-HTTPS) | ✅ | ✅ | ✅ (from device ID in URL) |

| DoT (DNS-over-TLS) | ✅ | ✅ | ✅ (from TLS hostname) |

| NextDNS CLI / App | ✅ | ✅ | ✅ (from `-report-client-info`) |

| Linked IP (plain DNS) | ⚠️ By IP only | ❌ | ❌ (IP address only) |

1. Navigate to `https://my.nextdns.io/{profile-id}/setup`

2. Scroll to **Devices**

3. Devices that have sent queries will appear in the list

4. Click the **pencil icon** next to any device to rename it

1. Navigate to the **Logs** tab

2. Click on a query row

3. In the expanded view, click **Edit** next to the device name

4. Enter a friendly name and save

Devices that use the router's DNS (Linked IP setup) appear only as IP addresses. To improve

visibility, install the NextDNS CLI on the router with `-report-client-info`:

This enables the CLI to report the hostname and MAC address of each LAN client to NextDNS.

Android's Private DNS (DoT) uses the profile-specific hostname:

This associates the device with your profile and makes it identifiable by its Android device name.

Install the NextDNS profile from `https://my.nextdns.io/{profile-id}/setup` → **iOS**. The profile

includes a DoH or DoT configuration with your profile ID embedded, enabling per-device

identification.

Navigate to **Analytics → Devices** to see:

- Query count per device over the selected time period

- Percentage of blocked queries per device

- Device model (when reported by the NextDNS app or CLI)

- **Name devices immediately** after they first appear in Logs — it is easier while the context is

  fresh.

- **Use descriptive names** that include the owner and device type: "Bob - iPad Pro", "Living Room

  TV".

- **Enable `-report-client-info`** on the NextDNS CLI for network-wide installations to identify

  devices without requiring per-device configuration.

- **Check the `__UNIDENTIFIED__` filter** periodically to catch new devices on your network that

  have not been named yet.

**Cause**: The device uses Linked IP (plain DNS) without client info reporting.

**Solution**: Install NextDNS CLI on the router with `-report-client-info`, or configure the

device to use DoH/DoT with your profile ID in the URL/hostname.

**Cause**: Different devices were given the same hostname, or the same device changed its IP.

**Solution**: Rename one device from the Devices list in the Setup tab, using more specific names.

- [NextDNS Help Center — Device Identification](https://help.nextdns.io)

- [NextDNS CLI — Report Client Info](https://github.com/nextdns/nextdns#configuration)

- [NextDNS Dashboard — Setup](https://my.nextdns.io/setup)

**Incorrect:**

```text
❌ Do not rely on Linked IP alone for per-device visibility
   Plain DNS (port 53) via linked IP only identifies the network, not individual devices.

❌ Do not use the same DoH URL for multiple devices without the profile ID
   Generic DoH URLs like https://dns.nextdns.io/ without a profile suffix cannot identify
   which profile or device the query came from.
```

### 1.5 DNS Rewrites

**Impact: MEDIUM ()**

Override DNS resolution for specific hostnames from the NextDNS web dashboard

Override DNS resolution for specific hostnames from the NextDNS web dashboard

The **Rewrites** tab of a NextDNS profile lets you define custom DNS records that take precedence

over all other resolution — including blocklists, security rules, and upstream DNS answers.

Navigate to **my.nextdns.io → \[Profile\] → Rewrites** to manage rewrite records.

Common use cases:

- Access local devices by friendly hostname (for example, `nas.home → 192.168.1.50`)

- Block a specific hostname by returning `0.0.0.0`

- Create a CNAME alias for a self-hosted service

- **Rewrites override everything**: A rewrite takes precedence over blocklists, security rules, and

  allowlists for that exact hostname.

- **Use `.home` or `.lan` for local devices**: These TLDs are not publicly registered, reducing the

  chance of accidental conflicts with real domains.

- **Prefer the Denylist for simple blocking**: Only use a rewrite to block when you need a specific

  non-zero answer. For straightforward blocking, the Denylist is simpler and supports wildcards.

- **Test resolution after adding**: Run `nslookup nas.home` from a device using NextDNS to confirm

  the rewrite is active.

**Symptoms**: Device still gets the original IP or NXDOMAIN after adding a rewrite.

- [NextDNS Help Center](https://help.nextdns.io)

- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)

**Correct: Adding an a record IPv4**

```text
✅ Name:   nas.home
   Answer: 192.168.1.50       → Returns the specified IPv4 address
```

**Correct: Adding an AAAA record IPv6**

```text
✅ Name:   nas.home
   Answer: fd00::1            → Returns the specified IPv6 address
```

**Correct: Adding a CNAME**

```text
✅ Name:   blog.example.com
   Answer: myserver.example.com   → Returns CNAME pointing to the target
```

**Correct: Blocking a specific hostname**

```text
✅ Name:   tracker.specific.com
   Answer: 0.0.0.0               → Blocks this exact hostname
```

**Incorrect:**

```text
❌ Wildcard names such as *.example.com
   Rewrites apply to exact hostnames only.
   Use the Denylist tab for wildcard blocking.

❌ Rewriting nextdns.io or dns.nextdns.io
   This breaks DNS-over-HTTPS connectivity to NextDNS itself.

❌ Expecting rewrites to cascade
   A CNAME rewrite to myserver.example.com does not apply
   any rewrite you may have defined for myserver.example.com.
```

**Solution**:**

1. Confirm that the profile currently active on the device is the one where the rewrite was added.

2. Flush the local DNS cache on the querying device.

3. Check the **Logs** tab in the NextDNS dashboard to see what answer was returned.

**Symptoms**: A website or app becomes inaccessible after adding a rewrite entry.

**Solution**: The rewrite overrides the real DNS answer for that hostname. Remove or correct the

entry in the Rewrites tab.

### 1.6 Linked IP and DDNS

**Impact: HIGH ()**

Essential for router-level and legacy device support

Essential for router-level and legacy device support

For devices or networks that only support standard IPv4 DNS (port 53), you must link your public IP

address to your NextDNS profile.

If your network uses standard DNS servers (for example, `45.90.28.16`), NextDNS needs to know your public

IP to apply your custom settings.

- **Link IP**: Click the "Link IP" button in the Setup tab of the dashboard.

- **Dynamic IPs**: If your ISP changes your IP frequently (for example, when the modem restarts), the link

  will break, and your custom filtering will stop working.

To solve the dynamic IP issue, you can use a DDNS service like **NOIP**.

1. **Get a DDNS Hostname**: Register a free hostname at [noip.com](https://www.noip.com).

2. **Setup DDNS on Router**: Configure your modem/router to update the DDNS hostname whenever your

   public IP changes.

3. **Link to NextDNS**:

   - In the NextDNS Dashboard (Setup tab), click **Show advanced options** under the Linked IP

     section.

   - Enter your DDNS hostname (for example, `myhome.ddns.net`) into the configuration field.

4. **Verification**: NextDNS will now automatically update your Linked IP by resolving your DDNS

   hostname.

If modern protocols (DoH/DoT) aren't available, use these addresses:

- **IPv4**: `45.90.28.16` and `45.90.30.16`.

- **IPv6**: `2a07:a8c0::af:1fd7` and `2a07:a8c1::af:1fd7`.

Linked IP is the "backup" method. Whenever possible, use the **NextDNS CLI, Apps, or Private DNS

(Android)** as they do not require IP linking and support naming devices in logs.

- [NextDNS Help Center](https://help.nextdns.io)

### 1.7 Parental Control

**Impact: HIGH (Management of content filtering, app restrictions, and schedules)**

Content filtering and usage monitoring for family members

Content filtering and usage monitoring for family members

Configure restrictions to manage and protect children's internet access.

- **Websites, Apps and Games**: Restrict access to specific popular services. Supported apps include:

  - **Social Media**: Facebook, TikTok, Instagram, Snapchat, Reddit, Twitter, Tumblr, Pinterest.

  - **Gaming**: Roblox, Minecraft, Fortnite, League of Legends, Steam, Blizzard.

  - **Messaging**: Messenger, WhatsApp, Discord, Telegram, Skype.

  - **Streaming**: YouTube, Netflix, Disney+, Hulu, Spotify, Twitch, Vimeo, Prime Video.

  - **Others**: Tinder, eBay, Amazon, Zoom, 9GAG.

- **Categories**: Block entire categories of content:

  - **Porn**: Adult and pornographic content (for example, Pornhub).

  - **Gambling**: Gambling and betting sites.

  - **Dating**: Dating apps and websites.

  - **Piracy**: P2P sites and copyright-infringing content.

  - **Social Networks**: All social media platforms.

- **Recreation Time**: Set specific time windows for each day of the week (Monday to Sunday) when

  certain apps or categories are **allowed**. For example, allowing Facebook only from 6 PM to 8 PM

  on Tuesdays.

- **SafeSearch**: Enforce SafeSearch on major search engines to filter explicit images and videos.

- **YouTube Restricted Mode**: Filter mature videos on YouTube and hide all comments.

- **Block Bypass Methods**: Essential feature to block VPNs, proxies, and Tor used to bypass

  filtering.

The **Recreation Time** feature is one of the most effective tools for balancing screen time and

study time for children. Always enable **Block Bypass Methods** to ensure the rules cannot be easily

circumvented by savvy users.

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

### 1.8 Privacy Settings

**Impact: HIGH (Management of privacy blocklists and anti-tracking features)**

Core privacy and tracking protection settings

Core privacy and tracking protection settings

Manage blocklists and tracking protection to enhance your online privacy.

Blocklists filter out ads, trackers, and malicious sites. We recommend using a **minimum** number of

useful lists to prevent overblocking.

[HaGeZi](https://github.com/hagezi/dns-blocklists) is the recommended maintainer as he handles false

positives quickly and communicates with other maintainers.

| Selection                        | Rationale                                                                   |

| -------------------------------- | --------------------------------------------------------------------------- |

| **HaGeZi - Multi NORMAL + OISD** | For routers. "Set-and-forget" with almost no issues.                        |

| **HaGeZi - Multi PRO**           | Recommended for most users. Blocks more without major issues.               |

| **HaGeZi - Multi PRO++**         | For web browsers. Aggressive blocking, may require occasional allowlisting. |

- **hostsVN**: **Highly recommended for Vietnamese users** to effectively block local ads.

Add the brand names of all devices you use on your network (for example, Apple, Samsung, Xiaomi, Huawei,

Windows, Amazon Alexa, Roku, Sonos).

Automatically detect and block trackers that masquerade as first-party via CNAME cloaking.

- **Note**: NextDNS blocks CNAME records by default even if this list is disabled. This specific

  list hasn't been updated in years and might block some referral domains incorrectly.

Allow links on shopping sites or in emails to open properly. NextDNS uses a TCP proxy to hide your

real IP address when clicking these links, preserving your privacy.

If you use extremely aggressive lists (like 1Hosts Pro), you will likely experience breakage in

services like:

- **Google Analytics**

- **Google Tag Manager**

- **Google Optimize**

- **Email links** (if affiliate links are blocked)

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

### 1.9 Root CA Certificate Installation

**Impact: HIGH (Without the NextDNS Root CA installed, enabling Block Page causes HTTPS certificate warnings on every blocked site instead of showing the block page)**

Install the NextDNS Root CA certificate to enable HTTPS block pages without browser security warnings

Install the NextDNS Root CA certificate to enable HTTPS block pages without browser security warnings

When NextDNS blocks a domain requested over HTTPS, it intercepts the connection. To display a

friendly block page instead of a confusing browser error (`ERR_SSL_PROTOCOL_ERROR` or similar), the

NextDNS Root CA must be trusted by the device's certificate store.

Without the Root CA, enabling the Block Page feature in Settings causes every blocked HTTPS site to

display a browser certificate warning, which is confusing and alarming for users.

**Block Page should only be enabled after installing the Root CA on all devices that will use the

profile.**

Download from the NextDNS dashboard:

1. Navigate to `https://my.nextdns.io/{your-profile-id}/setup`

2. Scroll to **Root CA** section

3. Download the certificate file: `nextdns.crt`

Or download directly:

Or via GUI:

1. Double-click `nextdns.crt`

2. Click **Install Certificate**

3. Select **Local Machine** → **Place all certificates in the following store**

4. Browse → **Trusted Root Certification Authorities**

5. Click **Finish** → **Yes** to the security prompt

Or via Keychain Access:

1. Open **Keychain Access** → **System** keychain

2. Drag `nextdns.crt` into the window

3. Double-click the NextDNS certificate → expand **Trust**

4. Set **When using this certificate** to **Always Trust**

1. Send `nextdns.crt` to the device (AirDrop, email attachment, or Safari download)

2. Tap the file — a prompt appears: **Profile Downloaded**

3. Open **Settings** → **General** → **VPN and Device Management**

4. Tap the NextDNS profile → **Install** → enter device passcode

5. **Critical final step**: Open **Settings** → **General** → **About** → **Certificate Trust

   Settings**

6. Toggle **NextDNS** under **Enable Full Trust for Root Certificates** → **Continue**

1. Transfer `nextdns.crt` to the device

2. Open **Settings** → **Security** → **Encryption and credentials**

   (Path varies by manufacturer: Samsung uses **Biometrics and Security** → **Install from

   device storage**)

3. Tap **Install a certificate** → **CA Certificate**

4. Tap **Install Anyway** on the warning

5. Select the `nextdns.crt` file

Firefox maintains its own certificate store, separate from the OS. Install manually:

1. Open **Settings** → **Privacy and Security** → **Certificates** → **View Certificates**

2. Click **Authorities** tab → **Import**

3. Select `nextdns.crt`

4. Check **Trust this CA to identify websites** → **OK**

After installing the Root CA on all devices:

1. Navigate to `https://my.nextdns.io/{your-profile-id}/settings`

2. Under **Block Page**, toggle **Enable**

3. Test by navigating to a blocked domain — you should see the NextDNS block page, not a browser

   error

Even with the Root CA installed, these services do not tolerate certificate interception and may

stop working:

- **PayPal 2FA** — uses certificate pinning

- **iCloud Private Relay** — must be blocked via denylist instead

- **Microsoft Teams** — some features use certificate pinning

- **Yahoo! Mail** — certificate validation issues

If these services break, keep Block Page disabled and rely on NXDOMAIN responses instead.

**Solution**: The certificate must be downloaded in Safari (not a third-party browser) for the

profile install prompt to appear correctly.

**Solution**: Clear the browser's HSTS cache. For Chrome: navigate to

`chrome://net-internals/#hsts` and delete the domain. For Firefox, clear site data in

Preferences → Privacy.

- [NextDNS Help Center — Block Page](https://help.nextdns.io)

- [NextDNS Dashboard — Setup](https://my.nextdns.io)

- [Apple — Certificate Trust Settings](https://support.apple.com/en-us/111900)

### 1.10 Security Settings

**Impact: HIGH (Configuration of advanced threat protection and security features)**

Advanced threat protection and security configuration

Advanced threat protection and security configuration

Configure advanced security features to protect your network from various online threats.

- **Threat Intelligence Feeds**: Block domains identified as distributing malware, launching

  phishing attacks, or hosting command and control servers using highly reputable intelligence feeds

  updated in real-time.

- **AI-Driven Threat Detection (Beta)**: Analyzes DNS queries and answers in real-time to detect and

  block malicious behavior.

- **Google Safe Browsing**: Use Google's technology to block malware and phishing domains.

  - **Caution**: It wasn't designed as a DNS-level blocker and may flag legitimate CNAME domains as

    scams. It can take months to remove a false positive.

- **Cryptojacking Protection**: Prevent unauthorized use of your devices to mine cryptocurrency.

- **DNS Rebinding Protection**: Prevent attackers from taking control of local devices over the

  Internet by automatically blocking DNS responses containing private IP addresses.

- **IDN Homograph Attacks Protection**: Block domains that impersonate other domains by misusing

  characters from different scripts (for example, replacing Latin "e" with Cyrillic "е").

- **Typosquatting Protection**: Block domains registered by malicious actors targeting users who

  mistype website addresses (for example, `gooogle.com` instead of `google.com`).

- **Domain Generation Algorithms (DGAs) Protection**: Block domains generated by algorithms used by

  malware to communicate with command and control servers.

- **Block Newly Registered Domains (NRDs)**: Block domains registered less than 30 days ago.

  - **Caution**: This may cause occasional false positives. If you plan to "set-and-forget",

    consider disabling this.

- **Block Dynamic DNS Hostnames**: Block hostnames from DDNS services. Note that DDNS services can

  still access their own update APIs.

- **Block Parked Domains**: Block single-page websites that often contain ads and low-value or

  potentially malicious content.

- **Block Top-Level Domains (TLDs)**: Block all domains under specific TLDs known for high malicious

  activity.

Blocking these commonly abused TLDs offers protection without much risk to everyday browsing:

1. `.autos`

2. `.best`

3. `.bid`

4. `.boats`

5. `.boston`

6. `.boutique`

7. `.charity`

8. `.christmas`

9. `.dance`

10. `.fishing`

11. `.hair`

12. `.haus`

13. `.loan`

14. `.loans`

15. `.men`

16. `.mom`

17. `.name`

18. `.review`

19. `.rip`

20. `.skin`

21. `.support`

22. `.tattoo`

23. `.tokyo`

24. `.voto`

- **Prevent Overblocking**: Avoid blocking features that have a high rate of false positives unless

  your threat model requires it.

- **Grandma Test**: A configuration is successful if it passes the "Grandma Test"—it should work for

  a typical user without constant manual intervention.

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)

- [NextDNS Help - Security](https://help.nextdns.io/t/g9hdkjz)

### 1.11 Web3 Settings

**Impact: LOW (Enable resolution for decentralized blockchain domains)**

NextDNS supports the resolution of decentralized domains (Web3) based on blockchain technologies.

NextDNS supports the resolution of decentralized domains (Web3) based on blockchain technologies.

Located in the **Settings** tab of your NextDNS dashboard:

1. Navigate to the **Settings** tab.

2. Find the **Web3** section.

3. Toggle the switch to **Enabled**.

When enabled, NextDNS can resolve:

- **ENS (Ethereum Name Service)**: Domains ending in `.eth`.

- **Unstoppable Domains**: Domains ending in `.crypto`, `.nft`, `.x`, and more

- **Handshake (HNS)**: A decentralized naming protocol.

- **IPFS Integration**: Facilitates access to content stored on the InterPlanetary File System.

- ✅ **Native Resolution**: Access decentralized websites directly in any browser without needing

  special extensions (MetaMask, and more) for DNS resolution.

- ✅ **Developer Workflow**: Simplifies testing for decentralized applications (dApps).

Web3 domains are not governed by ICANN. While NextDNS attempts to apply standard security filters,

the decentralized nature of these domains means they may carry different risk profiles than

traditional TLDs.

- [NextDNS Twitter Announcement](https://x.com/NextDNS/status/1491034351391305731)

---

## 2. Efficiency rules

**Impact: MEDIUM**

### 2.1 Multiple Profiles Strategy

**Impact: MEDIUM (Using a single profile for all devices causes over-blocking on some devices and under-protection on others, with no way to tune without affecting everyone)**

Organise multiple NextDNS profiles to give each device category the right level of protection

Organise multiple NextDNS profiles to give each device category the right level of protection

A single NextDNS profile applied to all devices is a compromise that satisfies no one — too

aggressive for IoT devices that break, too lenient for children's devices that need filtering. The

recommended approach is to create distinct profiles for each category of device and assign them

appropriately via the NextDNS CLI, apps, or per-device configuration.

Used by: Smart TVs, game consoles, IoT devices, guest network — anything that cannot run the

NextDNS app.

Used by: Personal laptops, phones, tablets of adults.

Used by: Children's tablets, phones, gaming devices.

Used by: Temporary visitors, untrusted devices.

Segment your network with VLANs and assign a different DNS server (NextDNS linked IP or CLI

profile) per VLAN — children's devices on VLAN 20, personal on VLAN 10, IoT on VLAN 30.

On each personal device, install the NextDNS app and configure it with the appropriate profile ID.

This overrides any router-level DNS.

Use consistent naming to avoid confusion in the dashboard:

| Pattern | Example |

|---------|---------|

| `[Location] - [Level]` | `Router - Stable`, `Office - Advanced` |

| `[Person] - [Device]` | `Alice - Phone`, `Bob - Laptop` |

| `[Purpose] - [Age]` | `Kids - Under12`, `Teen - 13to17` |

- **Start with fewer profiles** and split only when needed — each profile requires separate

  maintenance.

- **Share blocklists across profiles** but adjust security features individually per profile.

- **Use the Kids profile as a template** — duplicate it with the profile copy pattern and adjust

  recreation time per child.

- **Review profiles quarterly** — children grow up, IoT devices change, and blocklists improve.

- **Keep one "break glass" profile** with minimal blocking that you can switch to quickly when

  troubleshooting breakage.

Navigate to **Logs** in the NextDNS dashboard → filter by client IP or device name → the **Profile**

column shows which profile handled each query.

The device may have cached the old DNS assignment. Force a DHCP renewal or reconnect to Wi-Fi to

pick up the new profile assignment.

- [NextDNS CLI — Conditional Profile](https://github.com/nextdns/nextdns/wiki/Conditional-Profile)

- [NextDNS-Config Guidelines](https://github.com/yokoffing/NextDNS-Config)

### 2.2 Recommended Configuration Guidelines

**Impact: HIGH (Strategic configuration to maximize protection while minimizing breakage)**

Based on the [NextDNS-Config](https://github.com/yokoffing/NextDNS-Config) guidelines, these

Based on the [NextDNS-Config](https://github.com/yokoffing/NextDNS-Config) guidelines, these

settings provide an optimal balance between security, privacy, and usability.

A successful configuration should generally work without intervention ("pass the Grandma test").

- **Threat Intelligence**: ✅ **Enabled**.

- **AI-Driven Detection**: ⚠️ **Disabled** (Beta, potential for false positives).

- **Google Safe Browsing**: ❌ **Disabled** (Not designed for DNS-level, slow to clear false

  positives).

- **NRDs (Newly Registered Domains)**: ✅ **Enabled**, but disable if you don't plan to maintain

  your allowlist.

Avoid adding dozens of blocklists. Diminishing returns lead to higher latency and frequent breakage.

| Profile Type                | Strategy           | Recommended Lists            |

| :-------------------------- | :----------------- | :--------------------------- |

| **Router (Default)**        | High Compatibility | HaGeZi - Multi NORMAL + OISD |

| **Personal (Advanced)**     | High Privacy       | HaGeZi - Multi PRO           |

| **Hardened (Experimental)** | Aggressive         | HaGeZi - Multi PRO++         |

Always block Apple's Private Relay if you want NextDNS to see individual device traffic:

- `mask.icloud.com`

- `mask-h2.icloud.com`

- ✅ **Cache Boost**: **Enabled**. High TTL values for cache-friendly responses.

- ✅ **ECS**: **Enabled** (Anonymized). Improves performance with Anycast networks/CDNs.

- ❌ **CNAME Flattening**: **Disabled** by default. Can break compatibility with Yahoo Mail and

  certain complex records.

1. Use 1-2 high-quality blocklists (HaGeZi/OISD).

2. Enable essential security features (Rebinding, Homographs, Typosquatting).

3. Allow "Affiliate and Tracking Links" to prevent email/browsing breakage.

4. Enable "Cache Boost".

- [NextDNS-Config Guidelines](https://github.com/yokoffing/NextDNS-Config)

### 2.3 Setup Optimization

**Impact: LOW (Efficiency best practices for dashboard configuration and performance)**

Performance and management efficiency

Performance and management efficiency

Tips for getting the best performance and reliability out of your NextDNS configuration.

- **Enable Cache Boost**: This reduces the number of queries your devices need to make by telling

  them to remember DNS answers for longer.

- **Use CNAME Flattening**: This streamlines the DNS resolution process for domains that use many

  CNAME aliases.

- **Select Local Storage**: For the best latency in dashboard interactions, choose a log storage

  location near you, though this is primarily for compliance.

- Create separate profiles for different use cases (for example, "Parental Control" for kids' devices,

  "Minimal" for gaming PCs) to avoid one-size-fits-all frustration.

- Regularly audit your **Allowlist** to remove entries that are no longer needed.

- [NextDNS Help Center](https://help.nextdns.io)

### 2.4 Threat Modeling & Strategy

**Impact: LOW ()**

Efficient approach to long-term DNS management

Efficient approach to long-term DNS management

DNS configuration is a spectrum between absolute security/privacy and complete usability. Use these

guidelines to find your balance.

A DNS configuration is considered "stable" if it passes the **Grandma Test**:

- The user shouldn't have to troubleshoot the network for everyday tasks.

- Major apps (Bank, Teams, Netflix) should work without manual adjustment.

- Websites should load correctly without HTTPS warnings.

Avoid "overblocking." Adding more and more blocklists doesn't necessarily make you more secure but

significantly increases the risk of "breakage" (legitimate sites not working).

- Stick to 1-2 high-quality maintained lists (like **HaGeZi** and **OISD**).

- Prefer a "NORMAL" profile for network-wide (Router) use.

- Use an "AGGRESSIVE" profile only on individual devices where you can easily toggle it off or fix

  it.

Instead of one massive profile, divide your configurations

- **Profile A (Stable)**: Minimal blocking. Used on Routers and IoT devices.

- **Profile B (Personal)**: Moderate blocking. Used on personal laptops/phones.

- **Profile C (Kids)**: High parental control and category blocking.

1. Periodically check your **Analytics** to see if specific rules are over-blocking.

2. Review the **Allowlist** and remove entries that were only meant to be temporary.

3. Keep the **NextDNS CLI** and apps updated to the latest versions.

- [NextDNS Help - Security](https://help.nextdns.io/t/g9hdkjz)

### 2.5 Troubleshooting via Web UI

**Impact: MEDIUM (Debugging false positives and connectivity issues using dashboard tools)**

Efficient resolution of blocked content and false positives

Efficient resolution of blocked content and false positives

How to identify and resolve issues when something isn't working as expected.

1. **Verify the Issue**: If a site is not loading, first check if it's a DNS issue by disabling

   NextDNS temporarily or checking if it works on a different network.

2. **Check the Logs**: Go to the **Logs** tab and refresh.

3. **Filter by Blocked**: Switch to "Blocked Queries Only".

4. **Identify the Culprit**: Look for the domain of the site you're trying to reach. Hover over the

   ⓘ icon to see which list is blocking it.

5. **Quick Fix**: Click the checkmark icon to add it to your **Allowlist** immediately.

6. **Reload the Site**: Flush your local DNS cache or restart your browser to see if the site now

   loads.

- **HTTPS Warnings**: Usually caused by the **Block Page** feature. If this is annoying, disable the

  "Block Page" in Settings.

- **Latency**: If DNS resolution feels slow, check if **Anonymized EDNS Client Subnet** is enabled.

- **Missing Clients**: If logs don't show device names, ensure you are using a protocol that

  supports client identification (DoH, DoT, or the NextDNS CLI/App).

- [NextDNS Help Center](https://help.nextdns.io)

---

