

<?php

require_once "../includes/auth.php";

auth();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "success" => false,
        "message" => "POST method required."
    ], 405);
}

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

$amount = $data["amount"] ?? "";

if (!is_numeric($amount) || (float)$amount <= 0) {
    out([
        "success" => false,
        "message" => "Please enter a valid budget amount."
    ], 400);
}

$amount = (float)$amount;
$userId = (int)$_SESSION["user_id"];
$month = (int)date("n");
$year = (int)date("Y");
$category = "Overall";

// Check whether this month's budget already exists
$checkStmt = $conn->prepare(
    "SELECT id FROM budgets
     WHERE user_id = ?
     AND category = ?
     AND month = ?
     AND year = ?
     LIMIT 1"
);

if (!$checkStmt) {
    out([
        "success" => false,
        "message" => "Unable to check existing budget."
    ], 500);
}

$checkStmt->bind_param(
    "isii",
    $userId,
    $category,
    $month,
    $year
);

if (!$checkStmt->execute()) {
    out([
        "success" => false,
        "message" => "Unable to check existing budget."
    ], 500);
}

$checkStmt->bind_result($budgetId);
$exists = $checkStmt->fetch();
$checkStmt->close();

if ($exists) {

    // Update existing budget
    $updateStmt = $conn->prepare(
        "UPDATE budgets
         SET amount = ?
         WHERE id = ? AND user_id = ?"
    );

    if (!$updateStmt) {
        out([
            "success" => false,
            "message" => "Unable to prepare budget update."
        ], 500);
    }

    $updateStmt->bind_param(
        "dii",
        $amount,
        $budgetId,
        $userId
    );

    $success = $updateStmt->execute();
    $updateStmt->close();

} else {

    // Insert new budget
    $insertStmt = $conn->prepare(
        "INSERT INTO budgets
         (user_id, category, amount, month, year)
         VALUES (?, ?, ?, ?, ?)"
    );

    if (!$insertStmt) {
        out([
            "success" => false,
            "message" => "Unable to prepare budget insert."
        ], 500);
    }

    $insertStmt->bind_param(
        "isdii",
        $userId,
        $category,
        $amount,
        $month,
        $year
    );

    $success = $insertStmt->execute();
    $insertStmt->close();
}

if ($success) {
    out([
        "success" => true,
        "message" => "Monthly budget saved successfully.",
        "budget" => $amount,
        "month" => $month,
        "year" => $year
    ]);
}

out([
    "success" => false,
    "message" => "Unable to save budget."
], 500);

?>
