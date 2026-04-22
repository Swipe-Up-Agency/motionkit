import { loadConfig, getEffectOptions } from './config.js';
import { isReducedMotion } from './reduced-motion.js';
import { isMobile, resolveMobileBehavior, readMobileOverride } from './breakpoints.js';

const registry = new Map();
const initialized = new WeakSet();
const active = [];

export function registerEffect(descriptor) {
  if (!descriptor?.name) throw new Error('Effect must have a name');
  if (!Array.isArray(descriptor.classSelectors) || descriptor.classSelectors.length === 0) {
    throw new Error(`Effect "${descriptor.name}" must declare at least one classSelector`);
  }
  registry.set(descriptor.name, { mobileDefault: 'run', ...descriptor });
}

export function getRegistry() { return registry; }
export function getActiveEffects() { return active.slice(); }

export function scan(root = document, cfg = null) {
  const matches = [];
  const seen = new WeakSet();

  // Pass 1: class-based matches
  for (const descriptor of registry.values()) {
    for (const cls of descriptor.classSelectors) {
      const nodes = root.querySelectorAll(`.${cls}`);
      for (const el of nodes) {
        if (initialized.has(el) || seen.has(el)) continue;
        matches.push({ element: el, descriptor, triggerClass: cls });
        seen.add(el);
      }
    }
  }

  // Pass 2: config.selectors-based matches — attaches effects to elements
  // you can't class directly (e.g. Squarespace-generated markup).
  const config = cfg ?? loadConfig();
  if (config.selectors) {
    for (const [sel, opts] of Object.entries(config.selectors)) {
      const effectName = opts?.effect;
      if (!effectName) continue;
      const descriptor = registry.get(effectName);
      if (!descriptor) continue;
      let nodes;
      try { nodes = root.querySelectorAll(sel); }
      catch (_) { continue; } // invalid selector — skip silently
      for (const el of nodes) {
        if (initialized.has(el) || seen.has(el)) continue;
        matches.push({ element: el, descriptor, triggerSelector: sel });
        seen.add(el);
      }
    }
  }

  return matches;
}

export function run() {
  const cfg = loadConfig();
  if (isReducedMotion(cfg.reducedMotion)) {
    if (cfg.debug) console.log('[MotionKit] reduced-motion active; skipping animations.');
    for (const { element } of scan(document, cfg)) {
      element.classList.add('mk-ready');
      initialized.add(element);
    }
    return;
  }

  const mobile = isMobile(cfg.breakpoints.mobile);

  for (const { element, descriptor } of scan(document, cfg)) {
    const override = readMobileOverride(element);
    const shouldRun = resolveMobileBehavior({ mobileDefault: descriptor.mobileDefault, isMobile: mobile, override });
    if (!shouldRun) {
      if (typeof descriptor.mobileFallback === 'function') {
        try { descriptor.mobileFallback(element); }
        catch (e) { console.error(`[MotionKit] ${descriptor.name}: mobileFallback failed`, e); }
      }
      element.classList.add('mk-ready');
      initialized.add(element);
      if (cfg.debug) console.log(`[MotionKit] ${descriptor.name}: skipped (mobile guard)`, element);
      continue;
    }

    const options = getEffectOptions(descriptor.name, cfg, element);
    try {
      descriptor.init(element, options, cfg);
      element.classList.add('mk-ready');
      initialized.add(element);
      active.push({ element, effect: descriptor.name });
      if (cfg.debug) console.log(`[MotionKit] ${descriptor.name}: initialized`, element);
    } catch (err) {
      element.classList.add('mk-ready');
      initialized.add(element); // prevent retry storm on deterministic failures
      console.error(`[MotionKit] ${descriptor.name}: init failed`, err, element);
    }
  }
}

export function refresh() {
  // Prune entries for elements no longer connected to the DOM.
  for (let i = active.length - 1; i >= 0; i--) {
    if (!active[i].element.isConnected) active.splice(i, 1);
  }
  run();
}
