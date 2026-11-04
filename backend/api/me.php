

<?php

require_once __DIR__ . "/../includes/auth.php";

// Make sure the user is logged in
auth();

// Get the logged-in user's details
$userId = (int) $_SESSION["user_id"];

$stmt = $conn->prepare(
    "SELECT id, name, email FROM users WHERE id = ? LIMIT 1"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Database query failed."
    ], 500);
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();

if (!$user) {
    $_SESSION = [];
    session_destroy();

    out([
        "success" => false,
        "message" => "User not found. Please log in again."
    ], 401);
}

out([
    "success" => true,
    "user" => $user
]);

?>
