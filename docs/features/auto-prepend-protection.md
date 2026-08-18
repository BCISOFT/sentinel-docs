---
sidebar_position: 5
---

# Auto Prepend File Protection

:::tip Pro Feature
Auto Prepend File protection is available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

The **Auto Prepend File** protection is an additional security layer covering requests that reach a PHP file without going through PrestaShop. Every such access is recorded, and one carrying a known attack is refused with a 403.

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
Attacker → auto_prepend_file.php → Logged, and refused when it carries a known attack ✓
```

## What auto_prepend_file.php does

The `auto_prepend_file.php` file:

1. **Records all requests** to direct PHP files
2. **Logs POST/PUT/PATCH/DELETE requests** with their payload
3. **Logs uploaded files** (name, size, type)
4. **Adds an HTTP header** `X-Sentinel-Protected: 1` to confirm activation
5. **Refuses a request matching a threat signature**, with a bare 403

### Signature detection on direct accesses

Threat detection normally runs from a PrestaShop hook, so it only ever sees requests that boot PrestaShop. A request straight to `modules/some-module/vulnerable.php` is dispatched by nothing, and was therefore inspected by nothing.

The Auto Prepend File stage closes that gap: the same signature set is applied, before PrestaShop starts, to any request that reaches a PHP file directly.

- **Only direct accesses are inspected.** Requests going through `index.php` are already covered by the hook, and a normal page pays nothing for this stage.
- **The refusal is a bare 403**, with no page and no mention of Sentinel. The caller here is a scanner or an exploit, not a customer to inform, and a branded page would confirm both that the file executes and what protects the shop.
- **It follows the threat detection switch.** Turning threat detection off on the configuration page turns this stage off too.
- **A Free shop blocks nothing.** The signature file is filled by the Sentinel API, and a shop without the subscription receives an empty one — there is nothing to match against.
- **Anything unexpected lets the request through.** A missing or unreadable signature file, or any error during detection, never turns a page into an error.

Blocked attempts appear in the Security Logs, in the file logs tab, marked *Blocked* with the signature that matched.

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
2. Click **Try Automatic Installation**

Sentinel goes through the following steps:

1. **It looks for an existing `auto_prepend_file`.** The effective PHP value is checked first, which also covers a system `php.ini`, a PHP-FPM pool and a parent `.htaccess`. The files at the root of your shop are then scanned. If another prepend is already declared, **Sentinel stops there and writes nothing**: replacing it would disable whatever protection it belongs to.
2. **It picks the only method that can work on your server**, based on how PHP runs:
   - PHP as an Apache module (`mod_php`) → `.htaccess`, because `.user.ini` is ignored in that setup
   - PHP-FPM, CGI, LiteSpeed and others → `.user.ini`
3. **It writes a marked block** into that single file. Nothing else is touched.
4. **It verifies the result** by requesting a throwaway script over HTTP and looking for the `X-Sentinel-Protected` header.

:::info
There is no fallback from one method to the other, and this is deliberate. A `.user.ini` is ignored by `mod_php`, and a `php_value` directive in an `.htaccess` is an unknown directive for a server without `mod_php` — which would answer every page of your shop with a 500 error.
:::

### Installation States

The configuration page reports one of the following states:

| State | Meaning | What to do |
| --- | --- | --- |
| **Active** | The prepend runs, confirmed over HTTP | Nothing |
| **Activation in progress** | The configuration was written but PHP has not read it yet | Wait, then click **Check Now** |
| **Installation not possible** | Another `auto_prepend_file` is already configured | See [Conflict with an existing prepend](#conflict-with-an-existing-prepend) |
| **Not active** | Automatic installation did not succeed | Follow the manual instructions |

#### Why "Activation in progress"?

PHP caches `.user.ini` files for the duration of `user_ini.cache_ttl`, five minutes by default. A file written a moment ago is therefore usually not live yet, and the verification cannot confirm it.

Sentinel **keeps the configuration in place** in that case rather than concluding it failed, and reports the remaining delay. Reloading the configuration page re-runs the verification, and the state switches to *Active* on its own once PHP picks the file up.

With the `.htaccess` method there is no such delay: the verification is conclusive immediately, and a failed check causes Sentinel to remove what it just wrote.

### Conflict with an Existing Prepend

When another `auto_prepend_file` is already configured, the configuration page shows its current value and where it is declared. Sentinel does not touch it.

Two ways forward:

- **Ask your hosting provider** to chain both prepend files.
- **Include Sentinel from the existing prepend**, by adding this line to it:

  ```php
  require_once '/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php';
  ```

Once the other `auto_prepend_file` has been removed, reload the configuration page: the automatic installation is offered again.

### Manual Installation

The configuration page lists the methods in the order that makes sense for your server, the most likely to work first. The path must always be **absolute**.

#### `.user.ini` File (PHP-FPM, CGI, LiteSpeed)

Create a `.user.ini` file at the root of your PrestaShop installation:

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

:::caution
Ignored when PHP runs as an Apache module. Allow up to five minutes for PHP to read the file.
:::

#### `.htaccess` File (Apache with mod_php)

Add this block to the `.htaccess` file at the root of your PrestaShop installation, **before the `# ~~start~~` comment**:

