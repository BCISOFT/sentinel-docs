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
| IP whitelist | empty | IP addresses that are never banned |
| Whitelist maintenance IPs | On | Also protect the PrestaShop maintenance IPs (`PS_MAINTENANCE_IP`) |
| Trust X-Forwarded-For | Off | Use the `X-Forwarded-For` header to resolve the client IP (only behind a trusted proxy) |

## Whitelist and blacklist

- **Whitelist**: combines the PrestaShop maintenance IPs with any IP you add manually. A whitelisted IP is never counted, banned, or blocked — this is the safeguard that prevents an administrator from locking themselves out. Make sure your own IP is whitelisted.
- **Manual blacklist**: you can permanently ban an IP from the back-office page. Permanent bans never expire and must be removed manually.

## Managing bans

The Brute-force Protection page lists all active bans (IP, type, reason, ban date, expiry, attempt count) and lets you unban any IP with a single click. Clicking the attempt count opens a modal listing the email addresses that were tried from that IP (sourced from the failed-login security logs).

## Dashboard overview

The Sentinel dashboard and the PrestaShop home widget display a brute-force summary: number of active bans, total banned IPs, failed attempts over the last 24 hours, and the most recent bans. The summary is only shown with a Pro subscription; otherwise an upgrade prompt is displayed. The dashboard also shows, next to it, the top email addresses tried in failed back-office logins.

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
- **Proxies**: by default the client IP is read from `REMOTE_ADDR`. The `X-Forwarded-For` header is spoofable, so it is only trusted when you explicitly enable the corresponding setting and your store sits behind a controlled reverse proxy.
- Whitelist entries are matched by exact IP address (CIDR ranges are not supported).

---

**Next:** [Security Logs](./security-logs.md)
