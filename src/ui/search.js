/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Search pop-up (Ctrl/⌘ K, /) and its ↑↓ ↵ keys (D14)
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

import { state } from '../app/state.js';

export function initSearch() {
  const searchInput = document.getElementById('global-search');
  const backdrop = document.getElementById('search-backdrop');
  const modal = document.querySelector('.search-modal-content');
  const modalSearchInput = document.getElementById('modal-search-input');

  if (backdrop && modal) {
    // Style search backdrop dynamically
    Object.assign(backdrop.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(5, 5, 10, 0.75)',
      backdropFilter: 'blur(12px)',
      webkitBackdropFilter: 'blur(12px)',
      zIndex: '9999',
      opacity: '0',
      display: 'none',
      transition: 'opacity 0.2s ease-out'
    });

    // Style modal content dynamically
    Object.assign(modal.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -46%) scale(0.96)',
      width: '90%',
      maxWidth: '640px',
      maxHeight: '75%',
      zIndex: '10000',
      opacity: '0',
      display: 'none',
      flexDirection: 'column',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(10, 10, 18, 0.9)',
      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
      transition: 'opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      padding: '20px',
      overflow: 'hidden'
    });

    // Show modal when global search header input is focused/clicked
    if (searchInput) {
      searchInput.addEventListener('focus', (e) => {
        e.preventDefault();
        searchInput.blur();
        showSearchModal();
      });
    }

    backdrop.addEventListener('click', hideSearchModal);
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

export function showSearchModal() {
  const backdrop = document.getElementById('search-backdrop');
  const modal = document.querySelector('.search-modal-content');
  if (backdrop && modal) {
    backdrop.style.display = 'block';
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
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
    backdrop.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -46%) scale(0.96)';
    setTimeout(() => {
      backdrop.style.display = 'none';
      modal.style.display = 'none';
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

  const filtered = CircuitLabData.components.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.tags.some(t => t.includes(query)) ||
    c.manufacturer.toLowerCase().includes(query)
  ).slice(0, 6);

  if (filtered.length === 0) {
    resultsContainer.innerHTML = '<div class="search-no-results">No components match your query</div>';
  } else {
    resultsContainer.innerHTML = filtered.map(c => `
      <div class="search-result-item" onclick="CircuitApp.selectComponent('${c.id}')">
        <span class="search-result-icon">${c.icon}</span>
        <div class="search-result-info">
          <div class="search-result-name">${c.name}</div>
          <div class="search-result-meta">${c.manufacturer} · ${c.package}</div>
        </div>
        <span class="search-result-type type-${c.category}">${c.category}</span>
      </div>
    `).join('');
  }
  highlightSearchResult();
}
