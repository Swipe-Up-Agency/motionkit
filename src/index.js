import * as tokens from './core/tokens.js';

(function boot() {
  if (typeof window === 'undefined') return;
  window.MotionKit = window.MotionKit || {};
  window.MotionKit.version = '0.1.0';
  window.MotionKit._internals = { tokens };
})();
