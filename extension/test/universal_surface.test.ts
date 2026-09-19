// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSafeEditableElement,
  NativeTextSurface,
  ContentEditableSurface,
  RichTextSurface,
  SurfaceFactory,
  UniversalTextEngine,
  getDestinationName,
} from '../src/engine/surface';
import { RefinziController } from '../src/ui/controller';
import { BrowserAPI } from '../src/browser/api';

describe('Universal Browser Text Layer Engine', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('1. Safety Exclusions (Strict Privacy & Security Boundaries)', () => {
    it('strictly excludes passwords, hidden, file, and disabled/readonly inputs', () => {
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.value = 'Secret123!';
      container.appendChild(passwordInput);

      expect(isSafeEditableElement(passwordInput)).toBe(false);

      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      container.appendChild(hiddenInput);
      expect(isSafeEditableElement(hiddenInput)).toBe(false);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      container.appendChild(fileInput);
      expect(isSafeEditableElement(fileInput)).toBe(false);

      const disabledInput = document.createElement('input');
      disabledInput.type = 'text';
      disabledInput.disabled = true;
      container.appendChild(disabledInput);
      expect(isSafeEditableElement(disabledInput)).toBe(false);

      const readonlyTextarea = document.createElement('textarea');
      readonlyTextarea.readOnly = true;
      container.appendChild(readonlyTextarea);
      expect(isSafeEditableElement(readonlyTextarea)).toBe(false);
    });

    it('strictly excludes sensitive authentication and payment fields by autocomplete or name', () => {
      const ccInput = document.createElement('input');
      ccInput.type = 'text';
      ccInput.autocomplete = 'cc-number';
      container.appendChild(ccInput);
      expect(isSafeEditableElement(ccInput)).toBe(false);

      const otpInput = document.createElement('input');
      otpInput.type = 'text';
      otpInput.id = 'user-otp-code';
      container.appendChild(otpInput);
      expect(isSafeEditableElement(otpInput)).toBe(false);

      const cvvInput = document.createElement('input');
      cvvInput.type = 'text';
      cvvInput.name = 'card_cvv';
      container.appendChild(cvvInput);
      expect(isSafeEditableElement(cvvInput)).toBe(false);
    });

    it('excludes Refinzi internal UI containers and hosts', () => {
      const host = document.createElement('div');
      host.setAttribute('data-refinzi-orb-host', 'true');
      const innerInput = document.createElement('input');
      innerInput.type = 'text';
      host.appendChild(innerInput);
      container.appendChild(host);

      expect(isSafeEditableElement(host)).toBe(false);
      expect(isSafeEditableElement(innerInput)).toBe(false);
    });

    it('allows eligible editable text surfaces across standard web applications', () => {
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      expect(isSafeEditableElement(textarea)).toBe(true);

      const textInput = document.createElement('input');
      textInput.type = 'text';
      container.appendChild(textInput);
      expect(isSafeEditableElement(textInput)).toBe(true);

      const searchInput = document.createElement('input');
      searchInput.type = 'search';
      container.appendChild(searchInput);
      expect(isSafeEditableElement(searchInput)).toBe(true);

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      container.appendChild(emailInput);
      expect(isSafeEditableElement(emailInput)).toBe(true);

      const ceDiv = document.createElement('div');
      ceDiv.setAttribute('contenteditable', 'true');
      container.appendChild(ceDiv);
      expect(isSafeEditableElement(ceDiv)).toBe(true);
    });
  });

  describe('2. NativeTextSurface (React/Vue/Angular Controlled State & Selection Replacement)', () => {
    it('sets value and dispatches standard InputEvent and Event(change) for framework binding', () => {
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);

      let inputDispatched = false;
      let changeDispatched = false;
      textarea.addEventListener('input', () => { inputDispatched = true; });
      textarea.addEventListener('change', () => { changeDispatched = true; });

      const surface = new NativeTextSurface(textarea, 'Gmail');
      expect(surface.detect()).toBe(true);

      const success = surface.setValue('Drafting a clean email proposal');
      expect(success).toBe(true);
      expect(textarea.value).toBe('Drafting a clean email proposal');
      expect(inputDispatched).toBe(true);
      expect(changeDispatched).toBe(true);
    });

    it('supports partial selection replacement without clobbering unselected text', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'Hello world, please send the invoice tomorrow';
      container.appendChild(input);

      const surface = new NativeTextSurface(input, 'Outlook');

      // Select "the invoice" (from index 25 to 36)
      input.setSelectionRange(25, 36);
      const selection = surface.getSelection();
      expect(selection).not.toBeNull();
      expect(selection?.text).toBe('the invoice');

      // Replace only the selection
      surface.replaceSelection('the comprehensive Q3 statement');
      expect(input.value).toBe('Hello world, please send the comprehensive Q3 statement tomorrow');

      // Verify undo restores the exact previous text
      expect(surface.supportsUndo()).toBe(true);
      surface.undo();
      expect(input.value).toBe('Hello world, please send the invoice tomorrow');
    });
  });

  describe('3. ContentEditableSurface (Rich Web Apps, Notion, Slack, Jira)', () => {
    it('extracts and replaces content in rich contenteditable containers with undo', () => {
      const ce = document.createElement('div');
      ce.setAttribute('contenteditable', 'true');
      ce.innerHTML = '<p>Initial brainstorm notes</p>';
      container.appendChild(ce);

      const surface = new ContentEditableSurface(ce, 'Notion');
      expect(surface.detect()).toBe(true);
      expect(surface.getValue()).toContain('Initial brainstorm notes');

      surface.setValue('Refined structured executive summary');
      expect(surface.getValue()).toContain('Refined structured executive summary');

      // Undo restores previous state
      surface.undo();
      expect(surface.getValue()).toContain('Initial brainstorm notes');
    });
  });

  describe('4. SurfaceFactory (Polymorphic Surface Resolution)', () => {
    it('instantiates appropriate surfaces based on element type', () => {
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      const s1 = SurfaceFactory.createSurface(textarea);
      expect(s1).toBeInstanceOf(NativeTextSurface);
      expect(s1?.surfaceType).toBe('native');

      const ce = document.createElement('div');
      ce.setAttribute('contenteditable', 'true');
      container.appendChild(ce);
      const s2 = SurfaceFactory.createSurface(ce);
      expect(s2).toBeInstanceOf(ContentEditableSurface);
      expect(s2?.surfaceType).toBe('contenteditable');

      const proseMirror = document.createElement('div');
      proseMirror.className = 'ProseMirror';
      proseMirror.setAttribute('contenteditable', 'true');
      container.appendChild(proseMirror);
      const s3 = SurfaceFactory.createSurface(proseMirror);
      expect(s3).toBeInstanceOf(RichTextSurface);
      expect(s3?.surfaceType).toBe('rich');

      const pwd = document.createElement('input');
      pwd.type = 'password';
      container.appendChild(pwd);
      const s4 = SurfaceFactory.createSurface(pwd);
      expect(s4).toBeNull();
    });
  });

  describe('5. UniversalTextEngine (Single Active-Surface & Focus Lifecycle)', () => {
    it('manages single active surface when user shifts focus across multiple textboxes', async () => {
      const box1 = document.createElement('input');
      box1.type = 'text';
      box1.id = 'box-1';
      box1.value = 'Field one';
      container.appendChild(box1);

      const box2 = document.createElement('textarea');
      box2.id = 'box-2';
      box2.value = 'Field two';
      container.appendChild(box2);

      let activatedSurfaces: string[] = [];
      let deactivatedSurfaces: string[] = [];

      const engine = new UniversalTextEngine({
        onSurfaceActivated: (s) => activatedSurfaces.push(s.element.id),
        onSurfaceDeactivated: (s) => deactivatedSurfaces.push(s.element.id),
        onPositionUpdate: () => {},
      });

      engine.start();

      // Focus box1
      box1.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      expect(activatedSurfaces).toEqual(['box-1']);
      expect(engine.getActiveSurface()?.element).toBe(box1);

      // Focus moves directly to box2
      box2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      expect(activatedSurfaces).toEqual(['box-1', 'box-2']);
      expect(deactivatedSurfaces).toEqual(['box-1']);
      expect(engine.getActiveSurface()?.element).toBe(box2);

      engine.destroy();
    });
  });

  describe('6. Destination Context Awareness', () => {
    it('correctly maps known platforms and derives clean names for custom applications', () => {
      expect(getDestinationName('mail.google.com')).toBe('Gmail');
      expect(getDestinationName('linkedin.com')).toBe('LinkedIn');
      expect(getDestinationName('notion.so')).toBe('Notion');
      expect(getDestinationName('app.slack.com')).toBe('Slack');
      expect(getDestinationName('company.zendesk.com')).toBe('Zendesk');
      expect(getDestinationName('portal.internalcrm.com')).toBe('Internalcrm');
      expect(getDestinationName('localhost')).toBe('Local Test');
    });
  });

  describe('7. Generic Website In-Place Replacement (No AI-Site Adapter Required)', () => {
    const createPointerEvent = (type: string, init: any = {}) => {
      try {
        return new PointerEvent(type, init);
      } catch {
        const event = new MouseEvent(type, init) as any;
        event.pointerId = 1;
        event.button = init.button ?? 0;
        event.clientX = init.clientX ?? 0;
        event.clientY = init.clientY ?? 0;
        return event;
      }
    };

    it('works on an ordinary webpage with <textarea>: Click = Better in-place replacement', async () => {
      const textarea = document.createElement('textarea');
      textarea.id = 'generic-email-body';
      textarea.value = 'write a professional email asking for payment';
      textarea.getBoundingClientRect = () => ({
        top: 50,
        left: 50,
        right: 450,
        bottom: 150,
        width: 400,
        height: 100,
        x: 50,
        y: 50,
        toJSON: () => {},
      });
      container.appendChild(textarea);

      // Mock backend Better generator
      vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockImplementation(async (msg: any) => {
        if (msg.type === 'REFINZI_GENERATE_BETTER') {
          return {
            success: true,
            data: {
              mode: 'better',
              prompt: 'Draft a polite but firm payment reminder email referencing invoice #1042, due net-30 terms, with attached remittance details.',
              domain: 'business',
              shortReason: 'Calibrated professional billing tone',
            },
          };
        }
        return { success: false };
      });

      const controller = new RefinziController();
      await controller.init();

      // Focus the generic textarea
      textarea.focus();
      textarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      // Orb should dock
      const host = document.querySelector('[data-refinzi-orb-host="true"]');
      expect(host).not.toBeNull();
      const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;
      expect(orbEl).not.toBeNull();

      // Trigger Click (Better)
      orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
      orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

      await new Promise((r) => setTimeout(r, 60));

      // Verifies automatic in-place replacement without any AI website or Apply modal!
      expect(textarea.value).toContain('Draft a polite but firm payment reminder email');
      expect(textarea.value).toContain('invoice #1042');

      // Verifies floating undo toast
      const toast = host?.shadowRoot?.querySelector('.undo-toast');
      expect(toast).not.toBeNull();
      expect(toast?.textContent).toContain('Calibrated');

      controller.destroy();
    });

    it('works on an ordinary webpage with <input>: Hold = Expert in-place replacement', async () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'generic-strategy-input';
      input.value = 'GTM to enter in US market';
      input.getBoundingClientRect = () => ({
        top: 80,
        left: 80,
        right: 480,
        bottom: 120,
        width: 400,
        height: 40,
        x: 80,
        y: 80,
        toJSON: () => {},
      });
      container.appendChild(input);

      // Mock backend Expert generator
      vi.spyOn(BrowserAPI.runtime, 'sendMessage').mockImplementation(async (msg: any) => {
        if (msg.type === 'REFINZI_GENERATE_EXPERT') {
          return {
            success: true,
            data: {
              mode: 'expert',
              prompt: '# ROLE & PERSPECTIVE\nSenior B2B Go-To-Market Strategist\n\n# CORE OBJECTIVE\nComprehensive US market expansion roadmap covering ICP definition, regulatory compliance, channel economics, and 90-day execution milestones.',
              domain: 'business',
              assumptions: ['B2B Technology Service', 'Direct Sales Model'],
            },
          };
        }
        return { success: false };
      });

      const controller = new RefinziController();
      await controller.init();

      // Focus input
      input.focus();
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const host = document.querySelector('[data-refinzi-orb-host="true"]');
      const orbEl = host?.shadowRoot?.querySelector('.refinzi-orb') as HTMLElement;

      // Trigger Hold (Expert: press down, wait >= 350ms, then release)
      orbEl.dispatchEvent(createPointerEvent('pointerdown', { button: 0, bubbles: true }));
      await new Promise((r) => setTimeout(r, 380));
      orbEl.dispatchEvent(createPointerEvent('pointerup', { button: 0, bubbles: true }));

      await new Promise((r) => setTimeout(r, 60));

      // Verifies automatic in-place replacement with Expert prompt!
      expect(input.value).toContain('Senior B2B Go-To-Market Strategist');
      expect(input.value).toContain('Comprehensive US market expansion roadmap');

      // Click Undo
      const undoBtn = host?.shadowRoot?.querySelector('#rfz-undo-btn') as HTMLButtonElement;
      expect(undoBtn).not.toBeNull();
      undoBtn.click();

      // Verifies original text restored
      expect(input.value).toBe('GTM to enter in US market');

      controller.destroy();
    });
  });
});
