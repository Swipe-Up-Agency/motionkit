import * as tokens from './core/tokens.js';
import * as reducedMotion from './core/reduced-motion.js';
import * as breakpoints from './core/breakpoints.js';
import * as config from './core/config.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens, reducedMotion, breakpoints, config };
})();
