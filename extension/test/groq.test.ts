import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroqProvider } from '../src/providers/groq';
import { DEFAULT_GROQ_API_KEY } from '../src/utils/storage';
import { SemanticIntent } from '../src/types';

describe('Refinzi — Groq LPU Direct Provider', () => {
  let provider: GroqProvider;
  const mockIntent: SemanticIntent = {
    artifactType: 'text',
    rawInput: 'write a high converting landing page for my saas',
    intent: 'write a landing page',
    objective: 'create conversion-focused web copy',
    domain: 'marketing',
    targetAi: 'chatgpt',
    calibratedDimensions: ['headline', 'cta', 'social proof'],
    assumptions: ['Assumed: B2B audience', 'Assumed: English language'],
    audience: 'founder',
    constraints: ['concise', 'no fluff'],
    context: ['startup'],
    desiredOutput: 'landing page draft',
    confidence: 0.95,
    mode: 'better',
  };

  beforeEach(() => {
    provider = new GroqProvider('gsk_test_key_123', 'openai/gpt-oss-120b');
    vi.restoreAllMocks();
  });

  it('instantiates with the default Groq key and model', () => {
    const defaultProvider = new GroqProvider();
    expect((defaultProvider as any).apiKey).toBe(DEFAULT_GROQ_API_KEY);
    expect((defaultProvider as any).model).toBe('openai/gpt-oss-120b');
    expect(defaultProvider.id).toBe('groq');
    expect(defaultProvider.name).toBe('Groq');
  });

  it('successfully generates a Better prompt via Groq JSON completion', async () => {
    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              mode: 'better',
              prompt: 'Act as a direct-response copywriter. Develop a high-converting SaaS landing page with hero headline, value proposition, feature grid, and clear CTA.',
              shortReason: 'Calibrated conversion hierarchy and copywriting framing',
              domain: 'marketing',
              calibratedDimensions: ['headline', 'value-prop', 'cta'],
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    } as any);

    const res = await provider.generateBetter('write a high converting landing page for my saas', mockIntent);
    expect(res.mode).toBe('better');
    expect(res.prompt).toContain('Act as a direct-response copywriter');
    expect(res.isFallback).toBeFalsy();
  });

  it('successfully generates an Expert prompt via Groq JSON completion', async () => {
    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              mode: 'expert',
              prompt: '# SYSTEM INSTRUCTION: Senior B2B SaaS Growth Lead\n## EXECUTION PROTOCOL\n1. Target Persona Analysis\n2. Hero Section Architecture\n3. High-Conversion Proof Mechanics',
              intent: 'SaaS landing page architecture',
              summary: 'Comprehensive B2B SaaS conversion copy framework',
              domain: 'marketing',
              assumptions: ['Assumed: Seed/Series A stage', 'Assumed: Self-serve onboarding'],
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    } as any);

    const res = await provider.generateExpert('write a high converting landing page for my saas', mockIntent);
    expect(res.mode).toBe('expert');
    expect(res.prompt).toContain('# SYSTEM INSTRUCTION: Senior B2B SaaS Growth Lead');
    expect(res.assumptions).toContain('Assumed: Seed/Series A stage');
    expect(res.isFallback).toBeFalsy();
  });

  it('gracefully degrades to local synthesis with classified INVALID_KEY on HTTP 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => '{"error": {"message": "Invalid API Key"}}',
    } as any);

    const res = await provider.generateBetter('write a blog post', mockIntent);
    expect(res.isFallback).toBe(true);
    expect(res.providerFailure?.provider).toBe('groq');
    expect(res.providerFailure?.code).toBe('INVALID_KEY');
    expect(res.prompt.length).toBeGreaterThan(15);
  });

  it('gracefully degrades to local synthesis with RATE_LIMITED on HTTP 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => '{"error": {"message": "rate_limit_exceeded"}}',
    } as any);

    const res = await provider.generateExpert('build a react component', mockIntent);
    expect(res.isFallback).toBe(true);
    expect(res.providerFailure?.provider).toBe('groq');
    expect(res.providerFailure?.code).toBe('RATE_LIMITED');
    expect(res.prompt.length).toBeGreaterThan(15);
  });

  it('tests connection positively when Groq models endpoint returns 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as any);

    const testRes = await provider.testConnection();
    expect(testRes.ok).toBe(true);
    expect(testRes.message).toContain('Groq connected successfully');
  });

  it('tests connection negatively on HTTP 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as any);

    const testRes = await provider.testConnection();
    expect(testRes.ok).toBe(false);
    expect(testRes.message).toContain('Invalid Groq API key');
  });
});
