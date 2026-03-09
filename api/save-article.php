<?php
/**
 * api/save-article.php
 * POST — sauvegarde un article en fichier .md dans /content/articles/
 *
 * Body JSON attendu :
 * {
 *   "slug":     "nom-de-larticle",
 *   "title":    "Titre",
 *   "pillar":   "Robustesse & Transformation",
 *   "date":     "2025-03-01",
 *   "excerpt":  "Résumé court",
 *   "readtime": "7",
 *   "content":  "# Titre\n\nContenu markdown...",
 *   "status":   "published" | "draft"
 * }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$contentDir = dirname(__DIR__) . '/content/articles';
if (!is_dir($contentDir)) mkdir($contentDir, 0755, true);

// ── GET : liste ou article unique ────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET ?slug=xxx → retourne un article complet avec son contenu
    if (!empty($_GET['slug'])) {
        $slug = preg_replace('/[^a-z0-9\-]/', '', $_GET['slug']);
        $file = $contentDir . '/' . $slug . '.md';
        if (!file_exists($file)) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Article introuvable : ' . $slug]);
            exit;
        }
        $raw  = file_get_contents($file);
        $meta = parseFrontmatter($raw);
        $meta['slug']    = $slug;
        $meta['content'] = stripFrontmatter($raw);
        echo json_encode(['ok' => true, 'article' => $meta]);
        exit;
    }

    // GET sans paramètre → liste tous les articles
    $files = glob($contentDir . '/*.md');
    $articles = [];
    foreach ($files as $file) {
        $raw = file_get_contents($file);
        $meta = parseFrontmatter($raw);
        $slug = basename($file, '.md');
        $meta['slug'] = $slug;
        $meta['content_preview'] = mb_substr(strip_tags(stripFrontmatter($raw)), 0, 120) . '…';
        $articles[] = $meta;
    }
    usort($articles, function($a, $b) { return strcmp($b['date'] ?? '', $a['date'] ?? ''); });
    echo json_encode(['ok' => true, 'articles' => $articles]);
    exit;
}

// ── DELETE : supprimer un article (.md + .html si présent) ───────────────────
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $slug = preg_replace('/[^a-z0-9\-]/', '', $body['slug'] ?? '');
    if (!$slug) { echo json_encode(['ok' => false, 'error' => 'Slug manquant']); exit; }

    $deleted = [];
    $errors  = [];

    // Supprimer le .md
    $mdFile = $contentDir . '/' . $slug . '.md';
    if (file_exists($mdFile)) {
        unlink($mdFile);
        $deleted[] = 'content/articles/' . $slug . '.md';
    } else {
        $errors[] = '.md introuvable';
    }

    // Supprimer le .html si présent
    $htmlFile = dirname(__DIR__) . '/articles/' . $slug . '.html';
    if (file_exists($htmlFile)) {
        unlink($htmlFile);
        $deleted[] = 'articles/' . $slug . '.html';
    }

    if (empty($deleted)) {
        echo json_encode(['ok' => false, 'error' => 'Aucun fichier trouvé pour ce slug']);
    } else {
        echo json_encode(['ok' => true, 'deleted' => $deleted, 'warnings' => $errors]);
    }
    exit;
}

// ── PATCH : mettre à jour uniquement le statut ────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    $slug   = preg_replace('/[^a-z0-9\-]/', '', $body['slug']   ?? '');
    $status = in_array($body['status'] ?? '', ['published', 'draft']) ? $body['status'] : null;

    if (!$slug)   { echo json_encode(['ok' => false, 'error' => 'Slug manquant']);   exit; }
    if (!$status) { echo json_encode(['ok' => false, 'error' => 'Statut invalide']); exit; }

    $file = $contentDir . '/' . $slug . '.md';
    if (!file_exists($file)) {
        echo json_encode(['ok' => false, 'error' => 'Fichier introuvable : ' . $slug . '.md']);
        exit;
    }

    $raw = file_get_contents($file);

    // Remplacer la ligne status: dans le frontmatter
    if (preg_match('/^---.*?---/s', $raw)) {
        // Le frontmatter existe — remplacer ou ajouter la ligne status
        $raw = preg_replace('/^(status:\s*)\S+/m', 'status: ' . $status, $raw);
        // Si la ligne n'existait pas, l'injecter avant le --- de fermeture
        if (!preg_match('/^status:/m', $raw)) {
            $raw = preg_replace('/^---/m', "---", $raw, 1);
            $raw = preg_replace('/(---\n\n)/s', "---\nstatus: $status\n---\n\n", $raw, 1);
        }
    }

    file_put_contents($file, $raw);
    echo json_encode(['ok' => true, 'slug' => $slug, 'status' => $status]);
    exit;
}

// ── POST : créer ou mettre à jour ─────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) { echo json_encode(['ok' => false, 'error' => 'JSON invalide']); exit; }

    // Validation
    $title   = trim($body['title']   ?? '');
    $content = trim($body['content'] ?? '');
    $slug    = trim($body['slug']    ?? '');

    if (!$title)   { echo json_encode(['ok' => false, 'error' => 'Titre manquant']);   exit; }
    if (!$content) { echo json_encode(['ok' => false, 'error' => 'Contenu manquant']); exit; }

    // Génération automatique du slug si absent
    if (!$slug) {
        $slug = generateSlug($title);
    }
    $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);

    // Construction du fichier .md avec frontmatter
    $date     = trim($body['date']     ?? date('Y-m-d'));
    $pillar   = trim($body['pillar']   ?? '');
    $excerpt  = trim($body['excerpt']  ?? '');
    $readtime = trim($body['readtime'] ?? '');
    $status   = in_array($body['status'] ?? '', ['published', 'draft']) ? $body['status'] : 'published';

    $fm  = "---\n";
    $fm .= "title: \"" . str_replace('"', '\\"', $title) . "\"\n";
    $fm .= "pillar: \"" . str_replace('"', '\\"', $pillar) . "\"\n";
    $fm .= "date: $date\n";
    $fm .= "excerpt: \"" . str_replace('"', '\\"', $excerpt) . "\"\n";
    $fm .= "readtime: \"$readtime\"\n";
    $fm .= "status: $status\n";
    $fm .= "---\n\n";

    $fileContent = $fm . $content;
    $filePath = $contentDir . '/' . $slug . '.md';

    // Vérifier que le dossier est accessible en écriture
    if (!is_writable($contentDir)) {
        http_response_code(500);
        echo json_encode([
            'ok'    => false,
            'error' => 'Dossier non accessible en écriture : ' . $contentDir . ' — lancez : chmod 755 ' . $contentDir
        ]);
        exit;
    }

    $written = file_put_contents($filePath, $fileContent);
    if ($written === false) {
        http_response_code(500);
        echo json_encode([
            'ok'    => false,
            'error' => 'Échec écriture fichier : ' . $filePath
        ]);
        exit;
    }

    echo json_encode([
        'ok'    => true,
        'slug'  => $slug,
        'url'   => '/article.php?slug=' . $slug,
        'file'  => 'content/articles/' . $slug . '.md',
        'bytes' => $written,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Méthode non autorisée']);

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseFrontmatter(string $raw): array {
    $meta = [];
    if (strpos($raw, '---') !== 0) return $meta;
    $end = strpos($raw, '---', 3);
    if ($end === false) return $meta;
    $fm = substr($raw, 3, $end - 3);
    foreach (explode("\n", $fm) as $line) {
        if (strpos($line, ':') !== false) {
            [$k, $v] = explode(':', $line, 2);
            $meta[trim($k)] = stripslashes(trim($v, " \t\n\r\"'"));
        }
    }
    return $meta;
}

function stripFrontmatter(string $raw): string {
    if (strpos($raw, '---') !== 0) return $raw;
    $end = strpos($raw, '---', 3);
    return $end !== false ? trim(substr($raw, $end + 3)) : $raw;
}

function generateSlug(string $text): string {
    $text = mb_strtolower($text);
    $from = ['à','â','ä','é','è','ê','ë','î','ï','ô','ö','ù','û','ü','ç','æ','œ',"'",'"','«','»','—','…'];
    $to   = ['a','a','a','e','e','e','e','i','i','o','o','u','u','u','c','ae','oe','-','-','-','-','-',''];
    $text = str_replace($from, $to, $text);
    $text = preg_replace('/[^a-z0-9\s\-]/', '', $text);
    $text = preg_replace('/[\s\-]+/', '-', trim($text));
    return substr($text, 0, 80);
}
