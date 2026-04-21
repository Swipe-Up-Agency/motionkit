export function isMobile(breakpoint = 768) {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
}

export function resolveMobileBehavior({ mobileDefault, isMobile, override }) {
  if (override === 'off') return false;
  if (override === 'on') return true;
  if (!isMobile) return true;
  return mobileDefault === 'run';
}

export function readMobileOverride(element) {
  if (element.classList.contains('mk-mobile-off')) return 'off';
  if (element.classList.contains('mk-mobile-on')) return 'on';
  return null;
}
