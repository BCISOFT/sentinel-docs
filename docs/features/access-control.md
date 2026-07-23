---
sidebar_position: 5
---

# Access Control

Sentinel can restrict back-office access to a whitelist of IP addresses. When the whitelist is enabled, any visitor whose address is not on the list is redirected to the front-office 404 page — the admin panel simply appears not to exist.

This feature is **free** and available to every Sentinel user.

## How it works

1. **Whitelist check**: On every back-office request, Sentinel resolves the visitor's real IP address (proxy and CDN aware, shared with the other protections) and compares it against the whitelist.
2. **Stealth blocking**: If the address does not match any entry, the visitor is redirected to the shop's 404 page. No login form, no error message — nothing reveals that a back office exists at this URL.
3. **Logging**: Every blocked attempt is recorded in the [Security Logs](./security-logs.md) with the event type *Back Office Access Blocked*, including the IP address, the requested URI and the user agent.

The front office is never affected: customers can browse and order normally regardless of the whitelist.

## Configuration

Open **Sentinel > Access Control** in the back office.

- **Enable back office IP whitelist**: turns the protection on or off.
- **IP list**: add one address per entry, with an optional comment (e.g. "Office", "Home VPN"). Both IPv4 and IPv6 are supported, as well as CIDR ranges such as `203.0.113.0/24` or `2001:db8::/32`.
- **Add my current IP**: one-click shortcut that adds the address you are currently browsing from.

Changes are saved automatically as you add or remove entries.

## Behind a proxy or a CDN

If your store sits behind Cloudflare, a CDN, a load balancer or a reverse proxy, **declare it in the "Behind a proxy or a CDN?" card on the same page** before enabling the whitelist. Without this, every visitor reaches your server with the proxy's address:

- whitelisting "your current IP" would actually whitelist the proxy, letting **everyone** through;
- behind Cloudflare, the edge address even changes between requests, which could lock you out right after enabling.

Sentinel detects the most common setups (Cloudflare, local reverse proxy) and offers a one-click "Trust" button when something looks misconfigured. This proxy configuration is shared with the other protections (brute-force, DDoS) and is available to all users, free and Pro.

The "Add my current IP (x.x.x.x)" button always shows the address **as the server resolves it** — if that address is not the one you expect, fix the proxy configuration first.

## Lockout protection

Locking yourself out of your own back office is the main risk of this kind of feature. Sentinel guards against it in several ways:

- The whitelist cannot be enabled unless your current IP address matches one of the entries.
- Removing your own address from the list while the whitelist is enabled is refused.
- An **empty list never blocks**: the whitelist only takes effect once it contains at least one address.
- Command-line access (`bin/console`) is never restricted.

If you still end up locked out (for example, your ISP changed your IP address), delete the `SENTINEL_BO_WHITELIST_ENABLED` value from the `ps_configuration` table, or ask your hosting provider to do it:

```sql
DELETE FROM ps_configuration WHERE name = 'SENTINEL_BO_WHITELIST_ENABLED';
```

## Good practices

- Prefer **CIDR ranges** over single addresses if your ISP does not provide a fixed IP.
- Add a **comment** to every entry so you know later why it was added.
- If your team works remotely, consider routing back-office access through a **VPN** with a fixed egress IP and whitelisting only that address.
