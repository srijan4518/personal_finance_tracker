
<?php

require_once "../includes/auth.php";

header("Content-Type: application/json; charset=UTF-8");

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "Invalid request method."
    ], 405);
}

auth();

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$current_password = $data["current_password"] ?? "";
$new_password = $data["new_password"] ?? "";

$user_id = $_SESSION["user_id"];

// Validate name and email
if ($name === "" || $email === "") {
    out([
        "success" => false,
        "message" => "Name and email are required."
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out([
        "success" => false,
        "message" => "Please enter a valid email address."
    ], 400);
}

// Check whether another user already has this email
$check = $conn->prepare(
    "SELECT id FROM users WHERE email = ? AND id != ?"
);

$check->bind_param("si", $email, $user_id);
$check->execute();

if ($check->get_result()->num_rows > 0) {
    out([
        "success" => false,
        "message" => "This email address is already registered."
    ], 409);
}

$check->close();

// Get current password from database
$stmt = $conn->prepare(
    "SELECT password FROM users WHERE id = ?"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    out([
        "success" => false,
        "message" => "User account not found."
    ], 404);
}

// Update password only if a new password was entered
if ($new_password !== "") {

    if (strlen($new_password) < 8) {
        out([
            "success" => false,
            "message" => "New password must contain at least 8 characters."
        ], 400);
    }

    if (
        $current_password === "" ||
        !password_verify($current_password, $user["password"])
    ) {
        out([
            "success" => false,
            "message" => "Current password is incorrect."
        ], 400);
    }

    $hashed_password = password_hash(
        $new_password,
        PASSWORD_DEFAULT
    );

    $update = $conn->prepare(
        "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?"
    );

    $update->bind_param(
        "sssi",
        $name,
        $email,
        $hashed_password,
        $user_id
    );

} else {

    $update = $conn->prepare(
        "UPDATE users SET name = ?, email = ? WHERE id = ?"
    );

    $update->bind_param(
        "ssi",
        $name,
        $email,
        $user_id
    );
}

if (!$update->execute()) {
    out([
        "success" => false,
        "message" => "Unable to update profile."
    ], 500);
}

$update->close();

// Update session information
$_SESSION["user_name"] = $name;
$_SESSION["user_email"] = $email;

out([
    "success" => true,
    "message" => "Profile updated successfully.",
    "user" => [
        "id" => $user_id,
        "name" => $name,
        "email" => $email
    ]
]);

?>
