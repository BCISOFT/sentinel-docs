---
sidebar_position: 5
---

# Auto Prepend File Protection

:::tip Pro Feature
Auto Prepend File protection is available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

The **Auto Prepend File** protection is an additional security layer that protects your site against direct access to PHP files, bypassing PrestaShop security.

## Why is it important?

By default, Sentinel only protects your site when requests go through the PrestaShop system (via `index.php`). However, an attacker could try to directly access a vulnerable PHP file:

```
https://yourstore.com/modules/vulnerablemodule/exploit.php
```

This request would **not go through** Sentinel as it doesn't pass through the PrestaShop dispatcher.

## How it works

Auto Prepend File protection configures PHP to automatically execute a Sentinel file **before** any other PHP file on your site.

### Workflow Diagram

**Without Auto Prepend:**

```
Attacker → exploit.php → Vulnerable code executed ❌
```

**With Auto Prepend:**

```
Attacker → auto_prepend_file.php → Log + Protection → exploit.php → Code blocked ✓
```

## What auto_prepend_file.php does

The `auto_prepend_file.php` file:

1. **Records all requests** to direct PHP files
2. **Logs POST/PUT/PATCH/DELETE requests** with their payload
3. **Logs uploaded files** (name, size, type)
4. **Adds an HTTP header** `X-Sentinel-Protected: 1` to confirm activation

### Log Example

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/vulnerable/upload.php",
  "method": "POST",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-17 10:30:45",
  "source": "auto_prepend",
  "post_data": {
    "action": "upload"
  },
  "files": {
    "file": {
      "name": "shell.php",
      "size": 1234,
      "type": "application/x-php"
    }
  }
}
```

## Installation

### Automatic Installation (Recommended)

1. Go to **Modules > Sentinel > Configuration**
2. Click **Install Auto Prepend File**
3. Sentinel will automatically attempt to install the protection

If automatic installation succeeds, you'll see:

- ✓ **Direct PHP File Access Protection**: Enabled

### Manual Installation

If automatic installation fails, you'll need to manually configure `auto_prepend_file` in your PHP configuration.

#### Method 1: php.ini File

Add this line to your `php.ini` file:

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

#### Method 2: .user.ini File

Create a `.user.ini` file at the root of your PrestaShop:

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

#### Method 3: .htaccess File (Apache only)

Add this line to your `.htaccess` file:

```apache
php_value auto_prepend_file "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
```

:::warning
The path must be **absolute**, not relative. Example:

- ✓ Correct: `/var/www/html/prestashop/modules/sentinel/auto_prepend_file.php`
- ✗ Incorrect: `modules/sentinel/auto_prepend_file.php`
  :::

## Verification

To verify that Auto Prepend File is active:

### Method 1: Via Sentinel Interface

Go to **Modules > Sentinel > Configuration** and check the status:

- ✓ **Direct PHP File Access Protection**: Enabled
- ✗ **Direct PHP File Access Protection**: Disabled

### Method 2: Manual Test

Create a `test.php` file at the root of PrestaShop:

```php
<?php
echo 'Test';
```

Access `https://yourstore.com/test.php` and inspect HTTP headers:

```bash
curl -I https://yourstore.com/test.php
```

If you see `X-Sentinel-Protected: 1`, protection is active. ✓

Don't forget to delete `test.php` after testing.

## Generated Logs

Auto Prepend File generates logs in the same file as other Sentinel logs:

`/var/logs/sentinel-YYYY-MM-DD.log`

### Log Types

#### GET Requests to PHP Files

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/file.php",
  "method": "GET",
  "source": "auto_prepend"
}
```

#### POST Requests with Payload

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/upload.php",
  "method": "POST",
  "source": "auto_prepend",
  "post_data": {
    "param1": "value1"
  },
  "raw_body": "param1=value1&param2=value2"
}
```

#### File Uploads

```json
[2025-12-17 10:30:45] [INFO] AUTO PREPEND FILE {
  "ip": "192.168.1.100",
  "uri": "/modules/module/upload.php",
  "method": "POST",
  "source": "auto_prepend",
  "files": {
    "file": {
      "name": "document.pdf",
      "size": 52480,
      "type": "application/pdf"
    }
  }
}
```

## Use Cases

### Detecting Vulnerable Module Exploitation

An attacker attempts to exploit a vulnerable module:

```
POST /modules/oldmodule/upload.php
```

Without Auto Prepend, this request would **not be detected**.

With Auto Prepend, you'll have a complete log:

- Attacker's IP
- Targeted file
- Sent POST data
- Uploaded files

### Forensic Analysis After Incident

In case of security incident, Auto Prepend logs allow:

- Identifying all directly accessed PHP files
- Viewing sent payloads
- Tracing attack origin
- Understanding the timeline

## Compatibility

### Compatible with

- ✓ Apache with mod_php
- ✓ Apache with PHP-FPM
- ✓ Nginx with PHP-FPM
- ✓ LiteSpeed
- ✓ Shared hosting (if custom PHP configuration is allowed)

### May Require Technical Support

- ⚠️ Shared hosting with restrictions
- ⚠️ Servers with locked PHP configuration

## Uninstallation

If you uninstall Sentinel, Auto Prepend File is automatically disabled.

If you want to manually disable it:

1. Remove Sentinel lines from your PHP configuration file
2. Reload PHP configuration (restart Apache/Nginx/PHP-FPM)

## Troubleshooting

### Protection Won't Activate

1. Check `auto_prepend_file.php` file permissions
2. Verify the path is absolute in the configuration
3. Reload PHP configuration
4. Check PHP error logs

### 500 Error After Activation

If you get a 500 error after enabling Auto Prepend:

1. Check PHP error logs: `/var/log/apache2/error.log`
2. Verify the path to `auto_prepend_file.php` is correct
3. Check `/var/logs` directory permissions

### Logs Not Created

If logs are not being created:

1. Check `/var/logs` directory permissions
2. Create the directory if necessary: `mkdir -p /var/logs && chmod 755 /var/logs`
3. Verify PHP can write to this directory

---

**Next:** [Security Logs](./security-logs.md)
