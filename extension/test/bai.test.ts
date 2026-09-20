// @vitest-environment jsdom
/**
 * REFINZI — b.ai (Qwen 3.8 Flash) Provider Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BAIProvider } from '../src/providers/bai';
import { DEFAULT_BAI_API_KEY, DEFAULT_BAI_ENDPOINT } from '../src/utils/storage';
import { SemanticIntent } from '../src/types';

describe('Refinzi — b.ai Direct Provider', () => {
  const sampleIntent: SemanticIntent = {
    artifactType: 'text',
    rawInput: 'write a landing page copy for a SaaS product',
    intent: 'copywriting',
    objective: 'create compelling landing page copy',
    domain: 'business',
    targetAi: 'chatgpt',
    calibratedDimensions: ['value proposition', 'target audience', 'call to action'],
    assumptions: ['B2B audience', 'modern clean tone'],
    audience: 'founders and product managers',
    constraints: ['concise', 'benefit-focused'],
    context: ['high converting SaaS landing pages'],
    desiredOutput: 'structured hero, features, CTA copy',
    confidence: 0.95,
    mode: 'better',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default b.ai API key, endpoint, and qwen3.8-flash model', () => {
    const provider = new BAIProvider();
    expect((provider as any).apiKey).toBe(DEFAULT_BAI_API_KEY);
    expect((provider as any).model).toBe('qwen3.8-flash');
    expect((provider as any).baseUrl).toBe(DEFAULT_BAI_ENDPOINT);
  });

  it('successfully generates calibrated Better mode prompt via b.ai', async () => {
    const fakeResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              mode: 'better',
              prompt: 'Act as a principal copywriter. Draft high-converting SaaS landing page copy with Hero, Benefits, and CTA.',
              shortReason: 'Framed role, structure, and conversion goal',
              domain: 'business',
              calibratedDimensions: ['audience', 'structure'],
            }),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeResponse,
    } as any);

    const provider = new BAIProvider('sk-test-key');
    const result = await provider.generateBetter('write a landing page copy', sampleIntent);

    expect(result.isFallback).toBeFalsy();
    expect(result.mode).toBe('better');
    expect(result.prompt).toContain('principal copywriter');
    expect(global.fetch).toHaveBeenCalledWith(
      `${DEFAULT_BAI_ENDPOINT.replace(/\/+$/, '')}/chat/completions`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test-key',
        }),
      })
    );
  });

  it('successfully generates Expert mode briefing via b.ai', async () => {
    const fakeExpertResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              mode: 'expert',
              prompt: '# OBJECTIVE\nGenerate conversion-focused SaaS copy.\n# CONTEXT & CONSTRAINTS\nB2B audience.',
              briefingSummary: 'Comprehensive multi-section landing page spec',
              sections: ['OBJECTIVE', 'CONTEXT & CONSTRAINTS'],
            }),
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeExpertResponse,
    } as any);

    const provider = new BAIProvider('sk-test-key');
    const expertIntent = { ...sampleIntent, mode: 'expert' as const };
    const result = await provider.generateExpert('write a landing page copy', expertIntent);

    expect(result.isFallback).toBeFalsy();
    expect(result.mode).toBe('expert');
    expect(result.prompt).toContain('# OBJECTIVE');
  });

  it('gracefully degrades to local synthesis with classified INVALID_KEY on HTTP 401', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: 'Invalid API Key' } }),
    } as any);

    const provider = new BAIProvider('sk-invalid-key');
    const result = await provider.generateBetter('write a poem', sampleIntent);

    expect(result.isFallback).toBe(true);
    expect(result.providerFailure?.provider).toBe('bai');
    expect(result.providerFailure?.code).toBe('INVALID_KEY');
    expect(result.prompt.length).toBeGreaterThan(0);
  });

  it('gracefully degrades to local synthesis with RATE_LIMITED on HTTP 429', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: 'rate_limit_exceeded' } }),
    } as any);

    const provider = new BAIProvider('sk-throttled');
    const result = await provider.generateExpert('write a poem', { ...sampleIntent, mode: 'expert' });

    expect(result.isFallback).toBe(true);
    expect(result.providerFailure?.provider).toBe('bai');
    expect(result.providerFailure?.code).toBe('RATE_LIMITED');
  });

  it('falls back to local engine without network request if API key is empty', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as any;

    const provider = new BAIProvider('');
    const result = await provider.generateBetter('write code', sampleIntent);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.isFallback).toBe(true);
    expect(result.providerFailure?.code).toBe('NO_KEY');
  });

  it('tests connection via GET /models endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as any);

    const provider = new BAIProvider('sk-valid');
    const status = await provider.testConnection();

    expect(status.ok).toBe(true);
    expect(status.message).toContain('b.ai connected successfully');
    expect(global.fetch).toHaveBeenCalledWith(
      `${DEFAULT_BAI_ENDPOINT.replace(/\/+$/, '')}/models`,
      expect.objectContaining({ method: 'GET' })
    );
  });
});
