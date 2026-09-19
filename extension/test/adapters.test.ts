import { describe, it, expect } from 'vitest';
import { ChatGPTAdapter } from '../src/adapters/chatgpt';
import { ClaudeAdapter } from '../src/adapters/claude';
import { GeminiAdapter } from '../src/adapters/gemini';
import { PerplexityAdapter } from '../src/adapters/perplexity';
import { AdapterRegistry } from '../src/adapters/registry';

describe('Refinzi Site Adapters Layer', () => {
  it('instantiates all required platforms', () => {
    const chatgpt = new ChatGPTAdapter();
    const claude = new ClaudeAdapter();
    const gemini = new GeminiAdapter();
    const perplexity = new PerplexityAdapter();

    expect(chatgpt.id).toBe('chatgpt');
    expect(claude.id).toBe('claude');
    expect(gemini.id).toBe('gemini');
    expect(perplexity.id).toBe('perplexity');
  });

  it('registry provides all 4 primary adapters plus generic', () => {
    const all = AdapterRegistry.getAllAdapters();
    expect(all.length).toBeGreaterThanOrEqual(4);
    const ids = all.map((a) => a.id);
    expect(ids).toContain('chatgpt');
    expect(ids).toContain('claude');
    expect(ids).toContain('gemini');
    expect(ids).toContain('perplexity');
  });

  it('detects generic / local test environment', () => {
    // In node/test runner, hostname is blank or localhost
    const active = AdapterRegistry.getActiveAdapter();
    expect(active).not.toBeNull();
  });
});
