// @vitest-environment jsdom
/**
 * REFINZI — Popup Runtime Integration Tests
 *
 * The sibling `popup_dom.test.ts` only reads popup.html as a string, so it can
 * never catch a crash in popup.ts. This suite actually *executes* the popup
 * controller against a mocked extension runtime.
 *
 * Regression guard: `GUIDEBOOKS` was declared below the init sequence that
 * reads it, so `updateProviderForm()` threw
 * "Cannot access 'GUIDEBOOKS' before initialization" on every popup open.
 * Because the throw happened inside the async DOMContentLoaded callback, every
 * handler registered after that point (tab navigation, period toggles,
 * settings, history) silently never attached — the entire popup was inert.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DEPRECATED_GEMINI_API_KEYS } from '../src/utils/storage';

const POPUP_HTML = path.resolve(__dirname, '../popup/popup.html');

/**
 * Minimal chrome.* mock. BrowserAPI binds to globalThis.chrome when its module
 * is first evaluated, so this must be installed before popup.ts is imported.
 */
function installChromeMock(store: Record<string, any>) {
  const BASE_SETTINGS = {
    defaultMode: 'better',
    provider: 'gateway',
    apiKeys: {},
    models: {
      gemini: 'gemini-flash-latest',
      openai: 'gpt-5.6-luna',
      deepseek: 'deepseek-flash',
      openrouter: 'deepseek/deepseek-v4-flash-0731:free',
    },
    gatewayUrl: 'https://refinzi.com/api/v1/refine',
    enabledSites: { chatgpt: true, claude: true, gemini: true, perplexity: true },
    shortcuts: { better: 'Ctrl+Shift+B', expert: 'Ctrl+Shift+E' },
    theme: 'dark',
    autoFocus: true,
    showInlineTrigger: true,
    holdThresholdMs: 350,
    autoApply: true,
    saveHistory: true,
    freeUsageCount: 0,
    freeUsageExpired: false,
  };

  // The popup reads settings over messaging but reads the free-tier counter
  // straight from storage. Keep both views consistent, or the two sources
  // disagree and produce nonsense states that cannot occur in production.
  const saved = store.refinzi_settings || {};
  const effectiveSettings = {
    ...BASE_SETTINGS,
    ...saved,
    apiKeys: { ...BASE_SETTINGS.apiKeys, ...(saved.apiKeys || {}) },
    models: { ...BASE_SETTINGS.models, ...(saved.models || {}) },
  };

  const responseFor = (message: any): any => {
    switch (message?.type) {
      case 'REFINZI_GET_SETTINGS':
        return { success: true, data: effectiveSettings };
      case 'REFINZI_GET_METRICS_SUMMARY':
        return {
          success: true,
          data: {
            period: 'Week',
            totalPromptsEnhanced: 12,
            promptsPeriodSubtitle: '+12 this week',
            estimatedTimeSavedFormatted: '~30m',
            estimatedTimeSavedTooltip: 'estimated',
            estimatedCostSavedFormatted: '~$0.42',
            estimatedCostSavedSubtitle: 'estimated',
            estimatedCostSavedTooltip: 'estimated',
            betterCount: 9,
            expertCount: 3,
            betterPercentage: 75,
            expertPercentage: 25,
            hasCostData: true,
            todayCount: 3,
            weekCount: 12,
            monthCount: 40,
            allTimeCount: 120,
          },
        };
      case 'REFINZI_GET_HISTORY':
        return { success: true, data: [] };
      default:
        return { success: true };
    }
  };

  (globalThis as any).chrome = {
    storage: {
      local: {
        get: (keys: any, cb: any) => {
          if (!keys) return cb({ ...store });
          const list = Array.isArray(keys) ? keys : [keys];
          const out: Record<string, any> = {};
          for (const k of list) if (k in store) out[k] = store[k];
          cb(out);
        },
        set: (items: any, cb: any) => {
          Object.assign(store, items);
          cb?.();
        },
        remove: (_keys: any, cb: any) => cb?.(),
        clear: (cb: any) => {
          for (const k of Object.keys(store)) delete store[k];
          cb?.();
        },
      },
      sync: {
        get: (_keys: any, cb: any) => cb({}),
        set: (_items: any, cb: any) => cb?.(),
        remove: (_keys: any, cb: any) => cb?.(),
        clear: (cb: any) => cb?.(),
      },
    },
    runtime: {
      lastError: undefined,
      sendMessage: (message: any, cb: any) => {
        cb(responseFor(message));
      },
    },
  };
}

