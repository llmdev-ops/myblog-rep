/* ═══════════════════════════════════════
   admin/articles.js — Liste & gestion des articles
   Source : API /api/save-article.php (fichiers .md)
   ═══════════════════════════════════════ */

'use strict';

const Articles = {

  data: [],        // chargé depuis l'API
  _filtered: null,

  // ── Helpers ──────────────────────────────────────────────────────────────
  formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit' });
  },

  pillarShort(pillar) {
    const map = {
      'Performance & Valeur':        'Performance',
      'Leadership & Engagement':     'Leadership',
      'Organisation & Delivery':     'Organisation',
      'Robustesse & Transformation': 'Robustesse',
    };
    return map[pillar] || (pillar || '—').split('&')[0].trim();
  },

  pillarColor(pillar) {
    const map = {
      'Performance & Valeur':        '#2d6a4f',
      'Leadership & Engagement':     '#1d3461',
      'Organisation & Delivery':     '#6b3fa0',
      'Robustesse & Transformation': '#b5451b',
    };
    return map[pillar] || '#888';
  },

  // ── Render une ligne ──────────────────────────────────────────────────────
  renderRow(a) {
    const pub     = a.status === 'published';
    const color   = this.pillarColor(a.pillar);
    const hasSlug = !!a.slug;
    return `
      <div class="table-row" id="row-${a.slug || a._idx}">
        <div class="row-title">
          <div class="row-title__main">${a.title || '(sans titre)'}</div>
          ${a.excerpt ? `<div class="row-title__excerpt">${(a.excerpt).substring(0,90)}…</div>` : ''}
        </div>
        <div>
          <span class="pillar-tag" style="color:${color};border-color:${color}33;background:${color}11">
            ${this.pillarShort(a.pillar)}
          </span>
        </div>
        <div>
          <span class="status-badge status-badge--${a.status}">
            ${pub ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div class="row-date">${this.formatDate(a.date)}</div>
        <div class="row-actions" onclick="event.stopPropagation()">

          ${hasSlug
            ? `<a class="abtn abtn--ghost abtn--sm" href="/admin/editor.html?slug=${a.slug}">✎ Éditer</a>`
            : `<button class="abtn abtn--ghost abtn--sm" disabled>✎ Éditer</button>`}

          <button class="abtn abtn--ghost abtn--sm"
            style="color:${pub ? '#c0392b' : '#27ae60'};border-color:${pub ? '#c0392b44' : '#27ae6044'}"
            onclick="Articles.toggleStatus('${a.slug}')">
            ${pub ? '⊘ Dépublier' : '✓ Publier'}
          </button>

          <button class="abtn abtn--ghost abtn--sm"
            style="color:#c0392b;border-color:#c0392b44"
            onclick="Articles.confirmDelete('${a.slug}')">✕</button>

          ${hasSlug
            ? `<a class="abtn abtn--ghost abtn--sm" href="/articles/${a.slug}.html" target="_blank" title="Voir sur le site">↗</a>`
            : ''}
        </div>
      </div>`;
  },

  // ── Render la table ───────────────────────────────────────────────────────
  render(subset) {
    const tbody = document.getElementById('articles-tbody');
    if (!tbody) return;
    const list = subset ?? this.data;
    this._filtered = list;
    tbody.innerHTML = list.length
      ? list.map(a => this.renderRow(a)).join('')
      : `<div style="padding:2rem;font-size:.82rem;color:var(--a-text-dim);text-align:center">
           Aucun article trouvé.
         </div>`;
    this._syncBadge();
  },

  // ── Données statiques (articles HTML) ────────────────────────────────────
  _static: [
    { id:1,  title:"Et si la vraie force d'une organisation n'était pas sa performance ?", pillar:"Robustesse & Transformation", date:"2025-07-04", excerpt:"Sur la robustesse, la résilience et ce qu'elles impliquent vraiment dans une perspective systémique.", readtime:"7", status:"published", slug:"vraie-force-organisation-performance" },
    { id:2,  title:"Agir pour apprendre — et pas seulement pour produire", pillar:"Performance & Valeur", date:"2025-06-18", excerpt:"Sans boucles d'apprentissage réelles, l'accélération génère du bruit plutôt que de la valeur.", readtime:"8", status:"published", slug:"agir-pour-apprendre" },
    { id:3,  title:"Le changement n'est pas un projet (et c'est pour ça qu'il échoue)", pillar:"Robustesse & Transformation", date:"2025-05-30", excerpt:"Définir une date de fin pour une transformation réelle, c'est déjà lui donner les conditions de son échec.", readtime:"9", status:"published", slug:"changement-pas-un-projet" },
    { id:4,  title:"L'humain avant les chiffres : la clé du coaching efficace", pillar:"Leadership & Engagement", date:"2024-05-06", excerpt:"Pour libérer le potentiel d'une équipe, il faut se concentrer sur les comportements — pas sur les résultats.", readtime:"6", status:"published", slug:"humain-avant-chiffres-coaching" },
    { id:5,  title:"unFIX révolutionne la résolution de problèmes", pillar:"Organisation & Delivery", date:"2024-03-27", excerpt:"Une révélation pour ceux qui souhaitent travailler ensemble à la résolution des problèmes.", readtime:"7", status:"published", slug:"unfix-resolution-problemes" },
    { id:6,  title:"Naviguer au gré des marées du changement", pillar:"Robustesse & Transformation", date:"2023-08-07", excerpt:"Comment adapter sa posture face aux transformations continues des organisations.", readtime:"8", status:"published", slug:"naviguer-au-gre-des-marees-du-changement" },
    { id:7,  title:"Comprendre la complexité avec Cynefin (3/3)", pillar:"Robustesse & Transformation", date:"2023-08-04", excerpt:"Troisième partie : appliquer le cadre Cynefin à la transformation organisationnelle.", readtime:"9", status:"published", slug:"comprendre-la-complexite-cynefin-3" },
    { id:8,  title:"Comprendre la complexité avec Cynefin (2/3)", pillar:"Robustesse & Transformation", date:"2023-08-03", excerpt:"Deuxième partie : les domaines compliqué, complexe et chaotique.", readtime:"8", status:"published", slug:"comprendre-la-complexite-cynefin-2" },
    { id:9,  title:"Comprendre la complexité avec Cynefin (1/3)", pillar:"Robustesse & Transformation", date:"2023-08-02", excerpt:"Premier volet : introduction au cadre Cynefin et au domaine simple.", readtime:"7", status:"published", slug:"comprendre-la-complexite-cynefin-1" },
    { id:10, title:"L'énigme de l'engagement", pillar:"Leadership & Engagement", date:"2023-04-14", excerpt:"Pourquoi l'engagement reste l'une des questions les plus complexes du management.", readtime:"9", status:"published", slug:"l-enigme-de-l-engagement" },
    { id:11, title:"Se préparer à faciliter en 30 questions", pillar:"Organisation & Delivery", date:"2022-02-09", excerpt:"Un guide pratique pour préparer une session de facilitation rigoureuse.", readtime:"6", status:"published", slug:"se-preparer-a-faciliter-en-30-questions" },
    { id:12, title:"La facilitation en entreprise", pillar:"Organisation & Delivery", date:"2022-02-01", excerpt:"Ce que faciliter veut dire vraiment — et ce que ça ne veut pas dire.", readtime:"7", status:"published", slug:"la-facilitation-en-entreprise" },
    { id:13, title:"Rien de plus inutile qu'une chose bien faite qui n'aurait pas dû être faite", pillar:"Performance & Valeur", date:"2021-01-26", excerpt:"L'efficience sans efficacité : le piège des organisations qui optimisent le mauvais problème.", readtime:"8", status:"published", slug:"rien-de-plus-inutile" },
    { id:14, title:"Une matinée en Open Space à distance", pillar:"Organisation & Delivery", date:"2020-12-07", excerpt:"Retour d'expérience sur un format collaboratif adapté au travail à distance.", readtime:"5", status:"published", slug:"une-matinee-open-space-a-distance" },
    { id:15, title:"REX Impact Mapping — SOPO 2019", pillar:"Organisation & Delivery", date:"2019-02-04", excerpt:"Retour d'expérience sur l'utilisation de l'Impact Mapping en contexte réel.", readtime:"6", status:"published", slug:"rex-impact-mapping-sopo-2019" },
  ],

  // ── Chargement : statique + API .md ──────────────────────────────────────
  async load() {
    const tbody = document.getElementById('articles-tbody');
    if (tbody) tbody.innerHTML = `<div style="padding:2rem;font-size:.82rem;color:var(--a-text-dim);text-align:center">Chargement…</div>`;

    // Toujours commencer avec les articles HTML statiques
    let combined = this._static.map((a, i) => ({ ...a, _idx: i, _source: 'html' }));

    // Tenter de charger les articles .md depuis l'API
    try {
      const res = await fetch('/api/save-article.php');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.articles) && data.articles.length > 0) {
          const mdArticles = data.articles.map((a, i) => ({
            ...a,
            _idx: combined.length + i,
            _source: 'md'
          }));
          // Dédupliquer : les .md priment sur les statiques (même slug)
          const staticSlugs = new Set(combined.map(a => a.slug));
          const newMd = mdArticles.filter(a => !staticSlugs.has(a.slug));
          // Remplacer les statiques par leur version .md si elle existe
          const mdSlugs = new Set(mdArticles.map(a => a.slug));
          combined = combined.filter(a => !mdSlugs.has(a.slug));
          combined = [...combined, ...mdArticles];
        }
      }
    } catch (e) {
      // API indisponible — on garde juste les statiques, pas d'erreur affichée
    }

    // Trier par date décroissante
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.data = combined;

    this.render();
    this._syncDashboard();
  },

  // ── Filtres combinés ──────────────────────────────────────────────────────
  applyFilters() {
    const q      = (document.getElementById('articles-search')?.value || '').toLowerCase().trim();
    const pillar = document.getElementById('articles-filter-pillar')?.value || '';
    const status = document.getElementById('articles-filter-status')?.value || '';

    const list = this.data.filter(a => {
      const mQ = !q      || (a.title||'').toLowerCase().includes(q) || (a.excerpt||'').toLowerCase().includes(q);
      const mP = !pillar || (a.pillar||'').toLowerCase().includes(pillar.toLowerCase());
      const mS = !status || a.status === status;
      return mQ && mP && mS;
    });
    this.render(list);
  },

  // ── Toggle publié / brouillon ─────────────────────────────────────────────
  async toggleStatus(slug) {
    const a = this.data.find(x => x.slug === slug);
    if (!a) return;
    const wasPub    = a.status === 'published';
    const newStatus = wasPub ? 'draft' : 'published';
    a.status = newStatus;

    const row = document.getElementById(`row-${slug}`);
    if (row) row.outerHTML = this.renderRow(a);
    this._syncDashboard();

    try {
      const res  = await fetch('/api/save-article.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status: newStatus }),
      });
      const data = await res.json();
      if (typeof showToast === 'function')
        showToast(data.ok
          ? (wasPub ? `Dépublié ✓ : ${(a.title||'').substring(0,35)}` : `Publié ✓ : ${(a.title||'').substring(0,35)}`)
          : `Erreur : ${data.error}`);
    } catch (e) {
      if (typeof showToast === 'function') showToast('Erreur réseau');
    }
  },

  // ── Suppression avec confirmation inline ─────────────────────────────────
  confirmDelete(slug) {
    const a = this.data.find(x => x.slug === slug);
    if (!a) return;
    const row = document.getElementById(`row-${slug}`);
    if (!row) return;
    row.innerHTML = `
      <div style="grid-column:1/-1;display:flex;align-items:center;gap:1rem;padding:.6rem;background:#fff5f5;border-radius:4px">
        <span style="flex:1;font-size:.84rem">Supprimer définitivement <strong>${a.title}</strong> ?</span>
        <button class="abtn abtn--sm" style="background:#c0392b;color:#fff;border:none"
          onclick="Articles.deleteArticle('${slug}')">Confirmer</button>
        <button class="abtn abtn--ghost abtn--sm"
          onclick="Articles.applyFilters()">Annuler</button>
      </div>`;
  },

  async deleteArticle(slug) {
    const idx = this.data.findIndex(x => x.slug === slug);
    if (idx === -1) return;
    const title = this.data[idx].title;
    this.data.splice(idx, 1);
    this.applyFilters();
    this._syncDashboard();

    try {
      const res  = await fetch('/api/save-article.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (typeof showToast === 'function')
        showToast(data.ok
          ? `Supprimé ✓ — ${(data.deleted || []).join(', ')}`
          : `Supprimé de la liste (${data.error})`);
    } catch (e) {
      if (typeof showToast === 'function') showToast('Erreur réseau');
    }
  },

  // ── Sync UI ───────────────────────────────────────────────────────────────
  _syncBadge() {
    const badge = document.querySelector('[data-view="articles"] .nav-badge');
    if (badge) badge.textContent = this.data.filter(a => a.status === 'published').length;
  },

  _syncDashboard() {
    const pub    = this.data.filter(a => a.status === 'published').length;
    const drafts = this.data.filter(a => a.status === 'draft').length;
    const vals = document.querySelectorAll('.stat-card__value');
    if (vals[0]) vals[0].textContent = pub;
    if (vals[1]) vals[1].textContent = drafts;
    this._syncBadge();
  },

  // ── Init ──────────────────────────────────────────────────────────────────
  init() {
    // Toujours recharger pour récupérer les nouveaux articles .md
    this.load();

    document.getElementById('articles-search')
      ?.addEventListener('input', () => this.applyFilters());
    document.getElementById('articles-filter-pillar')
      ?.addEventListener('change', () => this.applyFilters());
    document.getElementById('articles-filter-status')
      ?.addEventListener('change', () => this.applyFilters());
  },
};

window.Articles = Articles;
