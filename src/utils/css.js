/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Reading design tokens from code
═══════════════════════════════════════════════════════════════════ */

// A canvas needs a real colour, not "var(--cyan)". This turns a token, or a
// value that is just var(--token), into the colour the theme gives it now.
export function cssColor(value, el = document.documentElement) {
  const name = value.match(/^var\((--[\w-]+)\)$/)?.[1] || (value.startsWith('--') ? value : null);
  return name ? getComputedStyle(el).getPropertyValue(name).trim() : value;
}
