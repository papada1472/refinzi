// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeminiProvider } from '../src/providers/gemini';
import { AmbientOrb } from '../src/ui/orb';
import { UniversalTextEngine } from '../src/engine/surface/engine';
import { SemanticIntent } from '../src/types';

describe('BYOK Failure Diagnostics & Exact Reason Propagation', () => {
  const dummyIntent: SemanticIntent = {
    artifactType: 'text',
    rawInput: 'write a unit test',
    intent: 'write a unit test',
    objective: 'write a unit test',
    domain: 'code',
    targetAi: 'chatgpt',
    calibratedDimensions: [],
    assumptions: [],
    audience: 'general',
    constraints: [],
    context: [],
    desiredOutput: 'code',
    confidence: 1,
    mode: 'better',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns NO_KEY failure diagnostic when Gemini API key is missing', async () => {
    const provider = new GeminiProvider('');
    const result = await provider.generateBetter('write a unit test', dummyIntent);

    expect(result.isFallback).toBe(true);
    expect(result.providerFailure).toBeDefined();
    expect(result.providerFailure?.code).toBe('NO_KEY');
    expect(result.providerFailure?.reason).toContain('Gemini API key is not configured');
    expect(result.prompt.length).toBeGreaterThan(10);
  });

  it('returns INVALID_KEY failure diagnostic when Gemini returns HTTP 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: 'API_KEY_INVALID' } }),
    }));

    const provider = new GeminiProvider('invalid-key-xyz');
    const result = await provider.generateBetter('write a unit test', dummyIntent);

    expect(result.isFallback).toBe(true);
    expect(result.providerFailure).toBeDefined();
    expect(result.providerFailure?.status).toBe(401);
    expect(result.providerFailure?.code).toBe('INVALID_KEY');
    expect(result.providerFailure?.reason).toContain('HTTP 401');
  });

  it('returns QUOTA_EXCEEDED failure diagnostic when Gemini returns HTTP 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: 'RESOURCE_EXHAUSTED' } }),
    }));

    const provider = new GeminiProvider('valid-key-throttled');
    const result = await provider.generateBetter('write a unit test', dummyIntent);

    expect(result.isFallback).toBe(true);
    expect(result.providerFailure).toBeDefined();
    expect(result.providerFailure?.status).toBe(429);
    expect(result.providerFailure?.code).toBe('QUOTA_EXCEEDED');
    expect(result.providerFailure?.reason).toContain('HTTP 429');
  });

  it('renders BYOK failure nudge pill with exact error reason and CTA', () => {
    const composer = document.createElement('textarea');
    document.body.appendChild(composer);

    const orb = new AmbientOrb({ onBetter: vi.fn(), onExpert: vi.fn() }, 350);
    orb.attach(composer);

    const host = document.querySelector('[data-refinzi-orb-host="true"]');
    expect(host).not.toBeNull();

    orb.showByokNudge({
      reason: 'Gemini API key is invalid (HTTP 401)',
      isError: true,
    });

    const nudge = host?.shadowRoot?.querySelector('.byok-nudge-pill');
    expect(nudge).not.toBeNull();
    expect(nudge?.classList.contains('error-mode')).toBe(true);
    expect(nudge?.textContent).toContain('Gemini API key is invalid (HTTP 401)');
    expect(nudge?.textContent).toContain('Configure API Key →');

    orb.destroy();
    document.body.innerHTML = '';
  });

  it('auto-discovers dynamically inserted composer in DOM without hard refresh', async () => {
    let activated = false;
    const engine = new UniversalTextEngine({
      onSurfaceActivated: () => {
        activated = true;
      },
      onSurfaceDeactivated: () => {},
      onPositionUpdate: () => {},
    });

    engine.start();
    expect(activated).toBe(false);

    // Simulate SPA / login completing and inserting #prompt-textarea into the DOM
    const dynamicTextarea = document.createElement('textarea');
    dynamicTextarea.id = 'prompt-textarea';
    dynamicTextarea.getBoundingClientRect = () => ({
      top: 50,
      left: 50,
      right: 450,
      bottom: 150,
      width: 400,
      height: 100,
      x: 50,
      y: 50,
      toJSON: () => {},
    });
    document.body.appendChild(dynamicTextarea);

    // Engine scheduleSurfaceDiscovery uses 150ms debounce
    await new Promise((r) => setTimeout(r, 200));

    expect(activated).toBe(true);
    expect(engine.getActiveSurface()?.element).toBe(dynamicTextarea);

    engine.destroy();
    document.body.innerHTML = '';
  });
});
