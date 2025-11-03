---
sidebar_position: 2
---

# Security Logs

Sentinel logs all security events to help you monitor threats against your store.

## Log Location

Logs are stored in: `/var/logs/sentinel-YYYY-MM-DD.log`

Example: `/var/logs/sentinel-2025-10-29.log`

## Log Format

Each attack is logged with:

```
[2025-10-29 14:35:22] [WARNING] ATTACK DETECTED - Pattern: (.*)select(.*)sleep(.*)
{
  "ip": "192.168.1.100",
  "uri": "/index.php?id=1 AND SELECT SLEEP(5)",
  "method": "GET",
  "signature_pattern": "(.*)select(.*)sleep(.*)",
  "request_body_sample": "SELECT SLEEP(5)",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-10-29 14:35:22"
}
```

## Log Rotation

- **Frequency**: Daily (new file each day)
- **Retention**: 7 days (older files automatically deleted)
- **Naming**: `sentinel-YYYY-MM-DD.log`

## Viewing Logs

### Via Command Line

**View today's attacks:**

```bash
tail -f /var/logs/sentinel-$(date +%Y-%m-%d).log
```

**Count attacks:**

```bash
grep "ATTACK DETECTED" /var/logs/sentinel-*.log | wc -l
```

**Find attacks from specific IP:**

```bash
grep "192.168.1.100" /var/logs/sentinel-*.log
```

**Most common attack patterns:**

```bash
grep "ATTACK DETECTED" /var/logs/sentinel-*.log | \
  grep -oP 'Pattern: [^"]*' | \
  sort | uniq -c | sort -rn | head -10
```

## Sensitive Data Protection

Sentinel automatically redacts sensitive information in logs:

**Protected fields:**

- `password`, `passwd`, `pwd`
- `secret`, `token`, `api_key`

**Example:**

```json
Request: username=admin&password=secret123
Logged as: username=admin&password=***REDACTED***
```

## What to do with logs

### Daily Monitoring

1. Check for attack increases
2. Identify recurring attacking IPs
3. Spot patterns in attack types

### When Attacks are Detected

1. **Identify the threat**: What pattern was matched?
2. **Check the IP**: Is it a repeat offender?
3. **Take action**:
   - Block the IP at firewall level
   - Report to hosting provider
   - Monitor for similar patterns

### Archive Important Logs

Before logs are rotated (after 7 days), archive them if needed:

```bash
cp /var/logs/sentinel-2025-10-22.log /path/to/archive/
```

## Troubleshooting

### No Logs Created

Check permissions:

```bash
chmod 755 /var/logs
ls -la /var/logs
```
