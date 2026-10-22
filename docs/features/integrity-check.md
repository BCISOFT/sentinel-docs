---
sidebar_position: 5
---

# File Integrity Check

:::tip Pro Feature
File integrity check is available with the **Pro license**. [Get your Pro license](https://bcisoft.fr/securite) to access this feature.
:::

Sentinel's file integrity check verifies that your PrestaShop core files, module files and theme files have not been modified or compromised. Its results are grouped in three sections: **Core**, **Modules** and **Themes**.

## How it works

1. **File scanning**: Sentinel scans all files in your PrestaShop installation, its themes and installed modules
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
3. Click the **Check Integrity** button

To run the Integrity Check every day, schedule it in the **Automatic scans** card of the Sentinel module's configuration page (**Modules > Module Manager > Sentinel > Configure**; see [Automatic scans](./vulnerability-scanner.md#automatic-scans)). Only an employee who can configure the Sentinel module sees and changes that schedule: a SuperAdmin, or a profile with the **Edit** permission on **Module Manager** and the **Configure** permission on the Sentinel module. Its report is sent to the [Alert recipients](./vulnerability-scanner.md#alert-recipients) set in the next card.

### Via Command Line

You can also run integrity checks from the command line, which is useful for automation or when the back-office is unavailable.

**Check all files (core + themes + modules):**

```bash
php bin/console sentinel:integrity
```

**Check core files only:**

```bash
php bin/console sentinel:integrity --type=core
```

With `--type=core`, the theme directories stay in the core files and are checked with them.

**Check themes only:**

```bash
php bin/console sentinel:integrity --type=themes
```

Your PrestaShop theme is verified and your custom themes are listed as not verified. Like the other checks, it uses one check of your quota.

**Check modules only:**

```bash
php bin/console sentinel:integrity --type=modules
```

**Output as JSON (for automation):**

```bash
php bin/console sentinel:integrity --json
```

**Show the history of the checks:**

```bash
php bin/console sentinel:integrity --history
```

The history shows the number of issues of each check in the **Core Issues**, **Module Issues** and **Theme Issues** columns.

**Show the details of a check from the history:**

```bash
php bin/console sentinel:integrity --details=<check_id>
```

`<check_id>` is a value of the **Check ID** column of the history. In each section, the details name the folders and themes that could not be checked (see **Could not be checked** below).

The command displays results in a format similar to the back-office:

- **Core Files**: Shows issues with PrestaShop core files
- **Modules Files**: Shows issues with module files
- **Unchecked Modules**: Lists third-party modules that cannot be verified
- **Themes Files**: Shows the themes checked, or **Themes not checked**, and the issues with their files
- **Unchecked Themes**: Lists custom themes, which are not verified

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

### Theme Files

A theme is a directory of `themes/` that contains a `config/theme.yml` file. Its version is read from the `version:` line of that file.

- **PrestaShop theme**: `classic`, and also `hummingbird` from PrestaShop 9, is verified against the official files of your PrestaShop version in the **Themes** section. Its files no longer count in Core.
- **Custom theme**: any other theme, including a child theme of `classic`, is not in the Sentinel repository and is not verified. It is listed under **Unchecked Themes** with the reason **Custom theme**, and none of its files appear in Core. To have it verified, submit it to Sentinel (see **Submit a custom theme** below).
- **Not a theme**: `themes/_libraries`, a directory whose name contains a dot and a directory without `config/theme.yml` are not themes: their files stay in Core.
- **Cache**: the `assets/cache` directory of each theme is ignored.

:::info Themes not checked and Unchecked Themes
**Themes not checked** means that no theme was checked in the Themes section: for example an older check opened from the history, a shop whose themes are all custom and not yet submitted, or themes that could not be checked (see **Could not be checked** below). **Unchecked Themes** lists the custom themes found by the check: both can therefore appear together. **Themes not checked** is shown in the results of the check, in the details of a check reopened from the history, by the command line and in the three exports (`not checked` in the JSON).
:::

:::warning Could not be checked
In the back office, a folder of Core or Modules, or a theme, that could not be checked — for example after an error while it was read or sent to the Sentinel service — is listed under **Could not be checked** in its section: the path of the folder (`/` for the root of the shop), `modules/<name>` or one of its folders for a module, or the name of the theme. In the results, that section never says its files are intact, even when it counts no issue. A theme that could not be checked is not counted among the **Themes checked:**. When the modules could not be checked at all, the Modules section of the check you have just run says **Modules not checked**.

The same folders and themes are listed in the details of a check reopened from the history — there, modules that could not be checked at all appear as `modules` under **Could not be checked** — and by `php bin/console sentinel:integrity --details=<check_id>`. Sentinel keeps this list for the last 100 checks that have one; a check run before the module kept it shows none. The CSV, JSON and TXT exports do not contain it: read the results on screen before relying on an export.
:::

## Understanding Results

### File Status

| Status          | Description                            | Action               |
| --------------- | -------------------------------------- | -------------------- |
| ⚠️ **Modified** | File content differs from original     | Review changes       |
| 🆕 **Unknown**  | File doesn't exist in official version | Verify if legitimate |
| ❌ **Missing**  | Official file is missing               | Reinstall file       |

These statuses apply to the files of the Core, Modules and Themes sections alike.

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
The diff viewer shows a diff for text files only. In the viewer, a file is binary when its first 8 KB hold a null byte, whatever its extension: an SVG, HTML or XML file is usually text and is shown as source. For a binary file, the viewer shows the **Original File** and **Local File** panels, as available, with the **Size**, the **Type** and the first 256 bytes in hexadecimal. Only PNG, JPEG, GIF and WebP images are previewed, with an **Open in new tab** button; any other binary file is downloaded instead, with a **Download** button and the note **This type of file is downloaded instead of being displayed.** When you compare with a ZIP, a binary file shows its size, type and first bytes, without preview or download.
:::

:::warning Access restrictions
Viewing file contents requires the **View** permission on the Sentinel Integrity Check tab and an active subscription including Integrity Check.

The viewer can only reach files inside your shop directory. Any path resolving outside it is rejected, including through a symbolic link — resolution is checked against the real path on disk, not against the requested path, so a link with an innocent-looking name cannot escape.

Files holding credentials or secrets are never served either, whatever the integrity check reported — neither their source in the viewer nor their raw content: `.env` and `.env.*` files, `app/config/` and `var/` at the root of the shop, `config/settings*.php` (also in a copy of the shop or in the `config/` directory of a module), `parameters.php`, `parameters.yml` and `parameters.yaml`, `appParameters.php`, any `var/cache/` directory, `backup/` and `backups/` directories, `.git/`, `.htpasswd` files, and `.sql` / `.log` files.

They are refused however the requested path is written (`./`, a doubled `/`), through a symbolic link placed in the shop — the file is judged by its real place in the shop, not by the name of the link — and so are their backup copies and database dumps, compressed or not, for example `settings.inc.php.bak`, `parameters.yml~`, `dump.sql`, `dump.sql.gz` or `error.log.old`. The viewer then shows **Failed to load file content**. When you compare a module file with a ZIP, the file is judged as a file of the shop (`modules/<name>/<path>`) and refused the same way, both its version in the ZIP and your local file.
:::

### ZIP Fallback for Modules

When viewing a diff for a module file and the Sentinel API does not have the original sources (e.g., paid or third-party modules where only hashes are available), the diff viewer displays an error message along with an **inline ZIP upload area**.

You can upload the official ZIP of the module directly in the diff viewer:

1. Click **View Diff** on a module file mismatch
2. If sources are unavailable, the error message is shown with a "Compare using a ZIP file" upload zone
3. Drop or select the official ZIP of the module
4. Sentinel extracts the file from the ZIP, reads your local file, and displays the diff

This allows you to view diffs for **any module** — whether it's verified by Sentinel (known hashes, but no sources) or unchecked (not in the repository at all).

The ZIP fallback does not apply to themes. For a file of a theme you submitted, the diff viewer shows **Official source not available**: Sentinel only keeps the fingerprints of its files.

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

## Submit a custom theme

A custom theme is not in the Sentinel repository, so its files are not verified. You can submit its current state to Sentinel: it becomes the reference of your shop for this theme, and its files are verified from the next check.

### How to Submit

1. Run an integrity check — your custom themes appear in the **Unchecked Themes** section, with their version and the reason **Custom theme**
2. Click the **Submit to Sentinel** button on the row of the theme. The button is not shown for a PrestaShop theme, which Sentinel already verifies
3. The **Submit a theme to Sentinel** modal opens with the name of the theme and its **Installed version**
4. If needed, choose the **Directories to exclude** and **Extensions to exclude**: nothing is selected beforehand
5. Read the warning, then click **Submit to Sentinel** to send the fingerprints of the theme files
6. The row now shows **Submitted, verified at the next check**. No check is started automatically: the theme stays in the list until you run one
7. At the next check, the theme is verified in the **Themes** section, and a file modified since the submission is reported there

:::warning Submit only a theme you trust
The current state of this theme becomes the reference of your next checks. If its files were already altered by someone else, a theme already compromised would be accepted as it is: submit it only if you trust its current files.
:::

### Scope

- The reference is private to your shop: another shop with the same theme still sees it as not verified.
- A submission does not use a check of your quota.
- Submitting a theme requires the Pro plan and the **Edit** permission on the Sentinel **Integrity Check** tab. An employee who only has the **View** permission sees the button, but the submission is refused.
- A theme is submitted from the back-office: the command line does not offer it.

### If the submission is refused

When the modal opens, Sentinel first checks that the theme can be submitted. If it cannot, the modal shows the message without exclusions or submit button:

- **`name` is a theme of PrestaShop: Sentinel already verifies it against the official files.** — this theme does not need to be submitted.
- **This theme has no version: add a version: line to its config/theme.yml file, then submit it again.** — add a `version:` line to the `config/theme.yml` file of the theme, then close the modal and open it again.

When you click **Submit to Sentinel**, the submission may still be refused. The modal then stays open with your exclusions, so you can correct them and try again:

- **Every file of this theme is excluded: there is nothing to submit.** — remove some exclusions.
- **The theme is too large to be submitted to Sentinel.** — excluding the directories or extensions you do not need to check reduces what is sent.

## Export Results

You can export integrity check results in three formats: **CSV**, **JSON**, and **TXT**.

### From the Back-Office

After completing an integrity check or viewing a check from history, an **Export Results** dropdown button appears in the results area. Click it and select the desired format:

- **CSV**: Semicolon-separated file with columns for Section, Path, Status, and Details. Includes core mismatches, module mismatches, unchecked modules, theme mismatches in `themes` rows and custom themes in `unchecked theme` rows. When the themes were not checked, a `themes` row says **Themes not checked**.
- **JSON**: Structured data including check metadata, core results, module results and theme results with all mismatches, unchecked modules and unchecked themes. `themes_status` is `checked` or `not checked`.
- **TXT**: Human-readable text report organized by section (Core Files, Modules Files, Unchecked Modules, Themes Files, Unchecked Themes). When the themes were not checked, the Themes Files section says `Themes not checked.` and, if no issue is found, the report ends with `No issues found in the checked files.`

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

Rules are evaluated in order; the last matching rule wins. The `.sentinelignore` rules apply to the **core**, **module** and **theme** integrity checks.

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

### A theme shows as not verified

A theme listed under **Unchecked Themes** is a custom theme: Sentinel has no reference for it. Submit it (see **Submit a custom theme**) to have its files verified from the next check. If its `config/theme.yml` file has no `version:` line, add one before submitting it.

### A folder or a theme could not be checked

A name listed under **Could not be checked**, or a Modules section that says **Modules not checked**, was not fully verified by this check: a modified file may not be reported. Run the check again. When you run it from the command line, a theme that could not be checked is named with the reason.

---

**Next:** [Security Logs](./security-logs.md)
