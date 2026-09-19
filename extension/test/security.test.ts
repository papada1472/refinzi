import { describe, it, expect } from 'vitest';
import { escapeHTML } from '../src/utils/sanitize';

describe('Refinzi Security & Sanitization Layer', () => {
  it('neutralizes HTML tags and script injections', () => {
    const malicious = '<script>alert("xss")</script><img src="x" onerror="steal()" />';
    const escaped = escapeHTML(malicious);

    expect(escaped).not.toContain('<script>');
    expect(escaped).not.toContain('</script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&lt;img');
  });

  it('neutralizes attribute quotation escapes', () => {
    const attack = `" onfocus="alert(1)" ' onclick='hack()`;
    const escaped = escapeHTML(attack);

    expect(escaped).not.toContain('"');
    expect(escaped).not.toContain("'");
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#039;');
  });

  it('safely handles empty and non-string inputs', () => {
    expect(escapeHTML('')).toBe('');
    expect(escapeHTML(null as any)).toBe('');
    expect(escapeHTML(undefined as any)).toBe('');
  });
});
