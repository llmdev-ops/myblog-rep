# loiclemolgat.fr — Structure du projet

## Organisation des fichiers

```
loiclemolgat.fr/
│
├── index.html                  ← Page d'accueil
├── articles.html               ← Liste des articles
├── a-propos.html               ← Page À propos
├── contact.html                ← Page Contact
│
├── articles/                   ← Pages articles individuels
│   ├── vraie-force-organisation-performance.html
│   ├── agir-pour-apprendre.html
│   ├── changement-pas-un-projet.html
│   └── [slug-de-l-article].html
│
├── admin/                      ← Interface d'administration
│   ├── index.html              ← CMS (tableau de bord, éditeur, paramètres)
│   └── login.html              ← Page de connexion
│
├── css/
│   ├── base.css                ← Variables, reset, typographie, utilitaires
│   ├── components.css          ← Boutons, badges, tags, toast, cartes
│   ├── layout.css              ← Nav, footer, grilles, responsive
│   │
│   ├── pages/                  ← Styles spécifiques aux pages publiques
│   │   ├── home.css            ← Page d'accueil
│   │   ├── articles.css        ← Liste articles + filtres
│   │   └── article.css         ← Article en lecture (progress bar, corps)
│   │
│   └── admin/                  ← Styles de l'interface admin
│       ├── admin-base.css      ← Variables admin, sidebar, topbar, formulaires
│       ├── editor.css          ← Éditeur d'articles (toolbar, contenu, sidebar)
│       └── dashboard.css       ← Tableau de bord, stats, grilles admin
│
├── js/
│   ├── main.js                 ← JS global : nav mobile, scroll reveal, filtres, toast
│   │
│   ├── pages/                  ← JS spécifique aux pages publiques
│   │   └── article.js          ← Barre de lecture, partage
│   │
│   └── admin/                  ← JS de l'administration
│       ├── admin-core.js       ← Navigation entre vues, toast, utilitaires
│       ├── articles.js         ← Données, rendu table, recherche, filtres
│       └── editor.js           ← Éditeur : new/load/save/publish, word count, autosave
│
├── images/
│   ├── og/                     ← Images Open Graph (partage social)
│   │   └── og-default.jpg
│   └── icons/                  ← Icônes SVG, favicons
│       └── favicon.ico
│
└── fonts/                      ← Polices auto-hébergées (optionnel)

```

## Règles d'architecture

### CSS — Chaque fichier a une responsabilité unique
| Fichier | Responsabilité |
|---|---|
| `base.css` | Variables CSS, reset, scale typographique |
| `components.css` | Composants réutilisables (boutons, badges, toast) |
| `layout.css` | Structure des pages (nav, footer, grilles) |
| `pages/home.css` | Styles spécifiques à l'accueil |
| `pages/articles.css` | Liste des articles et filtres |
| `pages/article.css` | Lecture d'un article (barre de progression, corps) |
| `admin/admin-base.css` | Système de design de l'admin |
| `admin/editor.css` | Interface de rédaction |

### JS — Séparation des responsabilités
| Fichier | Responsabilité |
|---|---|
| `main.js` | Interactions globales côté public |
| `admin/admin-core.js` | Navigation entre vues, utilitaires partagés |
| `admin/articles.js` | Données, rendu et filtrage de la liste |
| `admin/editor.js` | Logique complète de l'éditeur |

### HTML — Ordre des imports
Pages **publiques** :
```html
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/pages/[page].css">   <!-- en dernier -->
...
<script src="/js/main.js"></script>
```

Pages **admin** :
```html
<link rel="stylesheet" href="/css/admin/admin-base.css">
<link rel="stylesheet" href="/css/admin/editor.css">
...
<script src="/js/admin/admin-core.js"></script>   <!-- en premier -->
<script src="/js/admin/articles.js"></script>
<script src="/js/admin/editor.js"></script>
```

## Conventions de nommage

### CSS — BEM modifié
```
.composant            ← Bloc
.composant__element   ← Élément enfant
.composant--modifier  ← Variante / modificateur
```

Exemples :
- `.nav`, `.nav__link`, `.nav__link--cta`
- `.btn`, `.btn--primary`, `.btn--sm`
- `.hero`, `.hero__title`, `.hero__sub`

### HTML — data-attributes
- `data-pillar` : pilier éditorial de l'article (pour les filtres)
- `data-reveal` : déclencheur d'animation au scroll
- `data-view`  : identifiant de vue admin (pour la navigation)
- `data-manual`: indique que le slug a été édité manuellement

## Environnement de développement

Pré-requis : serveur local (PHP, Python, Nginx…)

```bash
# Python
python3 -m http.server 8000

# PHP
php -S localhost:8000

# Node / npx
npx serve .
```

Puis ouvrir : http://localhost:8000
Admin : http://localhost:8000/admin/
