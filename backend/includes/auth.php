
<?php

// Allow requests from the React frontend
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle browser preflight requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// Start PHP session
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        "httponly" => true,
        "samesite" => "Lax",
        "secure" => !empty($_SERVER["HTTPS"]) &&
                    $_SERVER["HTTPS"] !== "off"
    ]);

    session_start();
}

// Connect to database
require_once __DIR__ . "/../config/database.php";

// Common JSON response function
function out($data, $status = 200) {
    http_response_code($status);

    echo json_encode($data);
    exit;
}

// Check whether user is logged in
function auth() {
    if (empty($_SESSION["user_id"])) {
        out([
            "success" => false,
            "message" => "Please log in first."
        ], 401);
    }
}

?>
