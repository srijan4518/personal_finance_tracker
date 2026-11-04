
<?php

// MySQL database connection

$host = "localhost";
$username = "root";
$password = ""; // Keep blank if your XAMPP MySQL root password is blank
$database = "personal_finance_tracker";

mysqli_report(MYSQLI_REPORT_OFF);

$conn = new mysqli(
    $host,
    $username,
    $password,
    $database
);

if ($conn->connect_error) {
    error_log("Database connection error: " . $conn->connect_error);

    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Check your database settings."
    ]);

    exit;
}

$conn->set_charset("utf8mb4");

?>
