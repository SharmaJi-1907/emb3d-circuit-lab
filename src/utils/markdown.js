/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Markdown → HTML for AI replies (D6, D7, D18)
═══════════════════════════════════════════════════════════════════ */

import { escapeHtml } from './html.js';

// Turn the stored answers' markdown into HTML. The text is escaped first, so
// anything a user typed shows as text and never runs (D6). Code blocks are set
// aside before the other rules and put back last, so their contents keep their
// exact characters (D7); lists and tables are set aside the same way (D18).
export function formatMarkdown(text) {
  const code = [];
  const blocks = [];

  const inline = (s) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  const isRow = (l = '') => /^\|.*\|$/.test(l.trim());
  const isSeparator = (l = '') => /^\|[\s:|-]+\|$/.test(l.trim());
  const isItem = (l = '') => /^[-•]\s+\S/.test(l.trim());
  const cellsOf = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => inline(c.trim()));
  const hold = (html) => `<blk-${blocks.push(html) - 1}>`;

  const lines = escapeHtml(text)
    .replace(/```[^\n]*\n([\s\S]*?)\n?```/g, (m, body) => `<pre-${code.push(body) - 1}>`)
    .split('\n');

  const out = [];
  for (let i = 0; i < lines.length;) {
    // A table is a row, a |---|---| separator, then its rows
    if (isRow(lines[i]) && isSeparator(lines[i + 1])) {
      const head = cellsOf(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && isRow(lines[i])) rows.push(cellsOf(lines[i++]));
      out.push(hold(
        `<table class="ai-table"><thead><tr>${head.map(c => `<th>${c}</th>`).join('')}</tr></thead>`
        + `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      ));
      continue;
    }
    // A list is a run of "- " or "• " lines, and stops at the first line that isn't one
    if (isItem(lines[i])) {
      const items = [];
      while (i < lines.length && isItem(lines[i])) {
        items.push(`<li>${inline(lines[i++].trim().replace(/^[-•]\s+/, ''))}</li>`);
      }
      out.push(hold(`<ul>${items.join('')}</ul>`));
      continue;
    }
    out.push(inline(lines[i++]));
  }

  return out.join('\n')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // A list or table is its own block, so drop the line breaks touching it
    .replace(/(?:<br>|<\/p><p>)*(<blk-\d+>)(?:<br>|<\/p><p>)*/g, '$1')
    .replace(/<blk-(\d+)>/g, (m, i) => blocks[i])
    .replace(/<pre-(\d+)>/g, (m, i) => `<pre class="ai-code"><code>${code[i]}</code></pre>`);
}
