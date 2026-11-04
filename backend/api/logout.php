
<?php

require_once "../includes/auth.php";

// Clear all session data
$_SESSION = [];

// Remove the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        "",
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Send response
out([
    "success" => true,
    "message" => "Logged out successfully."
]);

?>