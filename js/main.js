/* ═══════════════════════════════════════
   main.js — JS global du site public
   loiclemolgat.fr
   ═══════════════════════════════════════ */

'use strict';

// ─── NAV MOBILE ───
(function initNav() {
  const burger = document.querySelector('.nav__burger');
  const links  = document.querySelector('.nav__links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('nav__links--open');
    burger.setAttribute('aria-expanded', open);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('nav__links--open');
    }
  });
})();

// ─── READING PROGRESS ───
(function initProgress() {
  const bar = document.querySelector('.reading-progress__fill');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = Math.min(100, progress) + '%';
  }, { passive: true });
})();

// ─── SCROLL REVEAL ───
(function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
})();

// ─── FILTER CHIPS (articles page) ───
(function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const pillar = chip.dataset.pillar || '';
      filterArticles(pillar);
    });
  });
})();

function filterArticles(pillar) {
  const items = document.querySelectorAll('[data-pillar]');
  items.forEach(item => {
    if (!pillar || item.dataset.pillar === pillar) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// ─── TOAST NOTIFICATION ───
let toastTimer = null;

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast__message').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── SMOOTH ANCHOR SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')) || 64;
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── EXPORT ───
window.LLM = { showToast, filterArticles };
