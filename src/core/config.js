const BASE_DEFAULTS = {
  defaults: { duration: 700, easing: 'power2.out' },
  effects: {},
  selectors: {},
  breakpoints: { mobile: 768 },
  reducedMotion: 'auto',
  debug: false,
};

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== 'object') return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overlay)) {
    if (BLOCKED_KEYS.has(key)) continue;
    const a = base?.[key];
    const b = overlay[key];
    if (b === undefined) continue;
    if (b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = deepMerge(a && typeof a === 'object' ? a : {}, b);
    } else {
      out[key] = b;
    }
  }
  return out;
}

export function loadConfig() {
  try {
    const raw = (typeof window !== 'undefined' && window.MotionKit) || {};
    const user = {
      defaults: raw.defaults,
      effects: raw.effects,
      selectors: raw.selectors,
      breakpoints: raw.breakpoints,
      reducedMotion: raw.reducedMotion,
      debug: raw.debug,
    };
    return deepMerge(BASE_DEFAULTS, user);
  } catch (err) {
    console.warn('[MotionKit] config load failed, using defaults:', err);
    return deepMerge(BASE_DEFAULTS, {});
  }
}

export function getEffectOptions(effectName, config, element = null) {
  const layers = [config.defaults, config.effects?.[effectName] ?? {}];
  if (element && config.selectors) {
    for (const [sel, opts] of Object.entries(config.selectors)) {
      if (opts.effect === effectName && element.matches(sel)) {
        const { effect: _discard, ...rest } = opts;
        layers.push(rest);
      }
    }
  }
  return layers.reduce((acc, layer) => deepMerge(acc, layer), {});
}
