<?php
/**
 * claude-proxy.php — Proxy PHP pour appels Anthropic API
 * Évite les problèmes CORS lors d'appels directs depuis le navigateur
 *
 * ⚠️  SÉCURITÉ : Ce fichier contient votre clé API.
 *     Ne jamais le déployer sur un serveur public sans protection.
 *     Sur localhost, c'est sans risque.
 */

// ── Votre clé API Anthropic ───────────────────────────────────────────────
define('ANTHROPIC_API_KEY', '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');

// ── Headers ───────────────────────────────────────────────────────────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// ── Lire le body JSON envoyé par l'éditeur ────────────────────────────────
$body = file_get_contents('php://input');
if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Body vide']);
    exit;
}

// ── Appel à l'API Anthropic via cURL ─────────────────────────────────────
$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $error]);
    exit;
}

http_response_code($httpCode);
echo $response;
