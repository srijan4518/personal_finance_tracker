
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";
import SummaryCard from "../components/SummaryCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    monthly_budget: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          userResponse,
          summaryResponse,
          transactionResponse
        ] = await Promise.all([
          fetch(`${API_URL}/me.php`, {
            credentials: "include"
          }),

          fetch(`${API_URL}/summary.php`, {
            credentials: "include"
          }),

          fetch(`${API_URL}/transactions.php`, {
            credentials: "include"
          })
        ]);

        const userData = await userResponse.json();
        const summaryData = await summaryResponse.json();
        const transactionData = await transactionResponse.json();

        if (!userResponse.ok || !userData.success) {
          throw new Error("Please log in again.");
        }

        if (!summaryResponse.ok || !summaryData.success) {
          throw new Error(summaryData.message || "Unable to load summary.");
        }

        if (!transactionResponse.ok || !transactionData.success) {
          throw new Error(transactionData.message || "Unable to load transactions.");
        }

        setUserName(userData.user.name);
        setSummary(summaryData.summary);

        setMonthlyData(summaryData.monthly_data || []);

        setTransactions(
          transactionData.transactions.map(item => ({
            ...item,
            type: item.type.toLowerCase()
          }))
        );

      } catch (error) {
        console.error("Dashboard error:", error);
        alert(error.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalIncome = Number(summary.total_income);
  const totalExpense = Number(summary.total_expense);
  const balance = Number(summary.balance);
  const budget = Number(summary.monthly_budget);

  // Prepare expense category data
  const categoryTotals = {};

  transactions.forEach(item => {
    if (item.type === "expense") {
      const category = item.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(item.amount);
    }
  });

  const categoryData = {
    labels: Object.keys(categoryTotals),

    datasets: [{
      data: Object.values(categoryTotals),

      backgroundColor: [
        "#6366f1",
        "#f59e0b",
        "#06b6d4",
        "#ec4899",
        "#16a34a",
        "#8b5cf6",
        "#ef4444"
      ]
    }]
  };

  // Prepare real monthly income and expense data

// Prepare graph using only months with transactions
const monthlyLabels = monthlyData.map(item => item.month);

const incomeValues = monthlyData.map(item =>
  Number(item.income)
);

const expenseValues = monthlyData.map(item =>
  Number(item.expense)
);

const chartData = {
  labels: monthlyLabels,

  datasets: [
    {
      label: "Income",
      data: incomeValues,
      backgroundColor: "#16a34a",
      borderRadius: 6
    },
    {
      label: "Expenses",
      data: expenseValues,
      backgroundColor: "#ef4444",
      borderRadius: 6
    }
  ]
};


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,

    plugins: {
      legend: {
        position: "top"
      },

      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${Number(
              context.raw
            ).toLocaleString("en-IN")}`;
          }
        }
      }
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          callback: function(value) {
            return "₹" + Number(value).toLocaleString("en-IN");
          }
        }
      }
    }
  };

  return (
    <div className="dashboard">

      {/* Dashboard Heading */}
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            {loading
              ? "Loading your account..."
              : `Welcome back, ${userName}! Here's your financial overview.`}
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/add-transaction")}
        >
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">

        <SummaryCard
          title="Total Income"
          amount={totalIncome}
          icon={<TrendingUp />}
          color="green"
          description="Your total earnings"
        />

        <SummaryCard
          title="Total Expenses"
          amount={totalExpense}
          icon={<TrendingDown />}
          color="red"
          description="Your total spending"
        />

        <SummaryCard
          title="Current Balance"
          amount={balance}
          icon={<Wallet />}
          color="blue"
          description="Available balance"
        />

        <SummaryCard
          title="Monthly Budget"
          amount={budget}
          icon={<PiggyBank />}
          color="orange"
          description="Your spending limit"
        />

      </div>

      {/* Charts */}
      <div className="charts-grid">

        <div className="chart-card">
          <h3>Income vs Expenses</h3>

          {loading ? (
            <p>Loading chart...</p>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>

        <div className="chart-card">
          <h3>Expense Categories</h3>

          {loading ? (
            <p>Loading chart...</p>
          ) : Object.keys(categoryTotals).length > 0 ? (
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: true
              }}
            />
          ) : (
            <p>No expense data available yet.</p>
          )}

        </div>

      </div>

      {/* Recent Transactions */}
      <div className="transactions-card">

        <h3>Recent Transactions</h3>

        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="5">Loading transactions...</td>
                </tr>
              ) : transactions.length > 0 ? (

                transactions.slice(0, 5).map(item => (

                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>

                    <td>
                      <span
                        className={
                          item.type === "income"
                            ? "income-label"
                            : "expense-label"
                        }
                      >
                        {item.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>

                    <td>
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="5">No transactions found.</td>
                </tr>

              )}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
