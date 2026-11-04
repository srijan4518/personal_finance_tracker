
import { useEffect, useState } from "react";
import { Search, Trash2, Pencil, ArrowLeftRight } from "lucide-react";
import "./Transactions.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load transactions.");
        }

        if (active) setTransactions(data.transactions);
      } catch (error) {
        if (active) {
          console.error(error);
          alert(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTransactions();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/delete_transaction.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete transaction.");
      }

      setTransactions(previous =>
        previous.filter(item => Number(item.id) !== Number(id))
      );

      alert("Transaction deleted successfully.");
    } catch (error) {
      alert(error.message);
    }
  };

  // Open Edit Popup
  const handleEdit = (item) => {
    setEditingTransaction(item);
    setEditTitle(item.title);
    setEditAmount(item.amount);
    setEditType(item.type.toLowerCase());
    setEditCategory(item.category);
  };

  // Update Transaction
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/update_transaction.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: editingTransaction.id,
          title: editTitle,
          amount: editAmount,
          type: editType,
          category: editCategory
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update transaction.");
      }

      setTransactions(previous =>
        previous.map(item =>
          Number(item.id) === Number(editingTransaction.id)
            ? {
                ...item,
                title: editTitle,
                amount: editAmount,
                type: editType,
                category: editCategory
              }
            : item
        )
      );

      setEditingTransaction(null);
      alert("Transaction updated successfully.");

    } catch (error) {
      alert(error.message);
    }
  };

  const filteredTransactions = transactions.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "all" ||
      item.type.toLowerCase() === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="transactions-page">

      <div className="transactions-heading">
        <div>
          <h1>Transaction History</h1>
          <p>View and manage all your income and expenses.</p>
        </div>

        <div className="transaction-heading-icon">
          <ArrowLeftRight size={28} />
        </div>
      </div>

      <div className="transaction-filters">

        <div className="transaction-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>

      </div>

      <div className="transactions-table-card">

        <div className="transactions-table-header">
          <h3>All Transactions</h3>
          <span>{filteredTransactions.length} Records</span>
        </div>

        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length > 0 ? (

                filteredTransactions.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>

                    <td>
                      <span
                        className={
                          item.type.toLowerCase() === "income"
                            ? "income-label"
                            : "expense-label"
                        }
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className={
                      item.type.toLowerCase() === "income"
                        ? "transaction-income-amount"
                        : "transaction-expense-amount"
                    }>
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <div className="transaction-actions">

                        <button
                          className="edit-transaction-button"
                          title="Edit transaction"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="delete-transaction-button"
                          title="Delete transaction"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))

              ) : (

                <tr>
                  <td colSpan="6">No transactions found.</td>
                </tr>

              )}

            </tbody>
          </table>

        </div>
      </div>

      {/* Edit Transaction Popup */}
      {editingTransaction && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">

            <h2>Edit Transaction</h2>

            <form onSubmit={handleUpdate}>

              <label>Transaction Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
              />

              <label>Amount (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                required
              />

              <label>Transaction Type</label>
              <select
                value={editType}
                onChange={e => {
                  setEditType(e.target.value);
                  setEditCategory("");
                }}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <label>Category</label>
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>

                {(editType === "income"
                  ? ["Salary", "Business", "Investment", "Other"]
                  : [
                      "Food",
                      "Transport",
                      "Shopping",
                      "Bills",
                      "Education",
                      "Health",
                      "Entertainment",
                      "Other"
                    ]
                ).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}

              </select>

              <div className="edit-modal-actions">

                <button type="submit" className="edit-save-btn">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={() => setEditingTransaction(null)}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Transactions;