/**
 * Handlers registered by the current boot. popup.ts attaches its init routine
 * to DOMContentLoaded, so every re-import would otherwise stack another
 * listener on the same document and re-run init once per previous test.
 */
let activeDomReadyHandlers: Array<(evt: Event) => void> = [];

async function bootPopup(store: Record<string, any> = {}) {
  // Detach handlers left over from a previous boot in this file.
  for (const handler of activeDomReadyHandlers) {
    document.removeEventListener('DOMContentLoaded', handler);
  }
  activeDomReadyHandlers = [];

  document.body.innerHTML = fs.readFileSync(POPUP_HTML, 'utf8');
  installChromeMock(store);

  // Capture the handler this boot registers so it can be detached next time.
  const originalAdd = document.addEventListener;
  document.addEventListener = function (type: string, handler: any, options?: any) {
    if (type === 'DOMContentLoaded') activeDomReadyHandlers.push(handler);
    return originalAdd.call(this, type, handler, options);
  } as typeof document.addEventListener;

  // Fresh module graph so the controller re-registers its DOMContentLoaded hook.
  vi.resetModules();
  // Import the SOURCE explicitly: `extension/popup/` also contains the built
  // `popup.js` bundle, and Vite resolves `.js` before `.ts` by default. A bare
  // '../popup/popup' import would therefore test a stale build artifact.
  await import('../popup/popup.ts');

  // Reset the storage layer through the FRESHLY loaded module (the top-level
  // import above points at the previous module instance after resetModules).
  // Use the same specifier shape the source uses so Vite resolves one instance.
  const freshBatch = await import('../src/utils/storage-batch');
  freshBatch.__resetStorageLayerForTests();

  document.addEventListener = originalAdd;

  // jsdom has already fired DOMContentLoaded, so dispatch it manually.
  document.dispatchEvent(new Event('DOMContentLoaded'));
  // Let the async init sequence settle.
  await new Promise((resolve) => setTimeout(resolve, 60));
}

