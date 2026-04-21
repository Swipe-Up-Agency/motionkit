export function isReducedMotion(mode = 'auto') {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
