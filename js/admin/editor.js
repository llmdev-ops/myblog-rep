/* ═══════════════════════════════════════
   admin/editor.js — Logique de l'éditeur d'articles
   loiclemolgat.fr/admin
   ═══════════════════════════════════════ */

'use strict';

const Editor = {
  current: null,
  autoSaveTimer: null,
  isDirty: false,

  // ─── ELEMENTS ───
  el: {
    title:    () => document.getElementById('editor-title'),
    body:     () => document.getElementById('editor-body'),
    pillar:   () => document.getElementById('article-pillar'),
    status:   () => document.getElementById('pub-status'),
    pubDate:  () => document.getElementById('pub-date'),
    excerpt:  () => document.getElementById('article-excerpt'),
    slug:     () => document.getElementById('article-slug'),
    wordCount:() => document.getElementById('word-count'),
    readTime: () => document.getElementById('read-time'),
    pillarDisplay: () => document.getElementById('editor-pillar-display'),
    statusDisplay: () => document.getElementById('editor-status-display'),
    statusBadge:   () => document.getElementById('pub-status-badge'),
  },

  // ─── NEW ARTICLE ───
  newArticle() {
    this.current = null;
    this.el.title().value   = '';
    this.el.body().innerHTML = '';
    this.el.pillar().value  = '';
    this.el.status().value  = 'draft';
    this.el.pubDate().value = new Date().toISOString().split('T')[0];
    this.el.excerpt() && (this.el.excerpt().value = '');
    this.el.slug()    && (this.el.slug().value    = '');
    this.updatePillarDisplay();
    this.updateStatusDisplay('draft');
    this.updateWordCount();
    this.isDirty = false;
    this.el.title().focus();
  },

  // ─── LOAD ARTICLE ───
  load(article) {
    this.current = article;
    this.el.title().value       = article.title || '';
    this.el.body().innerHTML    = article.body  || `<p>${article.excerpt}</p>`;
    this.el.pillar().value      = article.pillar || '';
    this.el.status().value      = article.status || 'draft';
    this.el.pubDate().value     = article.date   || new Date().toISOString().split('T')[0];
    this.el.excerpt() && (this.el.excerpt().value = article.excerpt || '');
    this.el.slug()    && (this.el.slug().value    = article.slug    || '');
    this.updatePillarDisplay();
    this.updateStatusDisplay(article.status || 'draft');
    this.updateWordCount();
    this.isDirty = false;
  },

  // ─── COLLECT DATA ───
  collect() {
    return {
      ...(this.current || {}),
      title:   this.el.title()?.value?.trim() || '',
      body:    this.el.body()?.innerHTML || '',
      pillar:  this.el.pillar()?.value || '',
      status:  this.el.status()?.value || 'draft',
      date:    this.el.pubDate()?.value || null,
      excerpt: this.el.excerpt()?.value?.trim() || '',
      slug:    this.el.slug()?.value?.trim() || this.autoSlug(),
    };
  },

  autoSlug() {
    const title = this.el.title()?.value || '';
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);
  },

  // ─── SAVE DRAFT ───
  saveDraft() {
    const data = this.collect();
    data.status = 'draft';
    // In production: POST /api/articles or PUT /api/articles/:id
    console.log('Save draft:', data);
    this.isDirty = false;
    this.markSaved();
    showToast('Brouillon sauvegardé');
  },

  // ─── PUBLISH ───
  publish() {
    const data = this.collect();
    if (!data.title) { showToast('Ajoutez un titre avant de publier', 'error'); return; }
    if (!data.pillar) { showToast('Choisissez un pilier avant de publier', 'error'); return; }
    data.status = 'published';
    data.date   = data.date || new Date().toISOString().split('T')[0];
    // In production: POST/PUT /api/articles
    console.log('Publish:', data);
    this.el.status().value = 'published';
    this.updateStatusDisplay('published');
    this.isDirty = false;
    this.markSaved();
    showToast('Article publié ↗');
  },

  // ─── AUTO SAVE ───
  triggerAutoSave() {
    this.isDirty = true;
    const label = document.getElementById('autosave-label');
    if (label) label.textContent = 'Modification…';
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveDraft();
    }, 2000);
  },

  markSaved() {
    const label = document.getElementById('autosave-label');
    if (label) label.textContent = 'Sauvegardé';
  },

  // ─── WORD COUNT ───
  updateWordCount() {
    const title   = this.el.title()?.value || '';
    const content = this.el.body()?.innerText || '';
    const text    = (title + ' ' + content).trim();
    const words   = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const mins    = Math.max(1, Math.round(words / 220));
    if (this.el.wordCount()) this.el.wordCount().textContent = `${words} mots`;
    if (this.el.readTime())  this.el.readTime().textContent  = `~ ${mins} min de lecture`;
  },

  // ─── UI SYNC ───
  updatePillarDisplay() {
    const val = this.el.pillar()?.value || '';
    if (this.el.pillarDisplay()) {
      this.el.pillarDisplay().textContent = val || 'Pilier non défini';
    }
  },

  updateStatusDisplay(status) {
    const badge   = this.el.statusBadge();
    const display = this.el.statusDisplay();
    const published = status === 'published';
    if (badge) {
      badge.className = `status-badge status-badge--${status}`;
      badge.textContent = published ? 'Publié' : 'Brouillon';
    }
    if (display) display.textContent = published ? 'Publié' : 'Brouillon';
  },

  // ─── FORMATTING ───
  format(cmd) {
    const body = this.el.body();
    if (!body) return;
    body.focus();
    switch (cmd) {
      case 'bold':    document.execCommand('bold');      break;
      case 'italic':  document.execCommand('italic');    break;
      case 'h2':      document.execCommand('formatBlock', false, 'h2'); break;
      case 'h3':      document.execCommand('formatBlock', false, 'h3'); break;
      case 'quote':   document.execCommand('formatBlock', false, 'blockquote'); break;
      case 'ul':      document.execCommand('insertUnorderedList'); break;
      case 'link': {
        const url = prompt('URL du lien :');
        if (url) document.execCommand('createLink', false, url);
        break;
      }
    }
    this.updateWordCount();
  },

  // ─── TAGS ───
  addTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const input = e.target;
    const val   = input.value.trim().replace(',', '');
    if (!val) return;
    const container = document.getElementById('tags-container');
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${val} <span class="tag__remove" onclick="Editor.removeTag(this)">×</span>`;
    container.insertBefore(tag, input);
    input.value = '';
  },

  removeTag(el) {
    el.closest('.tag')?.remove();
  },

  // ─── INIT ───
  init() {
    // Bind content input
    const body = this.el.body();
    if (body) {
      body.addEventListener('input', () => {
        this.updateWordCount();
        this.triggerAutoSave();
      });
    }

    // Bind title input
    const title = this.el.title();
    if (title) {
      title.addEventListener('input', () => {
        this.updateWordCount();
        this.triggerAutoSave();
        // Auto-fill slug
        const slugEl = this.el.slug();
        if (slugEl && !slugEl.dataset.manual) slugEl.value = this.autoSlug();
      });
    }

    // Bind pillar change
    const pillar = this.el.pillar();
    if (pillar) pillar.addEventListener('change', () => this.updatePillarDisplay());

    // Bind status change
    const status = this.el.status();
    if (status) status.addEventListener('change', () => this.updateStatusDisplay(status.value));

    // Mark slug as manually edited
    const slug = this.el.slug();
    if (slug) slug.addEventListener('input', () => { slug.dataset.manual = 'true'; });

    // Set today
    const pubDate = this.el.pubDate();
    if (pubDate && !pubDate.value) pubDate.value = new Date().toISOString().split('T')[0];

    // Warn on unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    this.updateWordCount();
  },
};

window.Editor = Editor;
