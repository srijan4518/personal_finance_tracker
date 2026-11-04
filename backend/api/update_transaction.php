
<?php

require_once "../includes/auth.php";

auth();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "POST method required."
    ], 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";
$title = trim($data["title"] ?? "");
$amount = $data["amount"] ?? "";
$type = strtolower(trim($data["type"] ?? ""));
$category = trim($data["category"] ?? "");

if (
    $id === "" ||
    $title === "" ||
    $amount === "" ||
    $type === "" ||
    $category === ""
) {
    out([
        "success" => false,
        "message" => "Please fill in all fields."
    ], 400);
}

if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {
    out([
        "success" => false,
        "message" => "Invalid transaction ID."
    ], 400);
}

if (!is_numeric($amount) || (float)$amount <= 0) {
    out([
        "success" => false,
        "message" => "Enter a valid amount."
    ], 400);
}

if (!in_array($type, ["income", "expense"], true)) {
    out([
        "success" => false,
        "message" => "Invalid transaction type."
    ], 400);
}

$userId = $_SESSION["user_id"];

$stmt = $conn->prepare(
    "UPDATE transactions
     SET title = ?, amount = ?, type = ?, category = ?
     WHERE id = ? AND user_id = ?"
);

$stmt->bind_param(
    "sdssii",
    $title,
    $amount,
    $type,
    $category,
    $id,
    $userId
);

if ($stmt->execute()) {
    if ($stmt->affected_rows >= 0) {
        out([
            "success" => true,
            "message" => "Transaction updated successfully."
        ]);
    }
}

out([
    "success" => false,
    "message" => "Unable to update transaction."
], 500);

?>