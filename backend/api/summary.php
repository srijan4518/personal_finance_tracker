
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

$summaryQuery = "
    SELECT
        COALESCE(SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
    FROM transactions
    WHERE user_id = ?
";

$stmt = $conn->prepare($summaryQuery);
$stmt->bind_param("i", $userId);
$stmt->execute();

$summaryResult = $stmt->get_result()->fetch_assoc();

$totalIncome = (float)$summaryResult["total_income"];
$totalExpense = (float)$summaryResult["total_expense"];

// Current month's budget
$currentMonth = date("m");
$currentYear = date("Y");

$budgetStmt = $conn->prepare("
    SELECT COALESCE(SUM(amount), 0) AS monthly_budget
    FROM budgets
    WHERE user_id = ? AND month = ? AND year = ?
");

$budgetStmt->bind_param("iii", $userId, $currentMonth, $currentYear);
$budgetStmt->execute();

$budgetResult = $budgetStmt->get_result()->fetch_assoc();

// Last six months' income and expenses
$chartStmt = $conn->prepare("
    SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month_key,
        DATE_FORMAT(created_at, '%b %Y') AS month_name,
        SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END) AS expense
    FROM transactions
    WHERE user_id = ?
      AND created_at >= DATE_FORMAT(
          DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01'
      )
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month_key ASC
");

$chartStmt->bind_param("i", $userId);
$chartStmt->execute();

$chartResult = $chartStmt->get_result();

$monthlyData = [];

while ($row = $chartResult->fetch_assoc()) {
    $monthlyData[] = [
        "month" => $row["month_name"],
        "income" => (float)$row["income"],
        "expense" => (float)$row["expense"]
    ];
}

out([
    "success" => true,
    "summary" => [
        "total_income" => $totalIncome,
        "total_expense" => $totalExpense,
        "balance" => $totalIncome - $totalExpense,
        "monthly_budget" => (float)$budgetResult["monthly_budget"]
    ],
    "monthly_data" => $monthlyData
]);

?>
