/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Toast messages
═══════════════════════════════════════════════════════════════════ */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = icons[type] || 'ℹ';
  // A message can hold text the user typed (a project name), so it is set
  // as text, never as HTML (D31).
  const msg = document.createElement('span');
  msg.className = 'toast-msg';
  msg.textContent = message;
  toast.append(icon, msg);

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
