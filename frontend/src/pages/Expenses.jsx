
import { useEffect, useState } from "react";
import { TrendingDown, PlusCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Expenses.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load expenses.");
        }

        setExpenses(
          (data.transactions || []).filter(
            item => item.type === "expense"
          )
        );
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const formatCurrency = amount =>
    `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  if (loading) {
    return <div className="expenses-page">Loading expenses...</div>;
  }

  return (
    <div className="expenses-page">

      <div className="expenses-heading">
        <div>
          <h1>Expense Management</h1>
          <p>Track and manage all your spending records.</p>
        </div>

        <TrendingDown size={32} />
      </div>

      {/* Total Expenses */}

      <div className="expenses-summary-card">
        <Wallet size={28} />

        <div>
          <h3>Total Expenses</h3>
          <h2>{formatCurrency(totalExpenses)}</h2>
        </div>
      </div>

      {/* Expense History */}

      <div className="expenses-list-card">

        <div className="expenses-list-heading">
          <div>
            <h2>Expense History</h2>
            <p>Your recorded expense transactions.</p>
          </div>

          <button
            className="expenses-add-btn"
            onClick={() => navigate("/add-transaction")}
          >
            <PlusCircle size={18} />
            Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="expenses-empty">
            <Wallet size={40} />
            <h3>No Expense Records</h3>
            <p>Add your first expense transaction to get started.</p>
          </div>
        ) : (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">

              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>
                    <td className="expenses-amount">
                      - {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default Expenses;
