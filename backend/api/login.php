

<?php

require_once __DIR__ . "/../includes/auth.php";

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "POST method required."
    ], 405);
}

// Read JSON from React
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    out([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

// Get login details
$email = strtolower(trim($data["email"] ?? ""));
$password = $data["password"] ?? "";

// Validate fields
if ($email === "" || $password === "") {
    out([
        "success" => false,
        "message" => "Please enter email and password."
    ], 422);
}

// Find user
$stmt = $conn->prepare(
    "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Database query failed."
    ], 500);
}

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();

// Verify user and password
if (!$user || !password_verify($password, $user["password"])) {
    out([
        "success" => false,
        "message" => "Invalid email or password."
    ], 401);
}

// Create a secure session
session_regenerate_id(true);

$_SESSION["user_id"] = (int) $user["id"];
$_SESSION["user_name"] = $user["name"];
$_SESSION["user_email"] = $user["email"];

// Return success
out([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "id" => (int) $user["id"],
        "name" => $user["name"],
        "email" => $user["email"]
    ]
]);

?>
