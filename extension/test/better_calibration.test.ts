import { describe, it, expect } from 'vitest';
import { synthesizeBetterPrompt } from '../src/engine/better';
import { analyzeTask } from '../src/engine/calibration/taskAnalyzer';
import { validateCalibrationQuality } from '../src/engine/calibration/qualityValidator';

describe('Refinzi Better Mode — Task-Aware Calibration Engine', () => {
  // TEST CASE 1: GTM to enter in US market
  it('calibrates "GTM to enter in US market" with specific GTM dimensions and zero generic boilerplate', () => {
    const raw = 'GTM to enter in US market';
    const result = synthesizeBetterPrompt(raw, 'chatgpt');
    const lower = result.prompt.toLowerCase();

    // 1. Preserves GTM and US market intent
    expect(lower).toMatch(/go-to-market|gtm/);
    expect(lower).toMatch(/us market|united states/);

    // 2. Contains relevant GTM dimensions
    expect(lower).toContain('target customer');
    expect(lower).toContain('market-entry');
    expect(lower).toContain('positioning');
    expect(lower).toContain('channels');
    expect(lower).toContain('kpis');

    // 3. Instructs AI to state assumptions rather than hallucinating company facts
    expect(lower).toMatch(/state any assumptions|assumptions where/);

    // 4. CRITICAL: Zero generic marketing boilerplate
    expect(lower).not.toContain('develop an actionable, high-converting marketing strategy and copy for:');
    expect(lower).not.toContain('execution framework:');
    expect(lower).not.toContain('ready-to-use deliverable:');

    // 5. Anti-hallucination: No fabricated company or product
    expect(lower).not.toContain('saas platform with $10k mrr');
    expect(lower).not.toContain('fintech app');

    // 6. Quality validation gate passes
    const analysis = analyzeTask(raw);
    const validation = validateCalibrationQuality(result, analysis);
    expect(validation.passed).toBe(true);
    expect(validation.failedChecks).toHaveLength(0);
  });

  // TEST CASE 2: cool sports car in desert sunset
  it('calibrates "cool sports car in desert sunset" with visual optics without inventing specific car models', () => {
    const raw = 'cool sports car in desert sunset';
    const result = synthesizeBetterPrompt(raw, 'midjourney');
    const lower = result.prompt.toLowerCase();

    // Visual dimensions added
    expect(lower).toMatch(/anamorphic|24mm|35mm|lens/);
    expect(lower).toMatch(/golden hour|warm backlighting|sunset/);
    expect(lower).toMatch(/desert/);
    expect(lower).toMatch(/cinematic|photorealistic|automotive photography/);

    // ZERO arbitrary invention of car brands
    expect(lower).not.toContain('porsche 911');
    expect(lower).not.toContain('porsche');
    expect(lower).not.toContain('ferrari');
    expect(lower).not.toContain('lamborghini');
    expect(lower).not.toContain('bmw');

    const analysis = analyzeTask(raw);
    const validation = validateCalibrationQuality(result, analysis);
    expect(validation.passed).toBe(true);
  });

  // TEST CASE 3: fix this python code
  it('calibrates "fix this python code" with debugging rigor without inventing frameworks', () => {
    const raw = 'fix this python code';
    const result = synthesizeBetterPrompt(raw, 'claude');
    const lower = result.prompt.toLowerCase();

    expect(lower).toContain('python');
    expect(lower).toContain('root cause');
    expect(lower).toContain('edge case');
    expect(lower).toMatch(/verification test|confirming the fix/);

    // Must not invent arbitrary frameworks
    expect(lower).not.toContain('django');
    expect(lower).not.toContain('fastapi');
    expect(lower).not.toContain('flask');

    const analysis = analyzeTask(raw);
    const validation = validateCalibrationQuality(result, analysis);
    expect(validation.passed).toBe(true);
  });

  // TEST CASE 4: research AI startups in India
  it('calibrates "research AI startups in India" with landscape scope and criteria', () => {
    const raw = 'research AI startups in India';
    const result = synthesizeBetterPrompt(raw, 'perplexity');
    const lower = result.prompt.toLowerCase();

    expect(lower).toContain('india');
    expect(lower).toContain('ai startups');
    expect(lower).toMatch(/landscape|categor|funding/);
    expect(lower).toMatch(/timeframe|criteria/);

    const analysis = analyzeTask(raw);
    const validation = validateCalibrationQuality(result, analysis);
    expect(validation.passed).toBe(true);
  });

  // TEST CASE 5: write a LinkedIn post about AI agents
  it('calibrates "write a LinkedIn post about AI agents" with professional hook and zero generic sales copy', () => {
    const raw = 'write a LinkedIn post about AI agents';
    const result = synthesizeBetterPrompt(raw, 'chatgpt');
    const lower = result.prompt.toLowerCase();

    expect(lower).toContain('linkedin');
    expect(lower).toContain('ai agents');
    expect(lower).toContain('hook');
    expect(lower).toMatch(/practical applications|insights/);
    expect(lower).toMatch(/discussion prompt|question/);

    // Must NOT be wrapped in a direct-response sales page framework
    expect(lower).not.toContain('conversion funnel');
    expect(lower).not.toContain('target buyer: calibrated for');

    const analysis = analyzeTask(raw);
    const validation = validateCalibrationQuality(result, analysis);
    expect(validation.passed).toBe(true);
  });

  // TEST CASE 6: ALREADY GOOD PROMPT (Minimum Sufficient Calibration)
  it('applies minimal modification to an already comprehensive and detailed prompt', () => {
    const detailedPrompt = [
      'Objective: Build a high-performance Redis cache layer for user session management in Go.',
      'Context: Microservices architecture handling 50k requests per second with strict 10ms latency SLAs.',
      'Requirements: Implement sliding window expiration, connection pooling with go-redis, and failover circuit breaking.',
      'Constraints: Do not block main thread. Zero memory leaks.',
      'Deliverable: Complete, runnable Go module with benchmark tests.',
      'Evaluation Criteria: 100% test coverage and sub-5ms p99 latency in benchmarks.'
    ].join('\n');

    const result = synthesizeBetterPrompt(detailedPrompt, 'claude');

    // Verifies the user's detailed prompt is preserved almost verbatim
    expect(result.prompt).toContain('Objective: Build a high-performance Redis cache layer');
    expect(result.prompt).toContain('Evaluation Criteria: 100% test coverage');
    expect(result.prompt).toContain('sliding window expiration');

    // Does not rewrite or replace with a generic template
    expect(result.prompt.length).toBeGreaterThanOrEqual(detailedPrompt.length);
    expect(result.prompt.length).toBeLessThan(detailedPrompt.length + 150);
  });

  // Anti-Generic Quality Check: Output must not be identical across different inputs
  it('produces distinct, non-templated outputs for different prompts within the same domain', () => {
    const p1 = synthesizeBetterPrompt('GTM to enter in US market');
    const p2 = synthesizeBetterPrompt('b2b saas pricing strategy for enterprise customers');

    expect(p1.prompt).not.toEqual(p2.prompt);
    expect(p1.prompt).toContain('US market');
    expect(p2.prompt).toContain('pricing strategy');
  });
});
