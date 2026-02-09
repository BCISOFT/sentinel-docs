---
sidebar_position: 5
---

# File Integrity Check

:::tip Pro Feature
File integrity check is available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

Sentinel's file integrity check verifies that your PrestaShop core files and module files have not been modified or compromised.

## How it works

1. **File scanning**: Sentinel scans all files in your PrestaShop installation and installed modules
2. **Hash comparison**: File hashes are compared against official versions via the Sentinel API
3. **Difference detection**: Any modified, added, or deleted files are identified
4. **Detailed report**: A report shows all discrepancies with their severity level

## Why is this important?

Attackers often modify existing PHP files to inject malicious code. This technique allows them to:

- Hide backdoors in legitimate files
- Steal customer data (credit cards, passwords)
- Redirect payments to their accounts
- Send spam from your server

Regular integrity checks help detect these compromises before they cause damage.

## Access the Integrity Checker

### Via Back-Office

To run an integrity check from the back-office:

1. Log in to your PrestaShop back-office
2. Go to **Modules > Sentinel > Integrity Check**
3. Click the **Run Check** button

### Via Command Line

You can also run integrity checks from the command line, which is useful for automation or when the back-office is unavailable.

**Check all files (core + modules):**

```bash
php bin/console sentinel:integrity
```

**Check core files only:**

```bash
php bin/console sentinel:integrity --type=core
```

**Check modules only:**

```bash
php bin/console sentinel:integrity --type=modules
```

**Output as JSON (for automation):**

```bash
php bin/console sentinel:integrity --json
```

The command displays results in a format similar to the back-office:

- **Core Files**: Shows issues with PrestaShop core files
- **Modules Files**: Shows issues with module files
- **Unchecked Modules**: Lists third-party modules that cannot be verified

## What is checked

### PrestaShop Core Files

Sentinel verifies all core PrestaShop files against the official distribution for your version.

### Module Files

For each installed module, Sentinel checks:

- Module files against the official Addons version (if available)
- Known vulnerable file patterns
- Suspicious code patterns

:::info Modules with empty version
Modules without a version number in their configuration are also checked. Sentinel uses file signatures to identify potential modifications.
:::

## Understanding Results

### File Status

| Status          | Description                            | Action               |
| --------------- | -------------------------------------- | -------------------- |
| ⚠️ **Modified** | File content differs from original     | Review changes       |
| 🆕 **Unknown**  | File doesn't exist in official version | Verify if legitimate |
| ❌ **Missing**  | Official file is missing               | Reinstall file       |

## Troubleshooting

### Check takes too long

Large installations may take several minutes. Factors affecting speed:

- Number of modules installed
- Server performance
- Network speed to Sentinel API

### Some modules show as "Unknown"

Modules not available on PrestaShop Addons cannot be verified against an official version. Sentinel will still check for suspicious patterns.

---

**Next:** [Security Logs](./security-logs.md)
