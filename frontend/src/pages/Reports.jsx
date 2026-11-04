
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  IndianRupee,
  BarChart3
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./Reports.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#8b5cf6",
  "#ec4899"
];

function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load transactions."
          );
        }

        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter transactions using the selected dates.
  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const date = String(item.date || "").slice(0, 10);

      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;

      return true;
    });
  }, [transactions, startDate, endDate]);

  // Calculate financial summary.
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(item => item.type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);

    const expense = filteredTransactions
      .filter(item => item.type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);

    return {
      total_income: income,
      total_expense: expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  // Monthly income and expense chart.
  const monthlyData = useMemo(() => {
    const months = {};

    filteredTransactions.forEach(item => {
      const date = String(item.date || "").slice(0, 10);

      if (!date) return;

      const monthKey = date.slice(0, 7);
      const monthLabel = new Date(
        Number(date.slice(0, 4)),
        Number(date.slice(5, 7)) - 1
      ).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric"
      });

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthLabel,
          income: 0,
          expense: 0
        };
      }

      if (item.type === "income") {
        months[monthKey].income += Number(item.amount);
      } else if (item.type === "expense") {
        months[monthKey].expense += Number(item.amount);
      }
    });

    return Object.keys(months)
      .sort()
      .map(key => months[key]);
  }, [filteredTransactions]);

  // Expense category breakdown.
  const expenseCategories = useMemo(() => {
    return filteredTransactions
      .filter(item => item.type === "expense")
      .reduce((result, item) => {
        const category = item.category || "Other";

        const existing = result.find(
          entry => entry.name === category
        );

        if (existing) {
          existing.value += Number(item.amount);
        } else {
          result.push({
            name: category,
            value: Number(item.amount)
          });
        }

        return result;
      }, []);
  }, [filteredTransactions]);

  const formatCurrency = amount =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return <div className="reports-page">Loading reports...</div>;
  }

  if (error) {
    return <div className="reports-page reports-error">{error}</div>;
  }

  return (
    <div className="reports-page">

      <div className="reports-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Understand your income, expenses and spending habits.</p>
        </div>
        <BarChart3 size={32} />
      </div>

      {/* Date Filter */}

      <div className="reports-filter-card">
        <div>
          <h2>Filter Reports</h2>
          <p>Select a date range to view your financial activity.</p>
        </div>

        <div className="reports-date-inputs">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={clearDates}
            className="clear-filter-btn"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Financial Summary */}

      <div className="report-summary-cards">

        <div className="report-card income-report">
          <TrendingUp size={25} />
          <h3>Total Income</h3>
          <h2>{formatCurrency(summary.total_income)}</h2>
        </div>

        <div className="report-card expense-report">
          <TrendingDown size={25} />
          <h3>Total Expenses</h3>
          <h2>{formatCurrency(summary.total_expense)}</h2>
        </div>

        <div className="report-card balance-report">
          <Wallet size={25} />
          <h3>Balance in Selected Period</h3>
          <h2>{formatCurrency(summary.balance)}</h2>
        </div>

      </div>

      {/* Monthly Income vs Expenses */}

      <div className="reports-chart-card">
        <h2>Monthly Income vs Expenses</h2>
        <p>Compare your income and expenses for the selected period.</p>

        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={value => formatCurrency(value)} />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#ef4444"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-report-data">
            No monthly data available for this period.
          </p>
        )}
      </div>

      {/* Expense Category Breakdown */}

      <div className="reports-chart-card">
        <h2>Expense Breakdown</h2>
        <p>See how much you spend in each category.</p>

        {expenseCategories.length > 0 ? (
          <div className="expense-chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-report-data">
            No expense records available for this period.
          </p>
        )}
      </div>

      {/* Financial Overview */}

      <div className="reports-overview">
        <div>
          <IndianRupee size={24} />
          <h3>Financial Overview</h3>
          <p>
            Your total income is{" "}
            <strong>{formatCurrency(summary.total_income)}</strong>
            {" "}and your total expenses are{" "}
            <strong>{formatCurrency(summary.total_expense)}</strong>.
          </p>
          <p>
            Your balance for the selected period is{" "}
            <strong>{formatCurrency(summary.balance)}</strong>.
          </p>
          <p>
            Transactions found:{" "}
            <strong>{filteredTransactions.length}</strong>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Reports;
