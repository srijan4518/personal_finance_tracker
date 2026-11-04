
<?php

require_once __DIR__ . "/../includes/auth.php";

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "POST method required."
    ], 405);
}

// Read JSON data sent by React
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    out([
        "success" => false,
        "message" => "Invalid request data."
    ], 400);
}

// Get form values
$name = trim($data["name"] ?? "");
$email = strtolower(trim($data["email"] ?? ""));
$password = $data["password"] ?? "";

// Validate input
if (
    $name === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($password) < 8
) {
    out([
        "success" => false,
        "message" => "Enter a valid name, email and password of at least 8 characters."
    ], 422);
}

// Check whether email already exists
$stmt = $conn->prepare(
    "SELECT id FROM users WHERE email = ?"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Database query failed."
    ], 500);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();

    out([
        "success" => false,
        "message" => "This email is already registered."
    ], 409);
}

$stmt->close();

// Securely hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Could not prepare registration."
    ], 500);
}

$stmt->bind_param(
    "sss",
    $name,
    $email,
    $hashedPassword
);

if (!$stmt->execute()) {
    $stmt->close();

    out([
        "success" => false,
        "message" => "Registration failed."
    ], 500);
}

$stmt->close();

// Send success response
out([
    "success" => true,
    "message" => "Account created successfully. Please log in."
]);

?>
