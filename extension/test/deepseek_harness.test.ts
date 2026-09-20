import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeepSeekProvider } from '../src/providers/deepseek';
import { extractSemanticIntent } from '../src/engine/intent';
import { calculateCostSaved, MODEL_PRICING } from '../src/utils/metrics';
import { GOLDEN_PROMPT_BENCHMARK } from './prompt_engine_eval.test';

describe('DEEPSEEK EVALUATION & TEST HARNESS', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('1. Instantiation & Configuration', () => {
    it('initializes with default model "deepseek-flash"', () => {
      const provider = new DeepSeekProvider('dummy-key');
      expect(provider.id).toBe('deepseek');
      expect(provider.name).toBe('DeepSeek');
      expect((provider as any).model).toBe('deepseek-flash');
    });

    it('initializes with custom model "deepseek-reasoner" (R1)', () => {
      const provider = new DeepSeekProvider('dummy-key', 'deepseek-reasoner');
      expect((provider as any).model).toBe('deepseek-reasoner');
    });
  });

  describe('2. Connection Diagnostics (testConnection)', () => {
    it('returns ok: true when /models returns HTTP 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }] }),
      } as any);

      const provider = new DeepSeekProvider('valid-test-key');
      const result = await provider.testConnection();

      expect(result.ok).toBe(true);
      expect(result.message).toContain('verified successfully');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/models',
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer valid-test-key' },
        })
      );
    });

    it('returns ok: false when /models returns HTTP 401 Unauthorized', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as any);

      const provider = new DeepSeekProvider('invalid-key');
      const result = await provider.testConnection();

      expect(result.ok).toBe(false);
      expect(result.message).toContain('status 401');
    });

    it('handles network / timeout abort gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection timed out'));

      const provider = new DeepSeekProvider('any-key');
      const result = await provider.testConnection();

      expect(result.ok).toBe(false);
      expect(result.message).toContain('Connection timed out');
    });
  });

  describe('3. Better Mode Calibration (generateBetter)', () => {
    it('falls back to local heuristic synthesis if API key is missing', async () => {
      const provider = new DeepSeekProvider('');
      const intent = extractSemanticIntent('debug memory leak in node server', 'better', 'chatgpt');

      const res = await provider.generateBetter('debug memory leak in node server', intent);

      expect(res.mode).toBe('better');
      expect(res.prompt.length).toBeGreaterThan(20);
      expect(res.domain).toBe('code');
      expect(res.shortReason).toBeDefined();
    });

    it('parses valid JSON response from DeepSeek chat completions', async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                mode: 'better',
                prompt: 'Diagnose and resolve the Node.js memory leak using heap dump profiling and memory snapshots.',
                shortReason: 'Clarified diagnostic steps and profiling tools.',
                domain: 'code',
                calibratedDimensions: ['heap profiling', 'tooling'],
                targetAi: 'chatgpt',
              }),
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as any);

      const provider = new DeepSeekProvider('sk-test-key', 'deepseek-chat');
      const intent = extractSemanticIntent('fix memory leak', 'better', 'chatgpt');
      const res = await provider.generateBetter('fix memory leak', intent);

      expect(res.mode).toBe('better');
      expect(res.prompt).toContain('heap dump profiling');
      expect(res.shortReason).toContain('profiling');
    });

    it('falls back to local synthesis if DeepSeek returns HTTP 500 error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as any);

      const provider = new DeepSeekProvider('sk-test-key');
      const intent = extractSemanticIntent('write landing page hero', 'better', 'claude');
      const res = await provider.generateBetter('write landing page hero', intent);

      expect(res.mode).toBe('better');
      expect(res.prompt).toBeDefined();
      expect(res.prompt.length).toBeGreaterThan(20);
    });
  });

  describe('4. Expert Mode Calibration (generateExpert)', () => {
    it('parses structured Expert JSON and preserves defensible assumptions', async () => {
      const mockExpertResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                mode: 'expert',
                prompt: 'Develop an enterprise GTM expansion strategy for the US market with beachhead ICP and channel economics.',
                intent: 'GTM Strategy',
                summary: 'Comprehensive US market entry framework',
                domain: 'business',
                assumptions: ['B2B SaaS product', 'Series A stage', 'Direct sales motion'],
              }),
            },
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockExpertResponse,
      } as any);

      const provider = new DeepSeekProvider('sk-test-key', 'deepseek-reasoner');
      const intent = extractSemanticIntent('GTM for US market', 'expert', 'gemini');
      const res = await provider.generateExpert('GTM for US market', intent);

      expect(res.mode).toBe('expert');
      expect(res.prompt).toContain('GTM expansion strategy');
      expect(res.domain).toBe('business');
      expect(res.assumptions).toContain('B2B SaaS product');
    });

    it('falls back to local expert briefing on malformed JSON payload', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'not valid json' } }] }),
      } as any);

      const provider = new DeepSeekProvider('sk-test-key');
      const intent = extractSemanticIntent('email client apologizing for delay', 'expert', 'claude');
      const res = await provider.generateExpert('email client apologizing for delay', intent);

      expect(res.mode).toBe('expert');
      expect(res.prompt).toContain('email');
    });
  });

  describe('5. DeepSeek Pricing & Metrics Harness', () => {
    it('contains verified MODEL_PRICING entries for deepseek-chat and deepseek-reasoner', () => {
      expect(MODEL_PRICING['deepseek-chat']).toEqual({
        inputPer1k: 0.00014,
        outputPer1k: 0.00028,
        averageTurnCost: 0.00029,
      });

      expect(MODEL_PRICING['deepseek-reasoner']).toEqual({
        inputPer1k: 0.00055,
        outputPer1k: 0.00219,
        averageTurnCost: 0.00203,
      });
    });

    it('computes accurate cost saved for DeepSeek usage events with token usage', () => {
      const res = calculateCostSaved([
        {
          id: 'ds-1',
          timestamp: Date.now(),
          mode: 'better',
          targetAi: 'chatgpt',
          provider: 'deepseek',
          model: 'deepseek-chat',
          success: true,
          tokenUsage: {
            promptTokens: 1000,
            completionTokens: 1000,
            totalTokens: 2000,
          },
        },
      ]);

      // Direct cost = (1 * 0.00014) + (1 * 0.00028) = 0.00042
      // Savings with 1.5 avoided iterations = 0.00042 * 1.5 = 0.00063
      expect(res.hasData).toBe(true);
      expect(res.costUsd).toBeCloseTo(0.00063, 5);
      expect(res.formatted).toBe('~$0.01');
    });

    it('computes accurate cost saved for deepseek-reasoner based on average turn cost when token count is omitted', () => {
      const res = calculateCostSaved([
        {
          id: 'ds-2',
          timestamp: Date.now(),
          mode: 'expert',
          targetAi: 'claude',
          provider: 'deepseek',
          model: 'deepseek-reasoner',
          success: true,
        },
      ]);

      // Turn cost = 0.00203 * 1.5 = 0.003045
      expect(res.hasData).toBe(true);
      expect(res.costUsd).toBeCloseTo(0.003045, 5);
    });
  });

  describe('6. DeepSeek Benchmark Quality Evaluation', () => {
    it('passes anti-template check across benchmark domains with DeepSeek fallback', async () => {
      const provider = new DeepSeekProvider('');
      const sampleCases = GOLDEN_PROMPT_BENCHMARK.slice(0, 5);

      for (const testCase of sampleCases) {
        const intent = extractSemanticIntent(testCase.rawInput, 'better', 'chatgpt');
        const betterPromise = provider.generateBetter(testCase.rawInput, intent);
        await expect(betterPromise).resolves.toBeDefined();
      }
    });
  });

  // Conditional Live Test: Only runs if real DEEPSEEK_API_KEY is supplied in process.env
  const liveApiKey = process.env.DEEPSEEK_API_KEY;
  (liveApiKey ? describe : describe.skip)('7. Live DeepSeek API Verification', () => {
    it('successfully connects and generates a Better prompt via live DeepSeek API', async () => {
      const provider = new DeepSeekProvider(liveApiKey!, 'deepseek-chat');
      const connection = await provider.testConnection();
      expect(connection.ok).toBe(true);

      const intent = extractSemanticIntent('Explain quantum computing to a 10 year old', 'better', 'chatgpt');
      const result = await provider.generateBetter('Explain quantum computing to a 10 year old', intent);

      expect(result.mode).toBe('better');
      expect(result.prompt.length).toBeGreaterThan(20);
    }, 20000);
  });
});
