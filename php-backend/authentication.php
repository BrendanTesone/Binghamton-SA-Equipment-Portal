<?php
require_once __DIR__ . '/cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method. Use POST.']);
    exit;
}

// Get ID Token from POST body
$id_token = $_POST['id_token'] ?? null;

if (!$id_token) {
    echo json_encode(['success' => false, 'error' => 'No ID token provided.']);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

$CLIENT_ID = '547128080802-vhddrapvl86p6gnrppcvbcd5s7ergnn3.apps.googleusercontent.com';
$client = new Google_Client(['client_id' => $CLIENT_ID]);

try {
    $payload = $client->verifyIdToken($id_token);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Token verification threw an exception: ' . $e->getMessage()]);
    exit;
}

if (!$payload) {
    echo json_encode(['success' => false, 'error' => 'Token verification failed. Invalid token.']);
    exit;
}

// --- RBAC CHECK ---
require 'database.php'; // Ensure database connection

$email = $payload['email'];
$role = 'client'; // Default

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        $role = 'admin';
    }
} catch (Exception $e) {
    error_log("Auth DB Logic Error: " . $e->getMessage());
}

// --- SECURE SESSION CREATION ---
require_once __DIR__ . '/session.php';

$_SESSION['user'] = [
    'name' => $payload['name'],
    'email' => $email,
    'picture' => $payload['picture'] ?? null,
    'sub' => $payload['sub'],
    'role' => $role
];

// Success! Return user info + role
echo json_encode([
    'success' => true,
    'user' => $_SESSION['user']
]);
?>