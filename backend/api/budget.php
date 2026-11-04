
<?php

require_once "../includes/auth.php";

auth();

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    out([
        "success" => false,
        "message" => "GET method required."
    ], 405);
}

$userId = $_SESSION["user_id"];

$currentMonth = (int) date("n");
$currentYear = (int) date("Y");

// Get current month's budget
$budgetStmt = $conn->prepare(
    "SELECT amount
     FROM budgets
     WHERE user_id = ?
     AND month = ?
     AND year = ?
     AND category = 'Overall'
     LIMIT 1"
);

if (!$budgetStmt) {
    out([
        "success" => false,
        "message" => "Unable to prepare budget query."
    ], 500);
}

$budgetStmt->bind_param(
    "iii",
    $userId,
    $currentMonth,
    $currentYear
);

$budgetStmt->execute();

$budgetResult = $budgetStmt->get_result();

$budget = 0;

if ($row = $budgetResult->fetch_assoc()) {
    $budget = (float) $row["amount"];
}

// Calculate current month's expenses
$spentStmt = $conn->prepare(
    "SELECT COALESCE(SUM(amount), 0) AS total_spent
     FROM transactions
     WHERE user_id = ?
     AND type = 'expense'
     AND MONTH(created_at) = ?
     AND YEAR(created_at) = ?"
);

if (!$spentStmt) {
    out([
        "success" => false,
        "message" => "Unable to prepare expense query."
    ], 500);
}

$spentStmt->bind_param(
    "iii",
    $userId,
    $currentMonth,
    $currentYear
);

$spentStmt->execute();

$spentResult = $spentStmt->get_result();
$spentRow = $spentResult->fetch_assoc();

$spent = (float) $spentRow["total_spent"];

// Send response
out([
    "success" => true,
    "budget" => $budget,
    "spent" => $spent,
    "remaining" => $budget - $spent,
    "month" => $currentMonth,
    "year" => $currentYear
]);

?>
