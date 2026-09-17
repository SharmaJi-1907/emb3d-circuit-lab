/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — HTML escaping
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
