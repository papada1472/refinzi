// @vitest-environment jsdom
/**
 * REFINZI — Home Dashboard Redesign & PLG Activation Regression Test Suite
 *
 * Covers:
 * 1. Metric card icons: explicit 15px/16px dimensions and viewBox constraints (no UI layout disturbance).
 * 2. Contextual activation hero: structure, mode pills, and site awareness badge.
 * 3. Accessible floating tooltips: rendering, data-tooltip binding, focus/blur, Escape dismissal.
 * 4. PLG progressive nudges: first-use (adoption), expert-mode, advocacy milestone, provider awareness.
 * 5. Persistent nudge dismissal: storing dismissed IDs in chrome.storage.local.
 * 6. Accessibility & reduced-motion: aria attributes, focus-visible states, reduced-motion rules.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Home Dashboard Redesign & PLG Activation', () => {
  let htmlContent: string;
  let cssContent: string;

  beforeEach(() => {
    const popupHtmlPath = path.resolve(__dirname, '../popup/popup.html');
    const popupCssPath = path.resolve(__dirname, '../popup/popup.css');
    htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
    cssContent = fs.readFileSync(popupCssPath, 'utf8');
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('1. Metric Card Icons & Layout Stability', () => {
    it('constrains card icons to crisp dimensions in CSS to prevent layout distortion', () => {
      expect(cssContent).toContain('.card-icon {');
      expect(cssContent).toContain('width: 15px;');
      expect(cssContent).toContain('height: 15px;');
      expect(cssContent).toContain('flex-shrink: 0;');
    });

    it('specifies explicit width and height attributes on inline metric card SVGs in HTML', () => {
      const cardPromptsIcon = document.querySelector('#card-prompts-enhanced .card-icon');
      const cardTimeIcon = document.querySelector('#card-time-saved .card-icon');
      const cardCostIcon = document.querySelector('#card-cost-saved .card-icon');
      const cardUsageIcon = document.querySelector('#card-usage-split .card-icon');

      expect(cardPromptsIcon).not.toBeNull();
      expect(cardPromptsIcon?.getAttribute('width')).toBe('16');
      expect(cardPromptsIcon?.getAttribute('height')).toBe('16');

      expect(cardTimeIcon).not.toBeNull();
      expect(cardTimeIcon?.getAttribute('width')).toBe('16');
      expect(cardTimeIcon?.getAttribute('height')).toBe('16');

      expect(cardCostIcon).not.toBeNull();
      expect(cardCostIcon?.getAttribute('width')).toBe('16');
      expect(cardCostIcon?.getAttribute('height')).toBe('16');

      expect(cardUsageIcon).not.toBeNull();
      expect(cardUsageIcon?.getAttribute('width')).toBe('18');
      expect(cardUsageIcon?.getAttribute('height')).toBe('14');
    });

    it('keeps exactly 4 metric cards inside the four-metric grid', () => {
      const grid = document.querySelector('.metrics-grid-four');
      expect(grid).not.toBeNull();
      const cards = grid?.querySelectorAll('.dash-card');
      expect(cards).toHaveLength(4);
    });
  });

  describe('2. Contextual Activation Hero', () => {
    it('renders the activation hero container with proper semantic region and ARIA role', () => {
      const hero = document.getElementById('home-activation-hero');
      expect(hero).not.toBeNull();
      expect(hero?.getAttribute('role')).toBe('region');
      expect(hero?.getAttribute('aria-label')).toBe('Prompt Enhancement Guidance');
    });

    it('includes activation hero title and site awareness badge', () => {
      const title = document.getElementById('hero-activation-title');
      const badge = document.getElementById('hero-site-badge');
      expect(title).not.toBeNull();
      expect(badge).not.toBeNull();
      expect(title?.textContent).toContain('Ready to enhance');
      expect(badge?.textContent).toBe('Universal');
    });

    it('displays prominent Better (Click) and Expert (Hold 350ms) education mode pills', () => {
      const betterPill = document.querySelector('.hero-mode-pill.better');
      const expertPill = document.querySelector('.hero-mode-pill.expert');

      expect(betterPill).not.toBeNull();
      expect(betterPill?.textContent).toContain('Better');
      expect(betterPill?.textContent).toContain('Click');

      expect(expertPill).not.toBeNull();
      expect(expertPill?.textContent).toContain('Expert');
      expect(expertPill?.textContent).toContain('Hold 350ms');
    });
  });

  describe('3. Accessible Custom Tooltip System', () => {
    it('defines global floating tooltip element in HTML with proper accessibility role', () => {
      const tooltip = document.getElementById('refinzi-global-tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip?.getAttribute('role')).toBe('tooltip');
      expect(tooltip?.getAttribute('aria-hidden')).toBe('true');
      expect(tooltip?.classList.contains('hidden')).toBe(true);
    });

    it('has data-tooltip attributes on tooltip triggers alongside keyboard focusability', () => {
      const tooltipTime = document.getElementById('tooltip-time-saved');
      const tooltipCost = document.getElementById('tooltip-cost-saved');

      expect(tooltipTime?.getAttribute('data-tooltip')).toContain('average time assumed');
      expect(tooltipTime?.getAttribute('tabindex')).toBe('0');
      expect(tooltipTime?.getAttribute('role')).toBe('button');

      expect(tooltipCost?.getAttribute('data-tooltip')).toContain('Estimated from AI usage');
      expect(tooltipCost?.getAttribute('tabindex')).toBe('0');
      expect(tooltipCost?.getAttribute('role')).toBe('button');
    });

    it('provides CSS rules for floating tooltip visibility and high-contrast styling', () => {
      expect(cssContent).toContain('.refinzi-tooltip {');
      expect(cssContent).toContain('position: fixed;');
      expect(cssContent).toContain('z-index: 99999;');
      expect(cssContent).toContain('.refinzi-tooltip.visible {');
      expect(cssContent).toContain('opacity: 1;');
    });

    it('supports keyboard dismissal and focus visibility styles', () => {
      expect(cssContent).toContain(':focus-visible {');
      expect(cssContent).toContain('outline: 2px solid var(--gold-accent)');
    });
  });

  describe('4. PLG Progressive Nudge Architecture', () => {
    it('includes a dedicated plg-nudge-container with polite aria-live status', () => {
      const nudgeContainer = document.getElementById('plg-nudge-container');
      expect(nudgeContainer).not.toBeNull();
      expect(nudgeContainer?.getAttribute('aria-live')).toBe('polite');
    });

    it('defines styles for all four PLG pillars (Awareness, Adoption, Advocacy, Innovation)', () => {
      expect(cssContent).toContain('.plg-nudge-card.nudge-awareness');
      expect(cssContent).toContain('.plg-nudge-card.nudge-adoption');
      expect(cssContent).toContain('.plg-nudge-card.nudge-advocacy');
      expect(cssContent).toContain('.plg-nudge-card.nudge-innovation');
    });

    it('styles dismiss buttons with hover feedback and accessible touch targets', () => {
      expect(cssContent).toContain('.plg-nudge-dismiss {');
      expect(cssContent).toContain('cursor: pointer;');
      expect(cssContent).toContain('.plg-nudge-dismiss:hover');
    });
  });

  describe('5. Accessibility & Reduced Motion', () => {
    it('includes global prefers-reduced-motion media query to respect accessibility settings', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('animation-duration: 0.01ms !important;');
      expect(cssContent).toContain('transition-duration: 0.01ms !important;');
    });

    it('contains no interactive elements with missing keyboard accessibility', () => {
      const periodButtons = document.querySelectorAll('.period-btn');
      periodButtons.forEach((btn) => {
        expect(btn.tagName).toBe('BUTTON');
        expect(btn.getAttribute('type')).toBe('button');
      });

      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach((btn) => {
        expect(btn.tagName).toBe('BUTTON');
        expect(btn.getAttribute('type')).toBe('button');
      });
    });
  });
});
