

<?php

require_once __DIR__ . "/../includes/auth.php";

// Check login
auth();

// Only allow GET requests
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    out([
        "success" => false,
        "message" => "GET method required."
    ], 405);
}

// Logged-in user's ID
$userId = (int) $_SESSION["user_id"];

// Fetch this user's transactions
$sql = "
    SELECT
        id,
        title,
        amount,
        type,
        category,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS date
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    out([
        "success" => false,
        "message" => "Unable to fetch transactions."
    ], 500);
}

$stmt->bind_param("i", $userId);
$stmt->execute();

$result = $stmt->get_result();

$transactions = [];

while ($row = $result->fetch_assoc()) {

    $row["id"] = (int) $row["id"];
    $row["amount"] = (float) $row["amount"];

    $transactions[] = $row;
}

$stmt->close();

out([
    "success" => true,
    "count" => count($transactions),
    "transactions" => $transactions
]);

?>