describe('Popup runtime — controller actually initialises', () => {
  let errors: string[] = [];

  beforeEach(() => {
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      errors.push(args.map(String).join(' '));
    });
  });

  afterEach(() => {
    for (const handler of activeDomReadyHandlers) {
      document.removeEventListener('DOMContentLoaded', handler);
    }
    activeDomReadyHandlers = [];
    document.body.innerHTML = '';
    delete (globalThis as any).chrome;
    vi.restoreAllMocks();
  });

  it('initialises without throwing (guards the GUIDEBOOKS temporal-dead-zone crash)', async () => {
    await bootPopup();

    // The crash surfaced as this exact ReferenceError.
    expect(errors.join('\n')).not.toContain('GUIDEBOOKS');
    expect(errors.join('\n')).not.toContain('before initialization');

    // Init ran past the point where it used to die: the header status is no
    // longer the static markup default.
    const statusText = document.getElementById('global-status-text')?.textContent;
    expect(statusText).toBe('Gateway Ready');
  });

  it('registers tab navigation handlers (Home → History → Settings)', async () => {
    await bootPopup();

    const historyBtn = document.querySelector('.nav-btn[data-tab="tab-history"]') as HTMLButtonElement;
    historyBtn.click();
    expect(document.getElementById('tab-history')?.classList.contains('active')).toBe(true);
    expect(document.getElementById('tab-home')?.classList.contains('active')).toBe(false);

    const settingsBtn = document.querySelector('.nav-btn[data-tab="tab-settings"]') as HTMLButtonElement;
    settingsBtn.click();
    expect(document.getElementById('tab-settings')?.classList.contains('active')).toBe(true);
  });

  it('registers period toggle handlers and persists the selection', async () => {
    await bootPopup();

    const todayBtn = document.querySelector('.period-btn[data-period="Today"]') as HTMLButtonElement;
    todayBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(todayBtn.classList.contains('active')).toBe(true);
    const weekBtn = document.querySelector('.period-btn[data-period="Week"]') as HTMLButtonElement;
    expect(weekBtn.classList.contains('active')).toBe(false);
  });

  it('renders metrics from the background summary into the dashboard', async () => {
    await bootPopup();

    expect(document.getElementById('metric-total-prompts')?.textContent).toBe('12');
    expect(document.getElementById('metric-time-saved')?.textContent).toBe('~30m');
    expect(document.getElementById('metric-cost-saved')?.textContent).toBe('~$0.42');
    expect(document.getElementById('metric-better-expert-val')?.textContent).toBe('9 / 3');
    expect(document.getElementById('period-better-pct')?.textContent).toBe('(75%)');
  });

  it('shows the gateway as the default engine without any free-tier banner', async () => {
    await bootPopup();

    const banner = document.getElementById('home-engine-banner');
    const engineName = document.getElementById('engine-name');

    // Default provider is now the cloud gateway (no bundled Gemini key).
    expect(engineName?.textContent).toContain('Gateway');

    // The bundled-key free-tier banner is retired: no "free left" suffix.
    expect(document.querySelectorAll('.engine-free')).toHaveLength(0);
    expect(banner?.classList.contains('warn')).toBe(false);

    // Still exactly four metric cards: no clutter was introduced.
    expect(document.querySelectorAll('#tab-home .dash-card')).toHaveLength(4);
  });

  /**
   * The bundled Gemini key (and its client-side 25-prompt counter) is retired.
   * The free-tier path now lives server-side in the gateway. These next two
   * tests pin that a user-supplied Gemini key no longer shows a "free left"
   * banner — there is nothing left to count.
   */
  it('shows a BYOK Gemini engine with no free-tier suffix', async () => {
    await bootPopup({
      refinzi_settings: {
        provider: 'gemini',
        apiKeys: { gemini: 'AIzaSyUserOwnKey123' },
        freeUsageCount: 24,
        freeUsageExpired: false,
      },
    });

    const banner = document.getElementById('home-engine-banner');
    expect(banner?.classList.contains('warn')).toBe(false);
    expect(document.getElementById('engine-name')?.textContent).toContain('BYOK');
    expect(document.querySelectorAll('.engine-free')).toHaveLength(0);
  });

  it('shows a clean status even when the retired counter field is set', async () => {
    await bootPopup({
      refinzi_settings: {
        provider: 'gemini',
        apiKeys: { gemini: DEPRECATED_GEMINI_API_KEYS[0] },
        freeUsageCount: 25,
        freeUsageExpired: true,
      },
    });

    // A retired bundled key migrates to '' on read, so no free-tier state applies.
    expect(document.querySelectorAll('.engine-free')).toHaveLength(0);
    expect(document.getElementById('home-engine-banner')?.classList.contains('warn')).toBe(false);
  });

  it('hides free-tier status when the user supplies their own key', async () => {
    await bootPopup({
      refinzi_settings: {
        provider: 'gemini',
        apiKeys: { gemini: 'AIzaSyUserSuppliedKey' },
        freeUsageCount: 24,
      },
    });

    expect(document.querySelectorAll('.engine-free')).toHaveLength(0);
    expect(document.getElementById('engine-name')?.textContent).toContain('BYOK');
    expect(document.getElementById('home-engine-banner')?.classList.contains('warn')).toBe(false);
  });

  it('populates the dashboard estimate inputs from the persisted metrics config', async () => {
    await bootPopup({ refinzi_metrics_config: { estimatedMinutesPerPrompt: 4, estimatedAvoidedIterations: 2 } });

    expect((document.getElementById('setting-est-minutes') as HTMLInputElement)?.value).toBe('4');
    expect((document.getElementById('setting-est-iterations') as HTMLInputElement)?.value).toBe('2');
    // Untouched field keeps the documented default.
    expect((document.getElementById('setting-fallback-cost') as HTMLInputElement)?.value).toBe('0.008');
  });
});
