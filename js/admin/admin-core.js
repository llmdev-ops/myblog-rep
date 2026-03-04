/* ═══════════════════════════════════════
   admin/admin-core.js — Navigation & utilitaires admin
   loiclemolgat.fr/admin
   ═══════════════════════════════════════ */

'use strict';

// ─── STATE ───
const Admin = {
  currentView: 'dashboard',
  toastTimer: null,
};

// ─── VIEWS ───
const VIEW_META = {
  dashboard: { title: 'Tableau de bord', path: 'Accueil' },
  articles:  { title: 'Articles',         path: 'Contenu'  },
  editor:    { title: 'Éditeur',           path: 'Contenu'  },
  settings:  { title: 'Paramètres',        path: 'Système'  },
  pillars:   { title: 'Piliers',           path: 'Contenu'  },
};

function showView(id, opts = {}) {
  // Hide all views
  document.querySelectorAll('.a-view').forEach(v => v.classList.remove('active'));

  // Show target
  const target = document.getElementById('view-' + id);
  if (!target) return console.warn('View not found:', id);
  target.classList.add('active');

  // Update nav
  document.querySelectorAll('.sidebar__nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-view="${id}"]`)?.classList.add('active');

  // Update topbar
  const meta = VIEW_META[id] || {};
  document.getElementById('topbar-title').textContent = meta.title || id;
  document.getElementById('topbar-path').textContent  = meta.path  || 'Admin';

  // Update topbar actions
  const actions = document.getElementById('topbar-actions');
  if (id === 'editor') {
    actions.innerHTML = `
      <span class="autosave"><div class="autosave__dot"></div><span id="autosave-label">Sauvegardé</span></span>
      <button class="abtn abtn--ghost abtn--sm" onclick="Editor.saveDraft()">Brouillon</button>
      <button class="abtn abtn--primary abtn--sm" onclick="Editor.publish()">↗ Publier</button>
    `;
  } else {
    actions.innerHTML = `
      <button class="abtn abtn--ghost abtn--sm" onclick="showView('editor'); Editor.newArticle()">+ Nouvel article</button>
    `;
  }

  Admin.currentView = id;

  // Optional callback
  if (opts.onShow) opts.onShow();
}

// ─── TOAST ───
function showToast(msg, type = 'success') {
  const el = document.getElementById('a-toast');
  if (!el) return;
  el.querySelector('.a-toast__msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(Admin.toastTimer);
  Admin.toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── SETTINGS NAV ───
function showSettingsPanel(id, el) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('settings-' + id).classList.add('active');
  if (el) el.classList.add('active');
}

// ─── EXPORT ───
window.showView = showView;
window.showToast = showToast;
window.showSettingsPanel = showSettingsPanel;
