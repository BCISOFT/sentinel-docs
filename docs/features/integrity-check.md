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

## Diff Viewer

When integrity check results show modified, missing, or unknown files, you can view the file differences directly from the results.

### Viewing Differences

Each file in the results has a **View Diff** or **View File** button:

- **Modified files** (View Diff): Shows a unified diff comparing the original file with your local version, with added lines highlighted in green and removed lines in red — similar to GitHub's diff view.
- **Missing files** (View File): Shows the original file content from the official sources, with all lines highlighted in red (deleted file).
- **Unknown files** (View File): Shows your local file content, with all lines highlighted in green (new file).

### How It Works

1. Click the **View Diff** / **View File** button on any mismatch row
2. Sentinel fetches the original file from the Sentinel API (for modified and missing files) and reads the local file (for modified and unknown files)
3. For modified files, a diff is computed and displayed with GitHub-style line highlighting
4. The diff viewer shows line numbers, hunk headers (`@@ ... @@`), and statistics (lines added/removed)

:::note
The diff viewer works for text files only. Binary files (images, fonts, etc.) will show a "Binary file" message instead of a diff.
:::

### ZIP Fallback for Modules

When viewing a diff for a module file and the Sentinel API does not have the original sources (e.g., paid or third-party modules where only hashes are available), the diff viewer displays an error message along with an **inline ZIP upload area**.

You can upload the official ZIP of the module directly in the diff viewer:

1. Click **View Diff** on a module file mismatch
2. If sources are unavailable, the error message is shown with a "Compare using a ZIP file" upload zone
3. Drop or select the official ZIP of the module
4. Sentinel extracts the file from the ZIP, reads your local file, and displays the diff

This allows you to view diffs for **any module** — whether it's verified by Sentinel (known hashes, but no sources) or unchecked (not in the repository at all).

## Compare with ZIP

For third-party or paid modules where Sentinel does not have the original source files, you can compare your installed module against an official ZIP archive.

### How to Use

1. Run an integrity check — modules not in the Sentinel repository appear in the **Unchecked Modules** section
2. Click the **Compare with ZIP** button next to the module you want to verify
3. A modal opens showing the module name and the expected version
4. Upload (or drag and drop) the official ZIP file of the module
5. Sentinel extracts the ZIP, hashes all files, and compares them with your installed version
6. Results show any mismatches (modified, missing, or unknown files)
7. Click **View Diff** on any mismatch to see the line-by-line differences

:::tip
The JavaScript keeps a reference to the uploaded ZIP file in memory, so you don't need to re-upload when viewing individual file diffs.
:::

## Export Results

You can export integrity check results in three formats: **CSV**, **JSON**, and **TXT**.

### From the Back-Office

After completing an integrity check or viewing a check from history, an **Export Results** dropdown button appears in the results area. Click it and select the desired format:

- **CSV**: Semicolon-separated file with columns for Section, Path, Status, and Details. Includes core mismatches, module mismatches, and unchecked modules.
- **JSON**: Structured data including check metadata, core results, and module results with all mismatches and unchecked modules.
- **TXT**: Human-readable text report organized by section (Core Files, Modules Files, Unchecked Modules).

The file is downloaded immediately by your browser.

### From the Command Line

Use the `--json` option to output results in JSON format, which you can redirect to a file:

```bash
php bin/console sentinel:integrity --json > integrity-report.json
```

## Excluding files with `.sentinelignore`

Some directories in your PrestaShop installation are not part of the official distribution and should not be checked — for example version control folders (`.git/`, `.svn/`), editor metadata (`.idea/`, `.vscode/`), or local tooling (`node_modules/`). Without exclusions, they appear in the report as **Unknown** files.

Sentinel uses a `.sentinelignore` file located at the **module root** (`modules/sentinel/.sentinelignore`) to let you define your own exclusion rules.

### Editing rules

You can edit `.sentinelignore` in two ways:

- **From the back-office**: go to **Modules > Sentinel**, find the **Integrity Check — Exclusions** card, edit the textarea, and click **Save ignore rules**.
- **Directly on the server**: open `modules/sentinel/.sentinelignore` over SSH/FTP and edit it like any text file.

### Syntax (gitignore-like)

The file follows the same conventions as `.gitignore`:

- Blank lines and lines starting with `#` are ignored
- `.git/` — ignore a directory named `.git` at any depth
- `*.log` — ignore any file ending with `.log`
- `**/cache` — ignore any `cache` directory at any depth
- `/foo` — anchored to the scan root (only matches the top-level `foo`)
- `!keep.log` — re-include a previously ignored file
- A trailing `/` restricts the rule to directories

Rules are evaluated in order; the last matching rule wins. The `.sentinelignore` rules apply to both **core** and **module** integrity scans.

### Default rules

When the module is installed, Sentinel creates a default `.sentinelignore` that already excludes the most common non-PrestaShop directories (`.git/`, `.svn/`, `.idea/`, `.vscode/`, `node_modules/`, …).

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
