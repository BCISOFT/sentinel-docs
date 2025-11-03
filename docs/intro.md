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
- **Zero configuration**: Works out of the box with a large number of pre-configured threat signatures
- **PrestaShop integration**: Seamlessly and transparently integrates with PrestaShop

## What threats does Sentinel detect?

Sentinel protects against a wide range of common web attacks:

- **SQL Injection**: Including blind injection techniques using SLEEP functions
- **File Operations**: Attempts to write malicious files or download remote code
- **Command Execution**: Prevents remote command execution attempts
- **Module Exploits**: Detects vulnerabilities in popular PrestaShop modules
- **Parameter Manipulation**: Identifies suspicious parameter manipulation

## How it works

1. **Early interception**: Sentinel hooks into the PrestaShop request lifecycle before the dispatcher processes requests
2. **Pattern matching**: Each request is analyzed against pre-configured threat signatures
3. **Immediate response**: Malicious requests are blocked instantly with a professional error page
4. **Detailed logging**: All security events are recorded with full context (IP, URI, method, payload)
5. **Automatic rotation**: Logs are rotated daily and kept for 7 days

## System Requirements

- PrestaShop 1.7.7.x - 8.2.3
- PHP >= 7.2
- Write permissions for `/var/logs` directory

## Quick Start

Get started with Sentinel in a few steps:

1. [Install the module](./installation.md)
2. Activate it from your PrestaShop admin panel
3. Your store is now protected!

No additional configuration required - Sentinel works immediately after installation.

---

Ready to protect your PrestaShop store? Continue to the [Installation Guide](./installation.md).
