<?php
// backend/session.php

session_set_cookie_params([
    'lifetime' => 86400 * 30, // 30 days
    'path' => '/',
    'httponly' => true,
    'secure' => true, // Requires HTTPS 
    'samesite' => 'None' // Crucial for cross-origin requests (e.g. localhost to remote API)
]);

session_start();
?>