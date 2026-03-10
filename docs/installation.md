---
sidebar_position: 2
---

# Installation

This guide will walk you through the process of installing Sentinel on your PrestaShop store.

## Prerequisites

Before installing Sentinel, ensure your system meets these requirements:

- PrestaShop 1.7.7 - 9.0.x
- PHP >= 7.2
- Write permissions for `/modules` and `/var/logs` directories

## Download the Module

Browse all versions on the [releases page](https://github.com/bcisoft/sentinel-docs/releases).

## Installation Methods

### Method 1: Installation from Back Office (Recommended)

1. **Download the module**

   Download the latest version using the link above.

2. **Install the module**

   Log in to your PrestaShop admin panel and navigate to:

   **Modules > Module Manager**

   Click the **Install a module** button

   Select the sentinel module zip file

### Method 2: Manual Installation

1. **Download the module**

   Download the latest version using the link above.

2. **Extract the archive**

   Extract the ZIP file to your PrestaShop `/modules` directory:

   ```bash
   cd /path/to/prestashop/modules
   unzip sentinel-1.0.0.zip
   ```

3. **Activate the module**

   Log in to your PrestaShop admin panel and navigate to:

   **Modules > Module Manager**

   Search for "Sentinel" and click **Install**.

## Post-installation

### Verify Installation

After installation, verify that Sentinel is working correctly:

1. Check that the module appears in **Modules > Module Manager**
2. Ensure the module status is "Enabled"

### Check Permissions

Ensure the logs directory has write permissions:

```bash
chmod 755 /path/to/prestashop/var/logs
```

### Test Protection

You can test that Sentinel is protecting your store by attempting a benign SQL injection pattern in your browser:

```
https://yourstore.com/index.php?test=SELECT+SLEEP(1)
```

You should see a page blocked by Sentinel with a 403 error.

:::warning
Only test with benign patterns and on your own store. Never attempt real attacks.
:::

## Troubleshooting

### Permission Errors

If you encounter permission errors during installation:

```bash
# Set correct ownership (replace www-data with your web server user)
sudo chown -R www-data:www-data /path/to/prestashop/modules/sentinel

# Set correct permissions
sudo chmod -R 755 /path/to/prestashop/modules/sentinel
```

### Module Won't Activate

If the module fails to activate:

1. Check PHP error logs: `/var/log/apache2/error.log` or `/var/log/php-fpm/error.log`
2. Verify PrestaShop version compatibility
3. Check file permissions

## Post-installation Configuration

### 1. Enable Auto Prepend File Protection (Recommended)

For complete protection, enable Auto Prepend File protection:

1. Go to **Modules > Sentinel > Configuration**
2. Click **Install Auto Prepend File**
3. If automatic installation fails, follow the [manual instructions](./features/auto-prepend-protection.md)

### 2. Run a Vulnerability Scan

Check if your installation contains known vulnerabilities:

1. Go to **Modules > Sentinel > Security Scanner**
2. Click **Run Scan**
3. Review the report and fix detected vulnerabilities

### 3. Monitor Logs

Logs are automatically created in `/var/logs/sentinel-YYYY-MM-DD.log`

See the [Security Logs](./features/security-logs.md) guide to learn how to analyze them.

## Next Steps

Now that Sentinel is installed, learn more about:

- [Threat Detection](./features/threat-detection.md)
- [Vulnerability Scanner](./features/vulnerability-scanner.md)
- [Auto Prepend File Protection](./features/auto-prepend-protection.md)
- [Security Logs](./features/security-logs.md)
