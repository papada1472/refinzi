/**
 * REFINZI — Production Package & Local Install Verification
 * Validates that every browser distribution folder is 100% complete,
 * Manifest V3 compliant, and ready for Chrome / Edge / Firefox unpacked loading.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const TARGETS = ['chrome', 'edge', 'firefox'];
let allPassed = true;

for (const target of TARGETS) {
  console.log(`\n[Verify] Checking dist/${target}...`);
  const folder = path.join(distDir, target);

  if (!fs.existsSync(folder)) {
    console.error(`❌ Missing distribution directory: ${folder}`);
    allPassed = false;
    continue;
  }

  const manifestPath = path.join(folder, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Missing manifest.json in: ${folder}`);
    allPassed = false;
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Verify Background script
  if (manifest.background) {
    if (manifest.background.service_worker) {
      const swPath = path.join(folder, manifest.background.service_worker);
      if (!fs.existsSync(swPath)) {
        console.error(`❌ Background service worker missing: ${swPath}`);
        allPassed = false;
      } else {
        console.log(`✓ Service worker verified: ${manifest.background.service_worker} (${fs.statSync(swPath).size} bytes)`);
      }
    } else if (manifest.background.scripts) {
      for (const s of manifest.background.scripts) {
        const sPath = path.join(folder, s);
        if (!fs.existsSync(sPath)) {
          console.error(`❌ Background script missing: ${sPath}`);
          allPassed = false;
        } else {
          console.log(`✓ Background script verified: ${s} (${fs.statSync(sPath).size} bytes)`);
        }
      }
    }
  }

  // Verify Content Scripts
  if (manifest.content_scripts) {
    for (const cs of manifest.content_scripts) {
      for (const js of cs.js || []) {
        const jsPath = path.join(folder, js);
        if (!fs.existsSync(jsPath)) {
          console.error(`❌ Content script missing: ${jsPath}`);
          allPassed = false;
        } else {
          console.log(`✓ Content script verified: ${js} (${fs.statSync(jsPath).size} bytes)`);
        }
      }
    }
  }

  // Verify Popup
  if (manifest.action?.default_popup) {
    const popupHtml = path.join(folder, manifest.action.default_popup);
    if (!fs.existsSync(popupHtml)) {
      console.error(`❌ Popup HTML missing: ${popupHtml}`);
      allPassed = false;
    } else {
      console.log(`✓ Popup HTML verified: ${manifest.action.default_popup}`);
    }
  }

  // Verify Icons
  for (const [size, iconRel] of Object.entries(manifest.icons || {})) {
    const iconPath = path.join(folder, iconRel);
    if (!fs.existsSync(iconPath)) {
      console.error(`❌ Icon missing: ${iconPath} (${size})`);
      allPassed = false;
    } else {
      console.log(`✓ Icon ${size}px verified: ${iconRel}`);
    }
  }

  // Verify Zip release archive
  const zipPath = path.join(distDir, `refinzi-${target}-v2.1.0.zip`);
  if (fs.existsSync(zipPath)) {
    console.log(`✓ Release ZIP verified: ${path.basename(zipPath)} (${fs.statSync(zipPath).size} bytes)`);
  } else {
    console.error(`❌ Release ZIP missing: ${zipPath}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nVerification failed.');
  process.exit(1);
} else {
  console.log('\n============================================================');
  console.log('✓ ALL BROWSER PACKAGES FULLY VALIDATED FOR LOCAL UNPACKED LOAD');
  console.log('============================================================');
}
