---
sidebar_position: 4
---

# DDoS Protection

:::tip Pro Feature
DDoS protection is available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

Sentinel counts the requests made by each IP address and slows down, then blocks, addresses that go far beyond normal browsing.

Settings live in the back-office under **Sentinel → DDoS Protection**. The **Trusted IPs** and **Behind a proxy or a CDN?** cards appear on both this page and the Brute-force Protection page and edit the same shared configuration, so a single trusted-IP list covers both.

## How it works

1. **Counting**: every request is counted per IP address over a sliding window.
2. **Throttling**: past the throttle threshold, requests receive an HTTP `429 Too Many Requests` response with a `Retry-After` header. The address is not banned.
3. **Banning**: past the ban threshold, the address is banned for the configured duration and appears in the ban list.
4. **Automatic release**: bans expire on their own. Repeat offenders get progressively longer bans, capped at 24 hours.

`429` is used rather than `403` because it means "temporary": search engines retry later instead of dropping your pages from their index.

## Settings

Two controls cover the common case:

- **Protection** — `Off`, `Monitor` or `On`.
- **Sensitivity** — `Relaxed`, `Balanced` (default) or `Strict`. This is the only knob most shops need: it sets the request thresholds and the ban duration for you. `Relaxed` tolerates more traffic before acting; `Strict` reacts sooner.

Everything else lives under **Advanced** and never needs to be touched for a normal setup: the exact per-window thresholds, ban duration, excluded URLs, safety threshold, verified-crawler and repeat-offender toggles, and the per-network / per-path / spike / Redis options described below. Editing any threshold by hand switches Sensitivity to `Custom`.

### Monitor mode

In **Monitor** mode Sentinel counts and reports without blocking anything. The statistics show what *would* have been blocked. Use it for a few days if you want to confirm the thresholds against your own traffic before switching Protection to `On`.

## What is never limited

- **Trusted IPs**, including the PrestaShop maintenance IPs (the list is shared with brute-force protection).
- **Logged-in employees**: back-office work generates bursts that front-office thresholds are not sized for.
- **Verified search engine crawlers**: Googlebot, Bingbot and others are confirmed by forward-confirmed reverse DNS, so a spoofed user-agent does not get the exemption.
- **Excluded URLs**, pre-filled with the usual payment callback paths. Keep your payment notification URLs here: a rejected notification never becomes an order.
- **Static assets** and command-line execution.

## The safety threshold

If more than the configured share of your traffic gets blocked over an hour, Sentinel **suspends enforcement by itself**, shows a warning in the back-office, and keeps counting.

This exists for one scenario in particular: a reverse proxy that has not been declared in the **Behind a proxy or a CDN?** card. Every visitor is then seen under the same address, that single address exceeds every threshold, and the whole storefront would ban itself. Rather than let that happen, Sentinel stops enforcing and tells you.

Once the configuration is fixed, click **Resume enforcement** (or run `sentinel:rate-limit resume`). Enforcement also resumes on its own after one hour.

:::caution Behind a reverse proxy or a CDN
Declare your infrastructure in the **Behind a proxy or a CDN?** card on the same page — Sentinel detects Cloudflare or a reverse proxy in front of your store and offers a one-click fix. Without that, Sentinel deliberately ignores forwarded headers and sees your proxy's address instead of your visitors'.
:::

## Statistics

The page shows, for the last 24 hours: requests analysed, requests throttled, rate-limit bans, and the share of traffic blocked. Figures are aggregated hourly rather than logged per request, so the protection does not become a load problem of its own.

The Sentinel dashboard also surfaces the protection: a KPI with the requests blocked over the last 24 hours, and a dedicated card showing active bans, IPs banned over the last 24 hours, blocked requests, and the most recent bans. Without a Pro subscription an upgrade prompt is displayed instead.

## Coverage

A banner shows which coverage is active:

