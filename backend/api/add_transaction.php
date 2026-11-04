
<?php

require_once "../includes/auth.php";

auth();

// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "POST method required."
    ], 405);
}

// Read JSON data
$data = json_decode(file_get_contents("php://input"), true);

$title = trim($data["title"] ?? "");
$amount = $data["amount"] ?? "";
$type = strtolower(trim($data["type"] ?? ""));
$category = trim($data["category"] ?? "");

// Validate input
if ($title === "" || $amount === "" || $type === "" || $category === "") {
    out([
        "success" => false,
        "message" => "Please fill in all fields."
    ], 400);
}

if (!is_numeric($amount) || (float)$amount <= 0) {
    out([
        "success" => false,
        "message" => "Please enter a valid amount."
    ], 400);
}

if (!in_array($type, ["income", "expense"], true)) {
    out([
        "success" => false,
        "message" => "Transaction type must be income or expense."
    ], 400);
}

// Save transaction for the logged-in user
$userId = $_SESSION["user_id"];

$stmt = $conn->prepare(
    "INSERT INTO transactions (user_id, title, amount, type, category)
     VALUES (?, ?, ?, ?, ?)"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Unable to prepare transaction."
    ], 500);
}

$amount = (float)$amount;

$stmt->bind_param(
    "isdss",
    $userId,
    $title,
    $amount,
    $type,
    $category
);

if ($stmt->execute()) {
    out([
        "success" => true,
        "message" => "Transaction added successfully.",
        "transaction_id" => $stmt->insert_id
    ], 201);
}

error_log("Transaction insert error: " . $stmt->error);

out([
    "success" => false,
    "message" => "Unable to save transaction."
], 500);

?>
