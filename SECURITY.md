# Security Policy

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## 🔒 Security Architecture

Refinzi is built strictly with **local-first client-side security**:
- **API Keys**: Stored exclusively in the extension's own `chrome.storage.local` sandbox and isolated inside the background service worker. Web pages never see raw credentials, and keys are never transmitted to Refinzi servers.
- **Prompt Isolation**: Your prompt is processed in-memory and written straight back into the composer. Zero prompt logging.
- **Zero Cloud Telemetry**: Refinzi does not monitor keystrokes, record screen context, or send content anywhere.
- **On-Device Default**: The built-in synthesis engine runs locally, so prompt refinement works with no API key and no network request at all.

## 🚨 Reporting a Vulnerability

If you discover a security issue or vulnerability in Refinzi:
1. Please **do NOT** open a public GitHub issue.
2. Email the maintainer directly at **security@refinzi.com** or **contact@refinzi.com**.
3. We will review and remediate critical security vulnerabilities within 24–48 hours.
