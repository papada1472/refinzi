import { describe, it, expect } from 'vitest';
import {
  extractAndParseJSON,
  validateBetterResponse,
  validateExpertFinalResponse,
} from '../src/engine/validator';

describe('Refinzi Response Validator & JSON Recovery', () => {
  it('parses clean JSON directly', () => {
    const raw = '{"mode":"better","prompt":"High-impact prompt","shortReason":"Refined"}';
    const parsed = extractAndParseJSON(raw);
    expect(parsed).toEqual({ mode: 'better', prompt: 'High-impact prompt', shortReason: 'Refined' });
  });

  it('strips markdown code blocks and preambles', () => {
    const raw = `Here is your prompt refinement:
\`\`\`json
{
  "mode": "better",
  "prompt": "Clean markdown stripped prompt",
  "shortReason": "Removed noise"
}
\`\`\`
Hope this helps!`;
    const parsed = extractAndParseJSON(raw);
    expect(parsed).not.toBeNull();
    const validated = validateBetterResponse(parsed);
    expect(validated?.prompt).toBe('Clean markdown stripped prompt');
  });

  it('recovers from control characters inside json string', () => {
    const raw = `{"mode":"better","prompt":"Line 1\nLine 2\tTabbed","shortReason":"multiline"}`;
    const parsed = extractAndParseJSON(raw);
    expect(parsed).not.toBeNull();
    const validated = validateBetterResponse(parsed);
    expect(validated?.prompt).toContain('Line 1');
  });

  it('validates expert final responses and preserves assumptions', () => {
    const raw = {
      mode: 'expert',
      prompt: 'Production code specification',
      intent: 'Build auth',
      summary: 'Calibrated',
      domain: 'code',
      assumptions: ['Node.js', 'PostgreSQL'],
    };
    const validated = validateExpertFinalResponse(raw);
    expect(validated?.mode).toBe('expert');
    expect(validated?.assumptions).toEqual(['Node.js', 'PostgreSQL']);
  });

  it('rejects invalid structures cleanly without throwing', () => {
    expect(validateBetterResponse(null)).toBeNull();
    expect(validateBetterResponse({})).toBeNull();
    expect(validateBetterResponse({ mode: 'better', prompt: '' })).toBeNull();
    expect(validateExpertFinalResponse({ prompt: '' })).toBeNull();
  });
});
