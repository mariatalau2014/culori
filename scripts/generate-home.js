#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'index.html');

function isHtmlFile(fileName, fullPath) {
  const ext = path.extname(fileName);
  const lowerExt = ext.toLowerCase();
  if (fileName === 'index.html') {
    return false;
  }
  if (lowerExt === '.html') {
    return true;
  }
  if (!ext) {
    try {
      const snippet = fs.readFileSync(fullPath, 'utf8').slice(0, 200).toLowerCase();
      return snippet.includes('<!doctype html') || snippet.includes('<html');
    } catch (error) {
      return false;
    }
  }
  return false;
}

function extractTitle(content, fallback) {
  const match = content.match(/<title>([^<]*)<\/title>/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fallback;
}

const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
const pages = [];
for (const entry of entries) {
  if (!entry.isFile()) continue;
  const filePath = path.join(repoRoot, entry.name);
  if (!isHtmlFile(entry.name, filePath)) continue;
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    continue;
  }
  if (!/<html/i.test(content)) {
    continue;
  }
  const title = extractTitle(content, entry.name);
  pages.push({
    file: entry.name,
    title,
  });
}

pages.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

const pagesJson = JSON.stringify(pages);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Culori Playground</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      color-scheme: light dark;
      --bg: linear-gradient(135deg, #050505, #1b1f3a);
      --card-bg: rgba(255, 255, 255, 0.08);
      --card-border: rgba(255, 255, 255, 0.12);
      --card-hover: rgba(255, 255, 255, 0.16);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --accent: #7dd3fc;
      --accent-strong: #38bdf8;
      --danger: #f87171;
      --success: #34d399;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 2.5rem clamp(1.5rem, 4vw, 4rem) 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .top-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
    }
    .title-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1rem;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    button, .button {
      border: none;
      border-radius: 999px;
      padding: 0.65rem 1.4rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      color: #0b1120;
      background: var(--accent);
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }
    button:hover, .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 30px rgba(125, 211, 252, 0.25);
      background: var(--accent-strong);
    }
    button.secondary {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text-primary);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: none;
    }
    button.secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
    }
    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      align-items: center;
    }
    .search-box {
      position: relative;
    }
    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(15, 23, 42, 0.6);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: border 0.2s ease, background 0.2s ease;
    }
    .search-box input:focus {
      outline: none;
      border-color: var(--accent);
      background: rgba(15, 23, 42, 0.8);
    }
    .search-box svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      stroke: var(--text-secondary);
    }
    main {
      padding: 0  clamp(1.5rem, 4vw, 4rem) 4rem;
      flex: 1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: clamp(1rem, 3vw, 2.5rem);
    }
    .card {
      backdrop-filter: blur(16px);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
      transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease;
    }
    .card:hover {
      transform: translateY(-6px);
      border-color: var(--accent-strong);
      background: var(--card-hover);
    }
    .card h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .card .file-name {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .card-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .card-actions a {
      border-radius: 999px;
      padding: 0.6rem 1.2rem;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      color: #0b1120;
      background: rgba(125, 211, 252, 0.8);
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .card-actions a:hover {
      transform: translateY(-1px);
      background: var(--accent-strong);
    }
    .card button {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }
    .favorite {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid transparent;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease;
    }
    .favorite:hover {
      transform: scale(1.05);
      border-color: rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.14);
    }
    .favorite.active {
      background: rgba(250, 204, 21, 0.16);
      border-color: rgba(250, 204, 21, 0.6);
    }
    .empty-state {
      text-align: center;
      color: var(--text-secondary);
      padding: 3rem 1rem;
      font-size: 1.1rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(125, 211, 252, 0.16);
      border: 1px solid rgba(125, 211, 252, 0.35);
      border-radius: 999px;
      padding: 0.45rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .toggle-group {
      display: inline-flex;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      overflow: hidden;
    }
    .toggle-group button {
      border-radius: 0;
      background: transparent;
      color: var(--text-secondary);
      padding: 0.6rem 1.1rem;
      box-shadow: none;
    }
    .toggle-group button.active {
      color: var(--text-primary);
      background: rgba(125, 211, 252, 0.2);
      border-bottom: 2px solid var(--accent);
    }
    .toggle-group button:hover {
      background: rgba(125, 211, 252, 0.14);
      transform: none;
      box-shadow: none;
    }
    .status-pill {
      border-radius: 999px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      background: rgba(52, 211, 153, 0.16);
      border: 1px solid rgba(52, 211, 153, 0.35);
      color: var(--success);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .status-pill.neutral {
      background: rgba(148, 163, 184, 0.16);
      border-color: rgba(148, 163, 184, 0.35);
      color: #cbd5f5;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 6, 13, 0.8);
      backdrop-filter: blur(14px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      z-index: 50;
    }
    .modal-backdrop.active {
      display: flex;
    }
    .modal {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 1.5rem;
      padding: clamp(1.5rem, 3vw, 2.5rem);
      max-width: 720px;
      width: min(100%, 720px);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: var(--text-primary);
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45);
    }
    .modal h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .modal label {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .modal input,
    .modal textarea {
      width: 100%;
      border-radius: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(15, 23, 42, 0.7);
      color: var(--text-primary);
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      resize: vertical;
      transition: border 0.2s ease, background 0.2s ease;
    }
    .modal textarea {
      min-height: 200px;
      font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, 'Roboto Mono', monospace;
      line-height: 1.45;
      white-space: pre;
    }
    .modal input[readonly] {
      background: rgba(15, 23, 42, 0.5);
      color: var(--text-secondary);
    }
    .modal input:focus,
    .modal textarea:focus {
      outline: none;
      border-color: var(--accent);
      background: rgba(15, 23, 42, 0.85);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .modal-actions button {
      min-width: 120px;
    }
    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      color: var(--text-primary);
      font-size: 1.25rem;
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .modal-close:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .modal-status {
      min-height: 1.25rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .pat-status {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: var(--text-secondary);
    }
    .pat-status strong {
      color: var(--text-primary);
    }
    @media (max-width: 768px) {
      header {
        padding-top: 2rem;
        padding-bottom: 1rem;
      }
      .card {
        padding: 1.25rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="top-row">
      <div class="title-group">
        <h1>Culori Playground</h1>
        <p class="subtitle">Curated experiments, utilities, and sketches deployed on Vercel.</p>
      </div>
      <div class="actions">
        <button id="newPageBtn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Page
        </button>
        <button id="managePatBtn" type="button" class="secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.06A1.65 1.65 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.06a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.06a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          Manage Token
        </button>
      </div>
    </div>
    <div class="filters">
      <div class="search-box">
        <input id="searchInput" type="search" placeholder="Search by title or filename" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </div>
      <div class="toggle-group" role="group">
        <button type="button" id="showAllBtn" class="active">All Pages</button>
        <button type="button" id="showFavBtn">Favorites</button>
      </div>
      <div class="pat-status" id="patStatus" aria-live="polite"></div>
    </div>
  </header>
  <main>
    <div id="cardGrid" class="grid" aria-live="polite"></div>
    <p id="emptyState" class="empty-state" hidden>No pages match your filters just yet. Try a different search or add a new page.</p>
  </main>

  <script id="page-data" type="application/json">${pagesJson}</script>
  <div class="modal-backdrop" id="modalBackdrop" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="modal" role="document">
      <button class="modal-close" id="modalCloseBtn" aria-label="Close">&times;</button>
      <h2 id="modalTitle">Create New Page</h2>
      <div class="field-group" id="fileNameGroup">
        <label for="fileNameInput">File Name</label>
        <input id="fileNameInput" type="text" placeholder="example.html" autocomplete="off" />
      </div>
      <div class="field-group">
        <label for="htmlContentInput">HTML Content</label>
        <textarea id="htmlContentInput" placeholder="Paste your HTML code here..."></textarea>
      </div>
      <p class="modal-status" id="modalStatus"></p>
      <div class="modal-actions">
        <button type="button" class="secondary" id="modalCancelBtn">Cancel</button>
        <button type="button" id="modalSaveBtn">Save to GitHub</button>
      </div>
    </div>
  </div>

  <script>
    const repoOwner = 'mariatalau2014';
    const repoName = 'culori';
    const branch = 'main';
    const favoritesKey = 'culoriFavorites';
    const patKey = 'culoriGithubPat';

    const pageData = JSON.parse(document.getElementById('page-data').textContent);
    const searchInput = document.getElementById('searchInput');
    const cardGrid = document.getElementById('cardGrid');
    const emptyState = document.getElementById('emptyState');
    const showAllBtn = document.getElementById('showAllBtn');
    const showFavBtn = document.getElementById('showFavBtn');
    const newPageBtn = document.getElementById('newPageBtn');
    const managePatBtn = document.getElementById('managePatBtn');
    const patStatus = document.getElementById('patStatus');

    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const fileNameGroup = document.getElementById('fileNameGroup');
    const fileNameInput = document.getElementById('fileNameInput');
    const htmlContentInput = document.getElementById('htmlContentInput');
    const modalStatus = document.getElementById('modalStatus');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    let favorites = new Set(JSON.parse(localStorage.getItem(favoritesKey) || '[]'));
    let filterMode = 'all';
    let activeFile = null;
    let isEditMode = false;

    function updatePatStatus() {
      const token = localStorage.getItem(patKey);
      if (token) {
        patStatus.innerHTML = '<span class="status-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>GitHub connected</span>';
      } else {
        patStatus.innerHTML = '<span class="status-pill neutral"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>Token required for saving</span>';
      }
    }

    function encodeForHref(file) {
      return encodeURI(file);
    }

    function renderCards() {
      const query = searchInput.value.trim().toLowerCase();
      const filtered = pageData.filter((page) => {
        const matchesQuery = !query || page.title.toLowerCase().includes(query) || page.file.toLowerCase().includes(query);
        const matchesFavorites = filterMode === 'all' || favorites.has(page.file);
        return matchesQuery && matchesFavorites;
      });

      cardGrid.innerHTML = '';

      if (!filtered.length) {
        emptyState.hidden = false;
        return;
      }

      emptyState.hidden = true;

      for (const page of filtered) {
        const card = document.createElement('article');
        card.className = 'card';

        const favBtn = document.createElement('button');
        favBtn.type = 'button';
        favBtn.className = 'favorite' + (favorites.has(page.file) ? ' active' : '');
        favBtn.innerHTML = favorites.has(page.file)
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27" /></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>';
        favBtn.addEventListener('click', () => toggleFavorite(page.file, favBtn));
        card.appendChild(favBtn);

        const title = document.createElement('h2');
        title.textContent = page.title;
        card.appendChild(title);

        const fileName = document.createElement('p');
        fileName.className = 'file-name';
        fileName.textContent = page.file;
        card.appendChild(fileName);

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20l9-5-9-5-9 5 9 5z"></path><path d="M12 12l9-5-9-5-9 5 9 5z"></path></svg>Mini App';
        card.appendChild(badge);

        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const openLink = document.createElement('a');
        openLink.href = encodeForHref(page.file);
        openLink.target = '_blank';
        openLink.rel = 'noopener noreferrer';
        openLink.textContent = 'Open';
        actions.appendChild(openLink);

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'secondary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openEditModal(page));
        actions.appendChild(editBtn);

        card.appendChild(actions);
        cardGrid.appendChild(card);
      }
    }

    function toggleFavorite(file, button) {
      if (favorites.has(file)) {
        favorites.delete(file);
        button.classList.remove('active');
      } else {
        favorites.add(file);
        button.classList.add('active');
      }
      localStorage.setItem(favoritesKey, JSON.stringify(Array.from(favorites)));
      renderCards();
    }

    function setFilter(mode) {
      filterMode = mode;
      showAllBtn.classList.toggle('active', mode === 'all');
      showFavBtn.classList.toggle('active', mode === 'favorites');
      renderCards();
    }

    function ensureToken(promptMessage = 'Please paste your GitHub Personal Access Token (with repo permissions):') {
      let token = localStorage.getItem(patKey);
      if (!token) {
        token = window.prompt(promptMessage || '');
        if (token) {
          token = token.trim();
          if (token) {
            localStorage.setItem(patKey, token);
            updatePatStatus();
          }
        }
      }
      return token || null;
    }

    function openModal({ title, fileName = '', readOnlyFile = false, content = '', saveHandler }) {
      modalTitle.textContent = title;
      fileNameInput.value = fileName;
      fileNameInput.readOnly = readOnlyFile;
      fileNameGroup.style.display = 'flex';
      if (readOnlyFile) {
        fileNameInput.setAttribute('aria-readonly', 'true');
      } else {
        fileNameInput.removeAttribute('aria-readonly');
      }
      htmlContentInput.value = content;
      modalStatus.textContent = '';
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      htmlContentInput.focus();

      modalSaveBtn.onclick = async () => {
        modalSaveBtn.disabled = true;
        modalStatus.textContent = 'Saving to GitHub…';
        try {
          await saveHandler();
          modalStatus.textContent = 'Saved successfully!';
          renderCards();
          setTimeout(closeModal, 1200);
        } catch (error) {
          modalStatus.textContent = error.message || 'An unexpected error occurred.';
        } finally {
          modalSaveBtn.disabled = false;
        }
      };
    }

    function closeModal() {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      modalSaveBtn.onclick = null;
      htmlContentInput.value = '';
      fileNameInput.value = '';
      fileNameInput.readOnly = false;
      fileNameInput.removeAttribute('aria-readonly');
      activeFile = null;
      isEditMode = false;
    }

    async function fetchFileSha(file, token) {
      const url = 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contents/' + encodeURIComponent(file) + '?ref=' + encodeURIComponent(branch);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found on GitHub.');
        }
        throw new Error('Unable to fetch file metadata: ' + response.statusText);
      }
      const data = await response.json();
      return data.sha;
    }

    function base64Encode(content) {
      return btoa(unescape(encodeURIComponent(content)));
    }

    async function saveFileToGithub({ file, content, token, sha = undefined }) {
      const url = 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contents/' + encodeURIComponent(file);
      const body = {
        message: (sha ? 'Update ' : 'Add ') + file,
        content: base64Encode(content),
        branch,
      };
      if (sha) {
        body.sha = sha;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error && error.message ? error.message : 'GitHub request failed';
        throw new Error(message);
      }
      return response.json();
    }

    async function openEditModal(page) {
      const token = ensureToken();
      if (!token) {
        return;
      }
      activeFile = page.file;
      isEditMode = true;
      let existingContent = '';
      try {
        const rawUrl = 'https://raw.githubusercontent.com/' + repoOwner + '/' + repoName + '/' + branch + '/' + encodeURI(page.file);
        const res = await fetch(rawUrl);
        if (res.ok) {
          existingContent = await res.text();
        }
      } catch (error) {
        console.error('Failed to fetch current file content', error);
      }

      openModal({
        title: 'Edit ' + page.title,
        fileName: page.file,
        readOnlyFile: true,
        content: existingContent,
        saveHandler: async () => {
          const updatedContent = htmlContentInput.value.trim();
          if (!updatedContent) {
            throw new Error('Please provide the updated HTML content.');
          }
          const sha = await fetchFileSha(page.file, token);
          await saveFileToGithub({ file: page.file, content: updatedContent, token, sha });
          const titleMatch = updatedContent.match(/<title>([^<]*)<\\/title>/i);
          if (titleMatch && titleMatch[1]) {
            page.title = titleMatch[1].trim();
          }
        },
      });
    }

    function openNewModal() {
      const token = ensureToken();
      if (!token) {
        return;
      }
      activeFile = null;
      isEditMode = false;
      openModal({
        title: 'Create New Page',
        fileName: '',
        readOnlyFile: false,
        content: '',
        saveHandler: async () => {
          const fileName = fileNameInput.value.trim();
          const content = htmlContentInput.value.trim();
          if (!fileName) {
            throw new Error('Please provide a file name ending with .html');
          }
          if (!/\.html?$/i.test(fileName)) {
            throw new Error('File name must end with .html');
          }
          if (!content) {
            throw new Error('Please paste the HTML content to save.');
          }
          await saveFileToGithub({ file: fileName, content, token });
          const titleMatch = content.match(/<title>([^<]*)<\\/title>/i);
          const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : fileName;
          if (!pageData.some((p) => p.file === fileName)) {
            pageData.push({ file: fileName, title });
            pageData.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
          }
          favorites.add(fileName);
          localStorage.setItem(favoritesKey, JSON.stringify(Array.from(favorites)));
        },
      });
    }

    searchInput.addEventListener('input', () => renderCards());
    showAllBtn.addEventListener('click', () => setFilter('all'));
    showFavBtn.addEventListener('click', () => setFilter('favorites'));
    newPageBtn.addEventListener('click', openNewModal);
    managePatBtn.addEventListener('click', () => {
      const current = localStorage.getItem(patKey) || '';
      const input = window.prompt(current ? 'Update your stored GitHub token:' : 'Add a GitHub Personal Access Token:', current);
      if (input === null) {
        return;
      }
      const trimmed = input.trim();
      if (trimmed) {
        localStorage.setItem(patKey, trimmed);
      } else {
        localStorage.removeItem(patKey);
      }
      updatePatStatus();
    });
    modalCancelBtn.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });

    updatePatStatus();
    renderCards();
  </script>
</body>
</html>`;

fs.writeFileSync(outputPath, html);
console.log(`Generated index.html with ${pages.length} entries.`);