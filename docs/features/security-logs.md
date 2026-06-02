---
sidebar_position: 5
---

# Security Logs

Sentinel records all security events to help you monitor threats against your store.

## Log Location

Logs are stored in: `/var/logs/sentinel-YYYY-MM-DD.log`

Example: `/var/logs/sentinel-2025-12-17.log`

## Log Types

Sentinel generates several types of logs depending on detected events.

### 1. Attack Detection (URI Signature)

When a malicious signature is detected in a request:

```json
[2025-12-17 14:35:22] [WARNING] ATTACK DETECTED - Pattern: (.*)select(.*)sleep(.*)
{
  "ip": "192.168.1.100",
  "uri": "/index.php?id=1 AND SELECT SLEEP(5)",
  "method": "GET",
  "signature_pattern": "(.*)select(.*)sleep(.*)",
  "signature_target": "/modules/vulnerable/",
  "request_body_sample": "SELECT SLEEP(5)",
  "get_params": {"id": "1 AND SELECT SLEEP(5)"},
  "post_params": {},
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 14:35:22"
}
```

### 2. Failed Login Attempts

Failed back-office login attempts:

```json
[2025-12-17 10:15:30] [WARNING] FAILED LOGIN ATTEMPT - Email: admin@test.com
{
  "ip": "192.168.1.50",
  "uri": "/admin/index.php?controller=AdminLogin",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 10:15:30"
}
```

### 3. POST Requests

All POST requests are logged with their payload:

```json
[2025-12-17 11:20:15] [INFO] POST REQUEST
{
  "ip": "192.168.1.75",
  "uri": "/admin/index.php?controller=AdminProducts",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 11:20:15",
  "post_data": {
    "name": "New product",
    "price": "19.99"
  },
  "raw_body": "name=New+product&price=19.99"
}
```

### 4. PUT/PATCH/DELETE Requests

Modification/deletion requests via API:

```json
[2025-12-17 12:30:45] [INFO] PUT REQUEST
{
  "ip": "192.168.1.80",
  "uri": "/api/products/123",
  "method": "PUT",
  "user_agent": "APIClient/1.0",
  "timestamp": "2025-12-17 12:30:45",
  "raw_body": "{\"price\": \"24.99\"}"
}
```

### 5. Auto Prepend File

Direct PHP file access (see [Auto Prepend Protection](./auto-prepend-protection.md)):

```json
[2025-12-17 13:45:10] [INFO] AUTO PREPEND FILE
{
  "ip": "192.168.1.90",
  "uri": "/modules/oldmodule/upload.php",
  "method": "POST",
  "user_agent": "curl/7.68.0",
  "timestamp": "2025-12-17 13:45:10",
  "source": "auto_prepend",
  "post_data": {"action": "upload"},
  "files": {
    "file": {
      "name": "shell.php",
      "size": 1234,
      "type": "application/x-php"
    }
  }
}
```

## Log Rotation

- **Frequency**: Daily (new file each day)
- **Retention**: 7 days (older files automatically deleted)
- **Naming**: `sentinel-YYYY-MM-DD.log`

## Viewing Logs

### Via Back-Office

To view security logs from the back-office:

1. Log in to your PrestaShop back-office
2. Go to **Modules > Sentinel > Security Logs**
3. Use filters to search by date, IP, type, severity, or blocked status

The logs table includes a **Status** column that shows explicitly whether each
event was blocked:

- **Blocked**: the request was stopped by Sentinel (HTTP 403). Detected attacks
  are always blocked.
- **Not blocked**: the event was only recorded (for example failed logins or
  logged POST/PUT/PATCH/DELETE requests), the request was allowed to proceed.

The same status is shown in the event details dialog.

### Via Sentinel Command

Sentinel provides a dedicated command to view and manage logs:

**View recent logs:**

```bash
php bin/console sentinel:logs
```

**Filter by type:**

```bash
php bin/console sentinel:logs --type=attack
php bin/console sentinel:logs --type=login_failed
php bin/console sentinel:logs --type=post_request
```

**Filter by severity:**

```bash
php bin/console sentinel:logs --severity=warning
php bin/console sentinel:logs --severity=critical
```

