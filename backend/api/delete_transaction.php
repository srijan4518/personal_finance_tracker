
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

$transactionId = filter_var(
    $data["id"] ?? null,
    FILTER_VALIDATE_INT
);

if (!$transactionId || $transactionId <= 0) {
    out([
        "success" => false,
        "message" => "Invalid transaction ID."
    ], 400);
}

$userId = $_SESSION["user_id"];

$stmt = $conn->prepare(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?"
);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Unable to prepare delete request."
    ], 500);
}

$stmt->bind_param("ii", $transactionId, $userId);

if (!$stmt->execute()) {
    error_log("Delete transaction error: " . $stmt->error);

    out([
        "success" => false,
        "message" => "Unable to delete transaction."
    ], 500);
}

if ($stmt->affected_rows === 0) {
    out([
        "success" => false,
        "message" => "Transaction not found."
    ], 404);
}

out([
    "success" => true,
    "message" => "Transaction deleted successfully."
]);

?>
