<?php
require_once __DIR__ . '/cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/session.php';

if (isset($_SESSION['user'])) {
    echo json_encode([
        'success' => true,
        'user' => $_SESSION['user']
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized'
    ]);
}
?>