import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');

const TARGETS = ['chrome', 'edge', 'firefox'];
const requestedTarget = process.argv[2] || 'all';

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

function generateManifestForBrowser(baseManifest, browser) {
  const manifest = JSON.parse(JSON.stringify(baseManifest));

  if (browser === 'firefox') {
    // Firefox MV3 uses background.scripts instead of service_worker for standard extensions
    manifest.background = {
      scripts: ['background.js']
    };
    manifest.browser_specific_settings = {
      gecko: {
        id: 'refinzi@refinzi.com',
        strict_min_version: '109.0'
      }
    };
  }

  return manifest;
}

async function buildTarget(target) {
  console.log(`[Refinzi] Building target: ${target.toUpperCase()}...`);
  const targetDist = path.join(distDir, target);
  await fs.promises.mkdir(targetDist, { recursive: true });

  // 1a. Compile content script & popup as self-contained IIFE
  await esbuild.build({
    entryPoints: {
      'content': path.join(extDir, 'src', 'content.ts'),
      'popup/popup': path.join(extDir, 'popup', 'popup.ts'),
    },
    outdir: targetDist,
    bundle: true,
    format: 'iife',
    target: ['chrome100', 'firefox109', 'safari16', 'edge100'],
    minify: false,
    sourcemap: false,
    logLevel: 'error',
  });

  // 1b. Compile background service worker
  await esbuild.build({
    entryPoints: {
      'background': path.join(extDir, 'src', 'background.ts'),
    },
    outdir: targetDist,
    bundle: true,
    format: target === 'firefox' ? 'iife' : 'esm',
    target: ['chrome100', 'firefox109', 'safari16', 'edge100'],
    minify: false,
    sourcemap: false,
    logLevel: 'error',
  });

  const destPopupDir = path.join(targetDist, 'popup');
  await fs.promises.mkdir(destPopupDir, { recursive: true });

  // Sync unpacked extension directory when building chrome
  if (target === 'chrome') {
    try {
      await fs.promises.copyFile(path.join(targetDist, 'content.js'), path.join(extDir, 'content.js'));
      await fs.promises.copyFile(path.join(targetDist, 'background.js'), path.join(extDir, 'background.js'));
      await fs.promises.copyFile(path.join(destPopupDir, 'popup.js'), path.join(extDir, 'popup', 'popup.js'));
    } catch (syncErr) {
      console.warn('[Refinzi] Warning: could not sync unpacked extension files:', syncErr);
    }
  }

  // 2. Copy Icons

  const iconsSrc = path.join(extDir, 'icons');
  const iconsDest = path.join(targetDist, 'icons');
  if (fs.existsSync(iconsSrc)) {
    await copyDir(iconsSrc, iconsDest);
  }

  // 3. Copy Popup HTML & CSS
  const popupHtmlSrc = path.join(extDir, 'popup', 'popup.html');
  const popupCssSrc = path.join(extDir, 'popup', 'popup.css');
  if (fs.existsSync(popupHtmlSrc)) {
    await fs.promises.copyFile(popupHtmlSrc, path.join(destPopupDir, 'popup.html'));
  }
  if (fs.existsSync(popupCssSrc)) {
    await fs.promises.copyFile(popupCssSrc, path.join(destPopupDir, 'popup.css'));
  }

  // 4. Generate & write Browser-specific Manifest
  const baseManifestPath = path.join(extDir, 'manifest.json');
  const baseManifest = JSON.parse(await fs.promises.readFile(baseManifestPath, 'utf8'));
  const browserManifest = generateManifestForBrowser(baseManifest, target);

  await fs.promises.writeFile(
    path.join(targetDist, 'manifest.json'),
    JSON.stringify(browserManifest, null, 2),
    'utf8'
  );

  console.log(`[Refinzi] ✓ Package ready at: dist/${target}/`);
}

async function build() {
  console.log('============================================================');
  console.log('REFINZI EXTENSION BUILD SYSTEM');
  console.log('============================================================');

  try {
    // Clean old build artifacts
    if (requestedTarget === 'all') {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
    await fs.promises.mkdir(distDir, { recursive: true });

    const targetsToBuild = requestedTarget === 'all' ? TARGETS : [requestedTarget];
    for (const t of targetsToBuild) {
      if (!TARGETS.includes(t)) {
        console.error(`Unknown target: ${t}. Valid targets: ${TARGETS.join(', ')}`);
        process.exit(1);
      }
      await buildTarget(t);
    }

    // 5. Generate zip release packages
    console.log('[Refinzi] Generating release ZIP archives...');
    const { execSync } = await import('child_process');
    for (const t of targetsToBuild) {
      const zipName = `refinzi-${t}-v2.1.0.zip`;
      const targetFolder = path.join(distDir, t);
      const zipPath = path.join(distDir, zipName);
      try {
        if (process.platform === 'win32') {
          execSync(`powershell -Command "Compress-Archive -Path '${targetFolder}\\*' -DestinationPath '${zipPath}' -Force"`);
        } else {
          execSync(`cd "${targetFolder}" && zip -r "${zipPath}" .`);
        }
        console.log(`[Refinzi] ✓ Release package created: dist/${zipName}`);

        // Sync to landing site downloads
        const landingDownloadsDir = path.resolve(__dirname, '../landing/public/downloads');
        if (fs.existsSync(landingDownloadsDir)) {
          await fs.promises.copyFile(zipPath, path.join(landingDownloadsDir, zipName));
        }
      } catch (zipErr) {
        console.warn(`[Refinzi] Warning: could not generate zip for ${t}:`, zipErr.message);
      }
    }

    console.log('============================================================');
    console.log('ALL BUILDS & RELEASE PACKAGES COMPLETED SUCCESSFULLY!');
    console.log('============================================================');
  } catch (err) {
    console.error('[Refinzi] Build failed:', err);
    process.exit(1);
  }
}

build();
