/**
 * REFINZI — Content Script Entry Point
 * "Better prompts in one click. Expert prompts when it matters."
 */

import { RefinziController } from './ui/controller';

const controller = new RefinziController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
  });
} else {
  controller.init();
}
