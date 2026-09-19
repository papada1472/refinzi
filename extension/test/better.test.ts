import { describe, it, expect } from 'vitest';
import { synthesizeBetterPrompt } from '../src/engine/better';

describe('Refinzi Better Prompt Engine — Task-Aware Calibration', () => {
  it('calibrates image generation with visual dimensions without arbitrary invention', () => {
    const raw = 'cool sports car in desert sunset';
    const result = synthesizeBetterPrompt(raw, 'midjourney');

    expect(result.mode).toBe('better');
    expect(result.domain).toBe('image_gen');
    expect(result.prompt).toBeDefined();

    // Verifies technical visual dimensions are supplied
    const lower = result.prompt.toLowerCase();
    expect(lower).toMatch(/lens|anamorphic|angle|lighting|golden hour|cinematic/);

    // Verifies NO arbitrary invention of specific car models (e.g. Porsche 911)
    expect(lower).not.toContain('porsche 911');
    expect(lower).not.toContain('ferrari');

    // Verifies calibration metadata
    expect(result.shortReason).toContain('Calibrated');
  });

  it('calibrates code tasks with concrete production requirements and edge cases', () => {
    const raw = 'write a python script to parse CSV files';
    const result = synthesizeBetterPrompt(raw, 'chatgpt');

    expect(result.mode).toBe('better');
    expect(result.domain).toBe('code');
    expect(result.prompt.toLowerCase()).toContain('python');
    expect(result.prompt.toLowerCase()).toMatch(/edge[- ]cases?/);
  });

  it('calibrates marketing strategy with audience, positioning, and metrics', () => {
    const raw = 'make a marketing plan';
    const result = synthesizeBetterPrompt(raw, 'claude');

    expect(result.mode).toBe('better');
    expect(result.prompt.toLowerCase()).toMatch(/target buyer|audience|positioning|channel/);
    expect(result.prompt.toLowerCase()).toMatch(/kpi|metric|call to action/);
  });

  it('respects the Minimum Sufficient Calibration rule (concise, high impact)', () => {
    const raw = 'summarize this quarterly earnings call';
    const result = synthesizeBetterPrompt(raw, 'chatgpt');

    const wordCount = result.prompt.split(/\s+/).length;
    expect(wordCount).toBeLessThan(250);
    expect(wordCount).toBeGreaterThan(15);
  });
});
