
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import "./AddTransaction.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function AddTransaction() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const incomeCategories = [
    "Salary", "Business", "Investment", "Freelancing", "Other"
  ];

  const expenseCategories = [
    "Food", "Transport", "Shopping", "Bills",
    "Education", "Healthcare", "Entertainment", "Other"
  ];

  const categories =
    type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim() || !amount || !category) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (Number(amount) <= 0) {
      setMessage("Please enter an amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/add_transaction.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          type,
          category
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add transaction.");
      }

      alert("Transaction added successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Add transaction error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-page">
      <div className="add-transaction-card">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="transaction-heading">
          <Wallet size={30} />
          <div>
            <h2>Add Transaction</h2>
            <p>Record your income or expenses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Transaction Type</label>

          <div className="transaction-type-buttons">
            <button
              type="button"
              className={type === "income" ? "type-button income active" : "type-button income"}
              onClick={() => {
                setType("income");
                setCategory("");
              }}
            >
              Income
            </button>

            <button
              type="button"
              className={type === "expense" ? "type-button expense active" : "type-button expense"}
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
            >
              Expense
            </button>
          </div>

          <label htmlFor="transaction-title">Transaction Title</label>
          <input
            id="transaction-title"
            type="text"
            placeholder="Example: Monthly Salary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="transaction-amount">Amount (₹)</label>
          <input
            id="transaction-amount"
            type="number"
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label htmlFor="transaction-category">Category</label>
          <select
            id="transaction-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {message && (
            <p className="transaction-error">{message}</p>
          )}

          <button
            type="submit"
            className="save-transaction-button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Transaction"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddTransaction;
