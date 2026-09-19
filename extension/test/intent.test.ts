import { describe, it, expect } from 'vitest';
import { extractSemanticIntent } from '../src/engine/intent';

describe('Refinzi Semantic Intent Layer', () => {
  it('correctly classifies coding domain and extracts technical intent', () => {
    const raw = 'Write a React TypeScript hook for debouncing user input with unit tests';
    const sio = extractSemanticIntent(raw, 'better');

    expect(sio.domain).toBe('code');
    expect(sio.artifactType).toBe('code');
    expect(sio.objective).toContain('React TypeScript hook');
    expect(sio.audience).toContain('engineers');
    expect(sio.confidence).toBeGreaterThan(0.5);
  });

  it('correctly classifies marketing domain and extracts conversion intent', () => {
    const raw = 'make a marketing plan for my b2b saas startup';
    const sio = extractSemanticIntent(raw, 'better');

    expect(sio.domain).toBe('marketing');
    expect(sio.objective).toContain('Marketing plan');
    expect(sio.desiredOutput).toContain('copy');
  });

  it('correctly classifies research domain', () => {
    const raw = 'Conduct a literature review on statistical confounders in clinical trials';
    const sio = extractSemanticIntent(raw, 'expert');

    expect(sio.domain).toBe('research');
    expect(sio.artifactType).toBe('query');
    expect(sio.objective).toContain('Literature review');
  });

  it('correctly identifies user constraints', () => {
    const raw = 'Explain microservices architecture in 3 bullet points under 100 words without jargon';
    const sio = extractSemanticIntent(raw, 'better');

    expect(sio.constraints.length).toBeGreaterThan(0);
    expect(sio.constraints.some((c) => c.toLowerCase().includes('bullet') || c.toLowerCase().includes('words'))).toBe(true);
  });
});
