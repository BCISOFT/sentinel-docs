---
sidebar_position: 6
---

# Prerequisites Check

Sentinel's prerequisites check verifies that your PrestaShop server meets the required and recommended PHP configuration and directory permissions.

## How it works

1. **Dashboard integration**: The prerequisites check is displayed as a block in the Sentinel dashboard
2. **API-driven**: Prerequisites definitions (PHP version, extensions, config, directories) are fetched from the Sentinel API based on your PrestaShop version
3. **Local verification**: The module checks your server's PHP configuration, loaded extensions, and directory permissions against the API-provided requirements
4. **AJAX loading**: The check runs asynchronously when the dashboard loads, so it doesn't slow down page rendering

## What is checked

### PHP Configuration

- **PHP Version**: Compared against required and recommended versions for your PrestaShop version
- **PHP Extensions**: Verifies that required extensions (curl, dom, gd, intl, json, mbstring, openssl, pdo_mysql, etc.) are loaded
- **PHP Directives**: Checks ini settings like `memory_limit`, `max_input_vars`, `post_max_size`, `upload_max_filesize`, `allow_url_fopen`, etc.

### Directories

- **Existence**: Verifies that essential PrestaShop directories exist (var/cache, var/logs, img, modules, translations, etc.)
- **Writability**: Checks that these directories have proper write permissions

## Status indicators

Each category (PHP Configuration and Directories) displays a status icon:

- **Green check** (check_circle): All prerequisites are met
- **Orange warning** (warning): Some recommended settings are not met, but required ones are satisfied
- **Red error** (error): Required prerequisites are not met

## Viewing details

When a category has warnings or errors, clicking on the row opens a modal dialog with a detailed table showing:

### PHP details table

| Column | Description |
|--------|-------------|
| Item | PHP directive or extension name |
| Required | Minimum required value |
| Recommended | Recommended value for optimal performance |
| Current | Current value on your server |
| Status | Visual status indicator |

### Directories details table

| Column | Description |
|--------|-------------|
| Path | Directory path relative to PrestaShop root |
| Exists | Whether the directory exists |
| Writable | Whether the directory is writable |
| Status | Visual status indicator |

## API endpoint

The prerequisites definitions are fetched from:

```
GET /prerequisites?ps_version=X.Y.Z
```

This allows the requirements to be adapted based on the PrestaShop version installed, and to be updated server-side without requiring a module release.