- **Extended** — [Auto Prepend Protection](./auto-prepend-protection.md) is enabled, so requests are filtered before PrestaShop starts.
- **Limited** — only requests routed by PrestaShop are filtered. The protection works, but each blocked request still costs a full PrestaShop startup.

Extended coverage is worth enabling wherever your hosting allows it, for two reasons:

- **Cost.** Reaching a decision before PrestaShop starts takes around 0.2 ms, against roughly 130 ms to boot PrestaShop and open its database connections. Under a flood, that is the difference between shedding traffic and being flattened by it.
- **Reach.** PHP files that are not part of PrestaShop — a script dropped in an upload directory, a forgotten installer — never reach the router, so no PrestaShop hook can see them. Only this stage does.

Settings are read from a small file Sentinel exports whenever you save them, so this stage needs neither the database nor PrestaShop itself. If that file is missing or unreadable, requests simply pass: the protection can stop working, but it cannot take the shop down.

## Advanced settings

These sit behind the **Advanced** section and are all off, or empty, by default.

### Per-network limit

Counts requests per network — a `/24` for IPv4, a `/64` for IPv6 — in addition to per address. It catches an attacker spread across a range, where every individual address stays under its own ceiling.

A network is **only ever throttled, never banned**: a `/24` may be a whole ISP pool or an office, and banning it would take out every legitimate visitor behind it.

### Per-path limits

One rule per line, a path then its own limit:

```
/connexion 20
/recherche 40
/module/*/pay 5
```

Matching is by prefix, or with `*` wildcards, and the first matching rule wins. Each path gets **its own budget**, so browsing the catalogue never consumes the login allowance — and a strict login limit does not penalise normal browsing.

This is what a single global threshold cannot express: set it low enough to protect the login form and ordinary browsing breaks.

### Automatic tightening during a spike

When total traffic over one window exceeds the spike threshold, every limit is **divided by four for ten minutes**, then re-evaluated.

This addresses what per-address limits structurally cannot: a flood spread thinly over thousands of addresses, each staying under its own ceiling. Nothing individually looks abnormal, yet the shop is being saturated.

The back-office and `sentinel:rate-limit status` both show when the regime is engaged, and **Resume enforcement** releases it early.

### Redis

By default counters live in files, local to one server. If several servers run the same shop, an attacker gets a full budget on each of them.

Setting a Redis DSN (`redis://127.0.0.1:6379/0`, optionally with a password: `redis://:secret@host:6379/0`) gives every server a single shared view. Leave it empty on a single-server shop — it buys nothing there. If Redis becomes unreachable, the limiter falls back to the local backend rather than failing.

## Command line

```bash
# Current mode, thresholds, backend and traffic figures
php bin/console sentinel:rate-limit status
php bin/console sentinel:rate-limit status --json

# What the limiter currently thinks of an address (counts nothing)
php bin/console sentinel:rate-limit test 203.0.113.10

# Clear an address: counters plus any rate-limit ban
php bin/console sentinel:rate-limit reset 203.0.113.10

# Resume enforcement after the safety threshold suspended it
php bin/console sentinel:rate-limit resume

# Write the current counters to the statistics table
php bin/console sentinel:rate-limit flush

# Remove old statistics and expired counters
php bin/console sentinel:rate-limit purge
```

`reset` is the recovery path if a legitimate visitor is caught.

## Requirements

None. The protection runs on stock PHP: no extension to install, no package to add, no server configuration to change.

Counters are stored in files, which works on every host. Redis is used when you explicitly configure it, but it is never required. The features above behave identically either way; only the storage differs.

## Notes and limits

- **Shared addresses**: counting is per IP, so visitors behind a corporate NAT, mobile CGNAT or a school network share one counter. This is why the default thresholds are generous.
- **Counter storage**: counters are kept in files (or Redis when configured). They may reset when the server restarts; bans are stored in the database and are not affected.
- **Scope**: this protects against application-level floods, aggressive scraping and bot traffic. A volumetric network-level attack saturates the server before any PHP code runs, and no PHP module can address that.
