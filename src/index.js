import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';
import * as boot from './core/boot.js';
import * as fade from './effects/fade.js';
import * as marquee from './effects/marquee.js';
import * as hover from './effects/hover.js';
import * as parallax from './effects/parallax.js';
import * as kenBurns from './effects/ken-burns.js';
import * as pin from './effects/pin.js';
import * as stagger from './effects/stagger.js';

// eslint-disable-next-line no-undef
const ANTI_FOUC_CSS = typeof __ANTI_FOUC_CSS__ !== 'undefined' ? __ANTI_FOUC_CSS__ : '';

function injectAntiFouc() {
  if (!ANTI_FOUC_CSS || document.getElementById('mk-anti-fouc')) return;
  const style = document.createElement('style');
  style.id = 'mk-anti-fouc';
  style.textContent = ANTI_FOUC_CSS;
  document.head.appendChild(style);
}

function registerAll() {
  boot.registerEffect(stagger); // MUST be before fade — tags children to skip fade
  boot.registerEffect(fade);
  boot.registerEffect(marquee);
  boot.registerEffect(hover);
  boot.registerEffect(parallax);
  boot.registerEffect(kenBurns);
  boot.registerEffect(pin);
}

(function init() {
  if (typeof window === 'undefined') return;
  if (window.MotionKit?.version && window.MotionKit.__booted__) return; // bundle already loaded
  const existing = window.MotionKit || {};
  window.MotionKit = Object.assign(existing, {
    version: '0.1.0',
    __booted__: true,
    refresh: boot.refresh,
    getRegistry: boot.getRegistry,
    getActiveEffects: boot.getActiveEffects,
    _internals: { tokens, reducedMotion, breakpoints, config, boot },
  });
  injectAntiFouc();
  registerAll();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot.run, { once: true });
  } else {
    boot.run();
  }
})();
