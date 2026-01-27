---
sidebar_position: 1
slug: /
---

# Introduction to Sentinel

Welcome to **Sentinel**, a comprehensive security module for PrestaShop that protects your e-commerce site from malicious attacks.

## What is Sentinel?

Sentinel is a web application firewall (WAF) specifically designed for PrestaShop 1.7.7 to 8.2.3. It acts as a protective shield between your store and potential attackers by detecting and blocking malicious requests before they reach your main application.

## Key Features

- **Real-time threat detection**: Identifies malicious patterns in HTTP requests through signature-based detection
- **Automatic request blocking**: Immediately stops threats with HTTP 403 responses
- **Comprehensive logging**: Records all security events with detailed context for forensic analysis
- **Vulnerability scanner**: Manual scanning for known vulnerabilities in modules and PrestaShop core
- **File integrity check**: Verifies that PrestaShop core and module files have not been tampered with
- **Auto Prepend File protection**: Protects against direct access to PHP files bypassing PrestaShop
- **Failed login logging**: Detects failed back-office login attempts
- **POST/PUT/PATCH/DELETE request logging**: Records all modification requests with their payload
- **Zero configuration**: Works out of the box with pre-configured threat signatures
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

## System Requirements

- PrestaShop 1.7.7.x - 8.2.3
- PHP >= 7.2
- Write permissions for `/var/logs` directory

## Quick Start

Get started with Sentinel in a few steps:

1. [Install the module](./installation.md)
2. Activate it from your PrestaShop admin panel
3. Your store is now protected!
4. (Optional but recommended) [Enable Auto Prepend File protection](./features/auto-prepend-protection.md)
5. (Recommended) [Run a vulnerability scan](./features/vulnerability-scanner.md)

No additional configuration required - Sentinel works immediately after installation.

## Protection Layers

Sentinel offers several complementary protection layers:

| Layer                                                     | Protection                              | Activation             |
| --------------------------------------------------------- | --------------------------------------- | ---------------------- |
| **URI Signature Detection**                               | Blocks malicious patterns in requests   | ✓ Automatic            |
| **Failed Login Logging**                                  | Detects brute force attempts            | ✓ Automatic            |
| **POST/PUT/PATCH/DELETE Logging**                         | Records all modifications               | ✓ Automatic            |
| **Vulnerability Scanner**                                 | Detects vulnerable modules/core         | Manual via BO          |
| **[File Integrity Check](./features/integrity-check.md)** | Detects tampered files                  | Manual via BO (Pro)    |
| **Auto Prepend File Protection**                          | Protects against direct PHP file access | Configuration required |

---

Ready to protect your PrestaShop store? Continue to the [Installation Guide](./installation.md).
