
import { useCallback, useEffect, useState } from "react";
import { Wallet, Target, TrendingUp, AlertTriangle } from "lucide-react";
import "./Budget.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Budget() {
  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [newBudget, setNewBudget] = useState("");
  const [loading, setLoading] = useState(true);

  const remaining = budget - spent;
  const percentage =
    budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const fetchBudget = useCallback(async () => {
    const response = await fetch(`${API_URL}/budget.php`, {
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load budget.");
    }

    return data;
  }, []);

  const applyBudget = (data) => {
    setBudget(Number(data.budget || 0));
    setSpent(Number(data.spent || 0));
    setNewBudget(data.budget || "");
  };

  useEffect(() => {
    let active = true;

    const loadBudget = async () => {
      try {
        const data = await fetchBudget();
        if (active) applyBudget(data);
      } catch (error) {
        if (active) {
          console.error(error);
          alert(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBudget();
    return () => {
      active = false;
    };
  }, [fetchBudget]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();

    if (!newBudget || Number(newBudget) <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/save_budget.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: newBudget
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save budget.");
      }

      alert("Monthly budget saved successfully!");
      const updatedBudget = await fetchBudget();
      applyBudget(updatedBudget);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="budget-page">Loading budget...</div>;
  }

  return (
    <div className="budget-page">

      <div className="budget-heading">
        <div>
          <h1>Budget Management</h1>
          <p>Plan your monthly spending and manage your money.</p>
        </div>
        <Wallet size={30} />
      </div>

      <div className="budget-cards">

        <div className="budget-card">
          <Target size={25} />
          <h3>Monthly Budget</h3>
          <h2>₹{budget.toLocaleString("en-IN")}</h2>
        </div>

        <div className="budget-card">
          <TrendingUp size={25} />
          <h3>Total Spent</h3>
          <h2>₹{spent.toLocaleString("en-IN")}</h2>
        </div>

        <div className="budget-card">
          <Wallet size={25} />
          <h3>Remaining Budget</h3>
          <h2 className={remaining < 0 ? "over-budget" : ""}>
            ₹{remaining.toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      <div className="budget-content">

        <div className="budget-form-card">
          <h2>Set Monthly Budget</h2>
          <p>Enter your spending limit for this month.</p>

          <form onSubmit={handleSaveBudget}>
            <label>Budget Amount (₹)</label>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter monthly budget"
              value={newBudget}
              onChange={e => setNewBudget(e.target.value)}
              required
            />

            <button type="submit">
              Save Budget
            </button>
          </form>
        </div>

        <div className="budget-progress-card">
          <h2>Budget Overview</h2>

          <div className="budget-progress-info">
            <span>Monthly Spending</span>
            <strong>{percentage.toFixed(1)}%</strong>
          </div>

          <div className="budget-progress-bar">
            <div
              className={
                percentage >= 100
                  ? "budget-progress-fill exceeded"
                  : percentage >= 80
                  ? "budget-progress-fill warning"
                  : "budget-progress-fill"
              }
              style={{ width: `${percentage}%` }}
            />
          </div>
{budget === 0 ? (
  <p>Please set your monthly budget first.</p>
) : spent >= budget ? (
  <div className="budget-alert exceeded-alert">
    <AlertTriangle size={20} />
    <div>
      <strong>Budget Exceeded!</strong>
      <p>
        You have spent ₹{(spent - budget).toLocaleString("en-IN")} 
        above your monthly budget.
      </p>
    </div>
  </div>
) : percentage >= 80 ? (
  <div className="budget-alert warning-alert">
    <AlertTriangle size={20} />
    <div>
      <strong>Budget Warning!</strong>
      <p>
        You have used {percentage.toFixed(1)}% of your monthly budget.
        Only ₹{remaining.toLocaleString("en-IN")} remains.
      </p>
    </div>
  </div>
) : (
  <p className="budget-success">
    Your spending is within your budget. Keep it up!
  </p>
)}

        </div>

      </div>

    </div>
  );
}

export default Budget;