**Filter by IP address:**

```bash
php bin/console sentinel:logs --ip=192.168.1.100
```

**Filter by date range:**

```bash
php bin/console sentinel:logs --from="2025-01-01" --to="2025-01-31"
```

**Limit results:**

```bash
php bin/console sentinel:logs --limit=50
```

**Output as JSON:**

```bash
php bin/console sentinel:logs --json
```

**Clear all logs:**

```bash
php bin/console sentinel:logs --clear
```

### Via System Command Line

**View today's events:**

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

**View all failed login attempts:**

```bash
grep "FAILED LOGIN ATTEMPT" /var/logs/sentinel-*.log
```

**View Auto Prepend File access:**

```bash
grep "AUTO PREPEND FILE" /var/logs/sentinel-*.log
```

**View all today's POST requests:**

```bash
grep "POST REQUEST" /var/logs/sentinel-$(date +%Y-%m-%d).log
```

## Sensitive Data Protection

Sentinel automatically masks sensitive information in logs:

**Protected fields:**

Passwords:

- `password`, `passwd`, `pwd`, `motdepasse`, `motpasse`, `pass`
- `repeat_password`, `password_confirmation`, `new_password`, `old_password`

Tokens and authentication:

- `secret`, `token`, `api_key`, `apikey`, `access_token`, `refresh_token`
- `bearer`, `auth`, `authorization`, `oauth`, `jwt`, `session`

Private keys:

- `private_key`, `priv_key`, `ssh_key`, `key`, `pem`, `certificate`

Banking information:

- `credit_card`, `card_number`, `cvv`, `cvv2`, `cvc`, `iban`, `swift`

Other:

- `ssn`, `pin`, `cookie`, `encryption_key`, `salt`, `hash`, `signature`

**Example:**

```json
Request: username=admin&password=secret123&api_key=abc123
Logged: username=admin&password=********&api_key=********
```

## What to do with logs

### Daily Monitoring

1. Check for attack increases
2. Identify recurring attacking IPs
3. Spot attack patterns

### When Attacks are Detected

1. **Identify the threat**: What pattern was matched?
2. **Check the IP**: Is it a repeat offender?
3. **Take action**:
   - Block the IP at server level
   - Report to hosting provider
   - Monitor for similar patterns

### Analyze Failed Login Attempts

If you see many failed login attempts:

1. Check if the IP corresponds to a legitimate administrator
2. If not, block the IP (brute force attack)
3. Consider enabling 2FA system

### Monitor Direct PHP File Access

Auto Prepend File logs can reveal:

1. Attempts to exploit vulnerable modules
2. Malicious file uploads
3. Access to files that shouldn't be directly accessible

## Forensic Analysis

In case of security incident, Sentinel logs allow:

### 1. Reconstruct Timeline

```bash
# All events from a suspicious IP
grep "192.168.1.100" /var/logs/sentinel-*.log | sort
```

### 2. Identify Entry Point

```bash
# First event from the attacker
grep "192.168.1.100" /var/logs/sentinel-*.log | head -1
```

### 3. View All Targeted Files

```bash
# All directly accessed PHP files
grep "AUTO PREPEND FILE" /var/logs/sentinel-*.log | grep "192.168.1.100"
```

### 4. Analyze Payloads

Logs contain complete POST request payloads, allowing you to understand exactly what the attacker attempted.

## Troubleshooting

### No Logs Created

Check permissions:

```bash
chmod 755 /var/logs
ls -la /var/logs
```

### Logs Too Large

If logs become too large:

1. Reduce retention period (modify `LOG_RETENTION_DAYS` in `SecurityLogger.php`)
2. Archive old logs
3. Consider filtering certain log types (e.g., disable logging all POST requests)

### Missing Logs After Rotation

If logs disappear after rotation, check:

1. `/var/logs` directory permissions
2. That the web server can write to this directory
3. That Monolog is correctly installed (`composer install`)

---

**See also:**

- [Threat Detection](./threat-detection.md)
- [Auto Prepend Protection](./auto-prepend-protection.md)
- [Vulnerability Scanner](./vulnerability-scanner.md)