```apache
# BEGIN Sentinel Security Module
<IfModule mod_php.c>
    php_value auto_prepend_file "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
</IfModule>
<IfModule mod_php7.c>
    php_value auto_prepend_file "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
</IfModule>
# END Sentinel Security Module
```

:::caution
The two points above both matter.

**Before `# ~~start~~`**: PrestaShop rewrites everything between its `# ~~start~~` and `# ~~end~~` markers whenever it regenerates the `.htaccess` — when you rebuild friendly URLs, for instance. Only what sits outside those markers is kept.

**Inside `<IfModule>`**: an unguarded `php_value` is a fatal directive for a server without `mod_php`, which would answer every request with a 500 error.
:::

#### `php.ini` File

Add this line to your `php.ini` file:

```ini
; BEGIN Sentinel Security Module
auto_prepend_file = "/absolute/path/to/prestashop/modules/sentinel/auto_prepend_file.php"
; END Sentinel Security Module
```

:::warning
The path must be **absolute**, not relative. Example:

- ✓ Correct: `/var/www/html/prestashop/modules/sentinel/auto_prepend_file.php`
- ✗ Incorrect: `modules/sentinel/auto_prepend_file.php`
  :::

After configuring `auto_prepend_file` by hand, reload the configuration page: Sentinel re-runs its verification on every page load and picks up the change.

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

Uninstalling Sentinel removes the marked block from every configuration file it may have written to, and deletes a file that becomes empty as a result. Content that belongs to someone else in a shared file is preserved.

The `auto_prepend_file.php` file itself ships with the module and stays in place; without a `auto_prepend_file` directive pointing at it, it is never executed.

If you want to disable the protection by hand:

1. Remove the lines between `BEGIN Sentinel Security Module` and `END Sentinel Security Module` from your PHP configuration file
2. Reload PHP configuration (restart Apache/Nginx/PHP-FPM)

## Troubleshooting

### Stuck on "Activation in progress"

Expected for up to five minutes with the `.user.ini` method, the time it takes PHP to refresh its cache. Beyond that, Sentinel switches to *Not active* on its own.

If it does not clear:

1. Check that PHP does not run as an Apache module, in which case `.user.ini` is ignored — use the `.htaccess` method instead
2. Check the value of `user_ini.cache_ttl` and `user_ini.filename` in your PHP configuration
3. Check that the `.user.ini` file is readable by the web server

### "Installation not possible"

Another `auto_prepend_file` is already configured on the server. See [Conflict with an existing prepend](#conflict-with-an-existing-prepend). Sentinel deliberately writes nothing in this situation.

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
