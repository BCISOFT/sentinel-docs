---
sidebar_position: 1
slug: /
---

# Introduction to Sentinel

Welcome to **Sentinel**, a comprehensive security module for PrestaShop that monitors and secures your e-commerce site against threats and vulnerabilities.

## What is Sentinel?

Sentinel is a security surveillance, threat detection, and vulnerability analysis tool specifically designed for PrestaShop 1.7.7 to 9.0.x. It continuously monitors your store's activity, detects malicious requests through signature-based analysis, and helps you identify vulnerabilities before they can be exploited.

## Key Features

- **Real-time threat detection** *(Pro)*: Identifies malicious patterns in HTTP requests through signature-based detection
- **Automatic request blocking** *(Pro)*: Immediately stops threats with HTTP 403 responses
- **Comprehensive logging**: Records all security events with detailed context for forensic analysis
- **Vulnerability scanner**: Manual scanning for known vulnerabilities in modules and PrestaShop core
- **File integrity check** *(Pro)*: Verifies that PrestaShop core and module files have not been tampered with
- **Auto Prepend File protection** *(Pro)*: Protects against direct access to PHP files bypassing PrestaShop
- **Failed login logging**: Detects failed back-office login attempts
- **POST/PUT/PATCH/DELETE request logging**: Records all modification requests with their payload
- **Prerequisites check**: Verifies PHP configuration, extensions, and directory permissions against version-specific requirements
- **Zero configuration**: Works out of the box
- **PrestaShop integration**: Seamlessly and transparently integrates with PrestaShop

## What threats does Sentinel detect?

Sentinel protects against a wide range of common web attacks:

- **SQL Injection**: Including blind injection techniques using SLEEP functions
- **File Operations**: Attempts to write malicious files or download remote code
- **Command Execution**: Prevents remote command execution attempts
- **Module Exploits**: Detects vulnerabilities in popular PrestaShop modules
- **Parameter Manipulation**: Identifies suspicious parameter manipulation

## How it works

### Real-time Protection

1. **Early interception**: Sentinel hooks into the PrestaShop request lifecycle before the dispatcher
2. **Pattern matching**: Each request is analyzed against pre-configured threat signatures
3. **Immediate response**: Malicious requests are blocked instantly with a professional error page
4. **Detailed logging**: All security events are recorded with full context (IP, URI, method, payload)
5. **Automatic rotation**: Logs are rotated daily and kept for 7 days

### Vulnerability Scanner

1. **Information collection**: Sentinel collects information about your installation (PS version, installed modules)
2. **API analysis**: Data is sent to the Sentinel API which compares against its vulnerability database
3. **Detailed report**: A report is generated with found vulnerabilities, classified by criticality
4. **History**: All scans are kept to track security evolution

### File Integrity Check

1. **File scanning**: All core and module files are scanned and hashed
2. **Official comparison**: Hashes are compared against official PrestaShop and module versions
3. **Modification detection**: Any tampered, added, or missing files are flagged

### Auto Prepend File Protection

1. **PHP configuration**: A Sentinel file is executed before any other PHP file
2. **Complete logging**: All direct PHP file access is logged
3. **Exploitation detection**: Attempts to access vulnerable files are logged
4. **Forensic analysis**: In case of incident, logs allow reconstructing the attack

### Resilience: zero impact on the back-office

Sentinel relies on a remote API for some data, but the API is never on the critical
path of back-office rendering:

1. **Bounded requests**: background calls made during page load use short timeouts, so a slow API can never hang a page.
2. **Circuit breaker**: after a network failure, Sentinel stops calling the API for a short cooldown period and serves cached or degraded data instantly — subsequent pages load without any delay.
3. **Asynchronous widget**: the home dashboard widget renders immediately and loads its API-backed data in the background.

If the Sentinel API is slow or unreachable, the PrestaShop back-office keeps working
normally; only the API-backed sections show a temporary degraded state.

## System Requirements

- PrestaShop 1.7.7 - 9.0.x
- PHP >= 7.2
- Write permissions for `/var/logs` directory

## Quick Start

Get started with Sentinel in a few steps:

1. [Install the module](./installation.md)
2. Activate it from your PrestaShop admin panel
3. Your store is now protected!
4. (Pro) [Enable Auto Prepend File protection](./features/auto-prepend-protection.md)
5. (Recommended) [Run a vulnerability scan](./features/vulnerability-scanner.md)

No additional configuration required - Sentinel works immediately after installation.

## Protection Layers

Sentinel offers several complementary protection layers:

| Layer                                                     | Protection                              | Activation             |
| --------------------------------------------------------- | --------------------------------------- | ---------------------- |
| **[Failed Login Logging](./features/security-logs.md)**   | Detects brute force attempts            | ✓ Automatic            |
| **[POST/PUT/PATCH/DELETE Logging](./features/security-logs.md)** | Records all modifications          | ✓ Automatic            |
| **[Vulnerability Scanner](./features/vulnerability-scanner.md)** | Detects vulnerable modules/core   | Manual via BO          |
| **[URI Signature Detection](./features/threat-detection.md)** | Blocks malicious patterns in requests | Automatic (Pro)    |
| **[File Integrity Check](./features/integrity-check.md)** | Detects tampered files                  | Manual via BO (Pro)    |
| **[Auto Prepend File Protection](./features/auto-prepend-protection.md)** | Protects against direct PHP file access | Configuration (Pro) |

---

Ready to protect your PrestaShop store? Continue to the [Installation Guide](./installation.md).
