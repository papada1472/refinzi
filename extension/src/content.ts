/**
 * REFINZI — Content Script Entry Point
 * "Better prompts in one click. Expert prompts when it matters."
 */

import { RefinziController } from './ui/controller';

// Double-injection guard. The background worker re-injects this script into
// already-open tabs on install/update (so users never have to refresh). Without
// this flag, a tab that also navigates would end up with two controllers, two
// orb hosts, and duplicated listeners. Manifest-declared and programmatically
// injected content scripts share the same isolated world, so one flag covers both.
declare global {
  interface Window {
    __REFINZI_LOADED__?: boolean;
  }
}

if (!window.__REFINZI_LOADED__) {
  window.__REFINZI_LOADED__ = true;

  const controller = new RefinziController();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      controller.init();
    });
  } else {
    controller.init();
  }
}
