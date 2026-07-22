---
sidebar_position: 3
---

# Brute-force Protection

:::tip Pro Feature
Brute-force protection and automatic IP banning are available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

Sentinel detects repeated failed login attempts on the PrestaShop back-office and automatically bans the offending IP addresses for a configurable period.

## How it works

1. **Attempt tracking**: Every failed back-office login is recorded per IP address.
2. **Threshold detection**: When an IP exceeds the configured number of attempts within the time window, it is banned automatically.
3. **Back-office blocking**: A banned IP receives an HTTP 403 response on any back-office access until the ban expires. The front-office (storefront) remains fully accessible.
4. **Automatic release**: Temporary bans expire on their own — no manual action or cron is required.

Only back-office access is blocked, so legitimate customers sharing the same IP (for example behind a NAT) can still browse and order on the storefront.

## Settings

The settings are available in the back-office under **Sentinel → Brute-force Protection**:

| Setting | Default | Description |
| --- | --- | --- |
| Enable brute-force protection | On | Master on/off switch |
| Maximum attempts | 5 | Number of failed logins before a ban |
| Time window | 900 s (15 min) | Period over which attempts are counted |
| Ban duration | 3600 s (1 h) | How long an automatic ban lasts |

## Trusted IPs

The **Trusted IPs** card manages the shared whitelist used by every protection (brute-force and DDoS): a trusted address is never counted, banned or blocked. Each entry can carry a free-text comment ("Office", "Monitoring probe", …) so the list stays understandable over time, and an **Add my current IP** button adds the address you are browsing from in one click — the safeguard that prevents an administrator from locking themselves out. Entries accept exact addresses and CIDR ranges. A toggle also trusts the PrestaShop maintenance IPs (`PS_MAINTENANCE_IP`).

The same card appears on the DDoS Protection page and edits the same list.

## Behind a proxy or a CDN

The **Behind a proxy or a CDN?** card configures how Sentinel resolves the real visitor IP. Without it, a store behind Cloudflare or a reverse proxy sees all its visitors under the proxy's address, and the protections cannot tell them apart.

- Sentinel inspects the request you are making from the back-office and, when it detects Cloudflare or a reverse proxy that is not trusted yet, offers a **one-click** fix.
- The **Cloudflare** toggle trusts Cloudflare's published ranges without pasting a single CIDR.
- **Other reverse proxies** accepts your own proxy addresses or CIDR ranges.

Forwarded headers are only honoured when the request genuinely comes from a declared proxy, so a visitor cannot forge their IP.

## Blacklist

The **Manual blacklist** form permanently bans an IP, with an optional comment stored as the ban's reason so you remember why it is there. Permanent bans never expire and must be removed manually.

## Managing bans

The Brute-force Protection page lists all active bans (IP, type, reason, ban date, expiry, attempt count) and lets you unban any IP with a single click. Clicking the attempt count opens a modal listing the email addresses that were tried from that IP (sourced from the failed-login security logs). A ban whose address is also in the trusted IPs list is flagged with a **Trusted** badge: that address is no longer blocked.

## Dashboard overview

The Sentinel dashboard displays a brute-force summary: number of active bans, total banned IPs, failed attempts over the last 24 hours, and the most recent bans. The summary is only shown with a Pro subscription; otherwise an upgrade prompt is displayed. The dashboard also shows, next to it, the top email addresses tried in failed back-office logins.

The PrestaShop home widget shows an **Active Protection** section with one card per licensed protection (brute force and DDoS), each displaying the active bans with the last-24-hours count in parentheses — e.g. "15 (3)". Each card links to its management page.

## Command line

Bans can also be managed from the CLI:

```bash
# Ban an IP for the configured duration
php bin/console sentinel:brute-force ban 203.0.113.10

# Ban an IP for a custom duration (seconds)
php bin/console sentinel:brute-force ban 203.0.113.10 --duration=7200 --reason="Suspicious activity"

# Permanently blacklist an IP
php bin/console sentinel:brute-force ban 203.0.113.10 --permanent

# Unban an IP
php bin/console sentinel:brute-force unban 203.0.113.10

# List all bans (add --json for machine-readable output)
php bin/console sentinel:brute-force list

# Purge expired bans and stale attempts
php bin/console sentinel:brute-force purge
```

The `unban` command is the recommended recovery path if an administrator is ever locked out of the back-office.

## Notes on IP resolution

- **IPv6** addresses are supported and normalized before storage and comparison.
- **Proxies**: by default the client IP is read from `REMOTE_ADDR`. Forwarded headers are spoofable, so `X-Forwarded-For` is only read when the request reaches you from a declared proxy (the Cloudflare preset or **Other reverse proxies**), and the chain is walked from right to left so that entries an attacker prepended are ignored. `CF-Connecting-IP` is additionally only trusted when the request originates from a published Cloudflare range.
- Declaring a proxy is what enables this hardened behaviour. Until you do, installations upgraded from an earlier version keep the previous handling of the legacy *Trust X-Forwarded-For* setting, so bans and logs stay keyed by the same address as before.
- **Trusted IP entries** accept exact addresses and CIDR ranges (`203.0.113.0/24`, `2001:db8::/32`). IPv4-mapped IPv6 addresses match their IPv4 form.

---

**Next:** [Security Logs](./security-logs.md)
