---
sidebar_position: 1
---

# Threat Detection

Sentinel detects and blocks malicious requests automatically using signature-based pattern matching.

## How it works

1. **Request Analysis**: Every HTTP request is analyzed before reaching PrestaShop
2. **Pattern Matching**: The request is compared against many pre-configured threat signatures
3. **Instant Blocking**: If a malicious pattern is detected, the request is blocked with HTTP 403
4. **Logging**: All detected attacks are logged with details (IP, URI, pattern matched)

## Protected Threats

### SQL Injection

Detects attempts to manipulate your database:

```
Example: /index.php?id=1' AND SELECT SLEEP(5)--
```

Sentinel blocks patterns like:

- `SELECT ... SLEEP ...`
- `UNION SELECT ...`
- SQL keywords in suspicious contexts

### File Operations

Detects attempts to write malicious files:

```
Example: file_put_contents('shell.php', '<?php ...')
```

Blocks attempts to:

- Write files with `file_put_contents`
- Download remote code with `wget`
- Modify PHP configuration with `ini_set`

### Command Execution

Prevents execution of system commands:

```
Example: system('rm -rf /')
```

### Module Exploits

Detects known vulnerabilities in popular PrestaShop modules:

- Product Search module
- Blog modules (CSBlog, SmartBlog, etc.)
- Payment modules

## When an attack is detected

1. **Request is blocked** with HTTP 403 Forbidden
2. **Custom page is displayed** to the attacker
3. **Attack is logged** in `/var/logs/sentinel-YYYY-MM-DD.log`
4. **Context is recorded**: IP address, URI, matched pattern, request data

## Example of blocked request

When someone tries:

```
https://yourstore.com/index.php?search=SELECT SLEEP(10)
```

They see:

```
HTTP 403 Forbidden
Access Denied
Your request has been blocked for security reasons.
```

And Sentinel logs:

```json
{
  "ip": "192.168.1.100",
  "uri": "/index.php?search=SELECT SLEEP(10)",
  "pattern": "(.*)select(.*)sleep(.*)",
  "method": "GET"
}
```

---

**Next:** [Security Logs](./security-logs.md)
