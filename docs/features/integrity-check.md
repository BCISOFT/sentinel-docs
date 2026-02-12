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
2. **Content normalization**: Before hashing, each file's content is normalized to eliminate non-significant whitespace differences (UTF-8 BOM, line endings, indentation). This prevents false positives caused by differences between your installed files and the reference sources.
3. **Hash comparison**: Normalized file hashes (MD5) are compared against official versions via the Sentinel API
4. **Difference detection**: Any modified, added, or deleted files are identified
5. **Detailed report**: A report shows all discrepancies with their severity level

### Content Normalization

To avoid false positives from harmless whitespace differences, Sentinel normalizes **text file** content before computing hashes. The normalization steps are:

1. **UTF-8 BOM removal**: Strips the BOM bytes (`\xEF\xBB\xBF`) if present at the start of the file
2. **Line ending normalization**: Converts all `\r\n` (Windows) and `\r` (old Mac) to `\n` (Unix)
3. **Line trimming**: Removes leading and trailing whitespace from each line

This ensures that text files with different indentation styles (tabs vs spaces), different line endings, or a UTF-8 BOM will produce the same hash as the reference files. The Sentinel API applies the exact same normalization when generating reference manifests.

#### Text vs Binary detection

Normalization is only applied to **text files** (detected by file extension). Binary files (images, fonts, archives, etc.) are hashed as-is with no modification to avoid corrupting their content.

**Text extensions** (normalized): `php`, `inc`, `tpl`, `html`, `htm`, `xml`, `xsd`, `js`, `ts`, `jsx`, `tsx`, `mjs`, `cjs`, `css`, `scss`, `sass`, `less`, `json`, `yml`, `yaml`, `toml`, `ini`, `cfg`, `conf`, `sql`, `md`, `txt`, `csv`, `tsv`, `log`, `sh`, `bash`, `zsh`, `twig`, `smarty`, `mustache`, `htaccess`, `env`, `lock`, `map`, `svg`.

**Files without extension** (e.g. `Makefile`, `Dockerfile`) are also treated as text.

**All other extensions** (e.g. `png`, `jpg`, `gif`, `woff`, `pdf`, `zip`) are treated as binary and hashed without normalization.

:::note Security
This normalization only affects whitespace characters in text files. Any actual code injection (PHP keywords, variables, operators) adds non-whitespace characters and will always be detected. Binary files are never modified.
:::

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
