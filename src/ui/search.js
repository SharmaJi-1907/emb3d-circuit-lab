/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Search pop-up (Ctrl/⌘ K, /) and its ↑↓ ↵ keys (D14)
   It finds components, boards and datasheets (D46).
═══════════════════════════════════════════════════════════════════ */

import { state } from '../app/state.js';
import { escapeHtml } from '../utils/html.js';

export function initSearch() {
  const searchInput = document.getElementById('global-search');
  const backdrop = document.getElementById('search-backdrop');
  const modal = document.querySelector('.search-modal-content');
  const modalSearchInput = document.getElementById('modal-search-input');

  if (backdrop && modal) {
    // Show modal when global search header input is focused/clicked
    if (searchInput) {
      searchInput.addEventListener('focus', (e) => {
        e.preventDefault();
        searchInput.blur();
        showSearchModal();
      });
    }

    backdrop.addEventListener('click', hideSearchModal);

    // A result opens its component, board or datasheet (see openSearchResult)
    document.getElementById('modal-search-results')?.addEventListener('click', (e) => {
      const hit = e.target.closest('.search-result-item');
      if (hit) openSearchResult(hit.dataset.kind, hit.dataset.id);
    });
  }

  if (modalSearchInput) {
    modalSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      renderModalSearchResults(query);
    });

    // ↑ ↓ move through the results and ↵ opens one, as the footer promises (D14).
    modalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideSearchModal();
        return;
      }
      const hits = document.querySelectorAll('#modal-search-results .search-result-item');
      if (!hits.length) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        // Wrap around, so ↑ from the top goes to the bottom.
        state.searchIndex = (state.searchIndex + step + hits.length) % hits.length;
        highlightSearchResult();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        hits[state.searchIndex]?.click();
      }
    });
  }
}

// The close animation hides the pop-up 200 ms after it fades. Opening it
// again within those 200 ms must cancel that, or it vanishes while in use (D37).
let hideTimer = null;

export function showSearchModal() {
  const backdrop = document.getElementById('search-backdrop');
  const modal = document.querySelector('.search-modal-content');
  if (backdrop && modal) {
    clearTimeout(hideTimer);
    backdrop.classList.add('shown');
    modal.classList.add('shown');
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      modal.classList.add('open');
    });
    const input = document.getElementById('modal-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    renderModalSearchResults('');
  }
}

export function hideSearchModal() {
  const backdrop = document.getElementById('search-backdrop');
  const modal = document.querySelector('.search-modal-content');
  if (backdrop && modal) {
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      backdrop.classList.remove('shown');
      modal.classList.remove('shown');
    }, 200);
  }
}

// Mark the result the arrow keys are on, and keep it in view (D14).
function highlightSearchResult() {
  const hits = document.querySelectorAll('#modal-search-results .search-result-item');
  hits.forEach((el, i) => el.classList.toggle('selected', i === state.searchIndex));
  hits[state.searchIndex]?.scrollIntoView({ block: 'nearest' });
}

function renderModalSearchResults(query) {
  const resultsContainer = document.getElementById('modal-search-results');
  if (!resultsContainer) return;
  state.searchIndex = 0; // a new search starts at the top (D14)

  if (!query) {
    resultsContainer.innerHTML = '<div class="search-no-results">Type to search components, boards, and datasheets...</div>';
    return;
  }

  const has = (...fields) => fields.some(f => String(f || '').toLowerCase().includes(query));
  const results = [
    ...CircuitLabData.components
      .filter(c => has(c.name, c.id, c.manufacturer) || c.tags.some(t => t.includes(query)))
      .map(c => ({ kind: 'component', id: c.id, icon: c.icon, name: c.name, meta: `${c.manufacturer} · ${c.package}`, type: c.category })),
    ...Object.entries(CircuitLabData.boards)
      .filter(([id, b]) => has(b.name, id, b.mcu))
      .map(([id, b]) => ({ kind: 'board', id, icon: '📟', name: b.name, meta: b.mcu, type: 'board' })),
    ...CircuitLabData.datasheets
      .filter(d => has(d.name, d.componentId, d.manufacturer))
      .map(d => ({ kind: 'datasheet', id: d.componentId, icon: '📄', name: d.name, meta: `${d.manufacturer} · datasheet`, type: 'datasheet' })),
  ].slice(0, 8);

  if (results.length === 0) {
    resultsContainer.innerHTML = `<div class="search-no-results">Nothing matches "${escapeHtml(query)}"</div>`;
  } else {
    resultsContainer.innerHTML = results.map(r => `
      <div class="search-result-item" data-kind="${r.kind}" data-id="${r.id}">
        <span class="search-result-icon">${r.icon}</span>
        <div class="search-result-info">
          <div class="search-result-name">${r.name}</div>
          <div class="search-result-meta">${r.meta}</div>
        </div>
        <span class="search-result-type type-${r.type}">${r.type}</span>
      </div>
    `).join('');
  }
  highlightSearchResult();
}

function openSearchResult(kind, id) {
  hideSearchModal();
  if (kind === 'component') window.CircuitApp.selectComponent(id);
  if (kind === 'board') window.CircuitApp.openBoard(id);
  if (kind === 'datasheet') window.CircuitApp.openDatasheet(id);
}
