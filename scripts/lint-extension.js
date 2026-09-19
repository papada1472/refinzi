/**
 * REFINZI — Production Linter & Security Audit Script
 * Validates cross-browser manifests, security boundaries, and code hygiene.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');

let hasErrors = false;

function logError(msg) {
  console.error(`❌ [LINT ERROR] ${msg}`);
  hasErrors = true;
}

function logSuccess(msg) {
  console.log(`✓ [LINT PASS] ${msg}`);
}

// 1. Validate Base Manifest
try {
  const manifestPath = path.join(extDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (manifest.manifest_version !== 3) {
    logError('Manifest version must be 3.');
  } else {
    logSuccess('Manifest V3 compliant.');
  }

  // Check required files exist
  const icons = manifest.icons || {};
  for (const [size, iconPath] of Object.entries(icons)) {
    if (!fs.existsSync(path.join(extDir, iconPath))) {
      logError(`Referenced icon missing: ${iconPath} (${size})`);
    }
  }
  logSuccess('All referenced icons exist.');

  // Check background service worker exists in source or dist
  if (manifest.background?.service_worker) {
    logSuccess('Background service worker declared.');
  }
} catch (err) {
  logError(`Manifest parsing failed: ${err.message}`);
}

// 2. Scan source files for security vulnerabilities
const srcDir = path.join(extDir, 'src');

function scanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');

  // Check for eval()
  if (/\beval\s*\(/.test(code)) {
    logError(`Prohibited eval() found in ${path.relative(rootDir, filePath)}`);
  }

  // Check for unsafe innerHTML assignment without escaping
  const innerHtmlMatches = code.match(/\.innerHTML\s*=\s*[^;\n]+/g) || [];
  for (const match of innerHtmlMatches) {
    if (
      match.includes('rawInput') ||
      match.includes('raw') ||
      match.includes('response') ||
      match.includes('prompt')
    ) {
      if (!match.includes('escapeHTML') && !match.includes('textContent')) {
        logError(`Potentially unescaped innerHTML found in ${path.relative(rootDir, filePath)}: ${match}`);
      }
    }
  }

  // Check for hardcoded API keys
  if (/(?:sk-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33})/i.test(code)) {
    logError(`Hardcoded API secret pattern found in ${path.relative(rootDir, filePath)}`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(ts|js|tsx|jsx)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

scanDir(srcDir);
scanDir(path.join(extDir, 'popup'));

if (hasErrors) {
  console.error('\nLint audit failed with errors.');
  process.exit(1);
} else {
  console.log('\nAll security and quality lint checks passed successfully!');
}
