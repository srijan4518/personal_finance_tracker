
import { useEffect, useState } from "react";
import { TrendingUp, PlusCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Income.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Income() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load income.");
        }

        setIncome(
          (data.transactions || []).filter(
            item => item.type === "income"
          )
        );
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  const totalIncome = income.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const formatCurrency = amount =>
    `₹${Number(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  if (loading) {
    return <div className="income-page">Loading income...</div>;
  }

  return (
    <div className="income-page">

      <div className="income-heading">
        <div>
          <h1>Income Management</h1>
          <p>Manage and track all your income records.</p>
        </div>

        <TrendingUp size={32} />
      </div>

      <div className="income-summary-card">
        <Wallet size={28} />
        <div>
          <h3>Total Income</h3>
          <h2>{formatCurrency(totalIncome)}</h2>
        </div>
      </div>

      <div className="income-list-card">

        <div className="income-list-heading">
          <div>
            <h2>Income History</h2>
            <p>Your recorded income transactions.</p>
          </div>

          <button
            className="income-add-btn"
            onClick={() => navigate("/add-transaction")}
          >
            <PlusCircle size={18} />
            Add Income
          </button>
        </div>

        {income.length === 0 ? (
          <div className="income-empty">
            <Wallet size={40} />
            <h3>No Income Records</h3>
            <p>Add your first income transaction to get started.</p>
          </div>
        ) : (
          <div className="income-table-wrapper">
            <table className="income-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {income.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>
                    <td className="income-amount">
                      + {formatCurrency(item.amount)}
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

export default Income;
