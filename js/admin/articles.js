/* ═══════════════════════════════════════
   admin/articles.js — Liste & gestion des articles
   loiclemolgat.fr/admin
   ═══════════════════════════════════════ */

'use strict';

// ─── DATA (remplacé par appels API en production) ───
const Articles = {
  data: [
    {
      id: 1,
      title: "Et si la vraie force d'une organisation n'était pas sa performance ?",
      pillar: "Robustesse & Transformation",
      status: "published",
      date: "2025-07-04",
      excerpt: "Une organisation qui n'écoute plus ce qu'elle provoque finit par ne plus rien provoquer du tout.",
      slug: "vraie-force-organisation-performance",
      readTime: 7,
    },
    {
      id: 2,
      title: "Agir pour apprendre — et pas seulement pour produire",
      pillar: "Performance & Valeur",
      status: "published",
      date: "2025-06-18",
      excerpt: "Longtemps, on a cru que produire suffisait. Mais en silence, un doute persistait.",
      slug: "agir-pour-apprendre",
      readTime: 8,
    },
    {
      id: 3,
      title: "Le changement n'est pas un projet (et c'est pour ça qu'il échoue)",
      pillar: "Robustesse & Transformation",
      status: "published",
      date: "2025-05-30",
      excerpt: "Le piège du grand plan. Définir une date de fin pour une transformation réelle, c'est déjà lui donner les conditions de son échec.",
      slug: "changement-pas-un-projet",
      readTime: 9,
    },
    {
      id: 4,
      title: "[Brouillon] L'écoute comme compétence stratégique",
      pillar: "Leadership & Engagement",
      status: "draft",
      date: null,
      excerpt: "En cours de rédaction…",
      slug: "",
      readTime: 0,
    },
    {
      id: 5,
      title: "[Brouillon] Quand la structure mange la stratégie",
      pillar: "Organisation & Delivery",
      status: "draft",
      date: null,
      excerpt: "En cours de rédaction…",
      slug: "",
      readTime: 0,
    },
    {
      id: 6,
      title: "L'humain avant les chiffres : la clé du coaching efficace",
      pillar: "Leadership & Engagement",
      status: "published",
      date: "2024-05-06",
      excerpt: "Les chiffres ne sont que des indicateurs. Pour libérer le potentiel d'une équipe, concentrez-vous sur les comportements.",
      slug: "humain-avant-chiffres-coaching",
      readTime: 6,
    },
    {
      id: 7,
      title: "unFIX révolutionne la résolution de problèmes",
      pillar: "Organisation & Delivery",
      status: "published",
      date: "2024-03-27",
      excerpt: "Une révélation pour ceux qui souhaitent travailler ensemble à la résolution des problèmes organisationnels complexes.",
      slug: "unfix-resolution-problemes",
      readTime: 7,
    },
  ],

  // ─── HELPERS ───
  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  },

  pillarShort(pillar) {
    return pillar.split('&')[0].trim();
  },

  // ─── RENDER TABLE ROW ───
  renderRow(article) {
    return `
      <div class="table-row" onclick="Articles.editFromTable(${article.id})">
        <div class="row-title">
          <div class="row-title__main">${article.title}</div>
          <div class="row-title__excerpt">${article.excerpt}</div>
        </div>
        <div>
          <span class="pillar-tag">${this.pillarShort(article.pillar)}</span>
        </div>
        <div>
          <span class="status-badge status-badge--${article.status}">
            ${article.status === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div class="row-date">${this.formatDate(article.date)}</div>
        <div class="row-actions">
          <button class="abtn abtn--ghost abtn--sm" onclick="event.stopPropagation(); Articles.editFromTable(${article.id})">Éditer</button>
        </div>
      </div>
    `;
  },

  // ─── RENDER ALL ───
  render(subset = null) {
    const tbody = document.getElementById('articles-tbody');
    if (!tbody) return;
    const list = subset ?? this.data;
    tbody.innerHTML = list.length
      ? list.map(a => this.renderRow(a)).join('')
      : `<div style="padding:2rem 1.2rem;font-size:0.82rem;color:var(--a-text-dim);text-align:center">Aucun article trouvé.</div>`;
  },

  // ─── SEARCH ───
  search(query) {
    const q = query.toLowerCase().trim();
    const filtered = q ? this.data.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)) : this.data;
    this.render(filtered);
  },

  // ─── FILTER BY PILLAR ───
  filterPillar(pillar) {
    const filtered = pillar ? this.data.filter(a => a.pillar.toLowerCase().includes(pillar.toLowerCase())) : this.data;
    this.render(filtered);
  },

  // ─── FILTER BY STATUS ───
  filterStatus(status) {
    const filtered = status ? this.data.filter(a => a.status === status) : this.data;
    this.render(filtered);
  },

  // ─── OPEN IN EDITOR ───
  editFromTable(id) {
    const article = this.data.find(a => a.id === id);
    if (!article) return;
    showView('editor');
    Editor.load(article);
  },

  // ─── INIT ───
  init() {
    this.render();

    const searchInput = document.getElementById('articles-search');
    if (searchInput) searchInput.addEventListener('input', e => this.search(e.target.value));

    const pillarSelect = document.getElementById('articles-filter-pillar');
    if (pillarSelect) pillarSelect.addEventListener('change', e => this.filterPillar(e.target.value));

    const statusSelect = document.getElementById('articles-filter-status');
    if (statusSelect) statusSelect.addEventListener('change', e => this.filterStatus(e.target.value));
  },
};

window.Articles = Articles;
