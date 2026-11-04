
import { useState, useEffect } from "react";

import {
  Bell,
  UserCircle,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [budgetAlert, setBudgetAlert] = useState(null);

  const navigate = useNavigate();

  // Fetch and update budget notifications
  useEffect(() => {
    let active = true;

    const fetchBudgetAlert = async () => {
      try {
        const response = await fetch(`${API_URL}/budget.php`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          return;
        }

        if (!active) return;

        const budget = Number(data.budget || 0);
        const spent = Number(data.spent || 0);

        if (budget <= 0) {
          setBudgetAlert(null);
          return;
        }

        const percentage = (spent / budget) * 100;

        if (percentage >= 100) {
          setBudgetAlert({
            type: "exceeded",
            title: "Budget Exceeded!",
            message: `You have spent ₹${(spent - budget).toLocaleString("en-IN")} above your monthly budget.`
          });
        } else if (percentage >= 80) {
          setBudgetAlert({
            type: "warning",
            title: "Budget Warning!",
            message: `You have used ${percentage.toFixed(1)}% of your monthly budget. Only ₹${(budget - spent).toLocaleString("en-IN")} remains.`
          });
        } else {
          setBudgetAlert(null);
        }

      } catch (error) {
        console.error("Budget notification error:", error);
      }
    };

    // Fetch immediately
    fetchBudgetAlert();

    // Automatically check every 3 seconds
    const interval = setInterval(fetchBudgetAlert, 3000);

    // Fetch again when returning to the browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBudgetAlert();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      active = false;
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch(`${API_URL}/logout.php`, {
        method: "POST",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed.");
      }

      setShowMenu(false);
      navigate("/login");

    } catch (error) {
      alert(error.message || "Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="navbar">

      {/* Navbar Heading */}
      <div>
        <h2>Personal Finance Tracker</h2>
        <p>Manage your money smartly</p>
      </div>

      <div className="navbar-right">

        {/* Notification Section */}
        <div className="notification-wrapper">

          <button
            className="notification-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowMenu(false);
            }}
          >
            <Bell size={21} />

            {budgetAlert && (
              <span className="notification-dot"></span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-header">
                <h3>Notifications</h3>
              </div>

              <div className="notification-content">

                {budgetAlert ? (
                  <div
                    className={`notification-alert ${budgetAlert.type}`}
                  >
                    <AlertTriangle size={22} />

                    <div>
                      <strong>{budgetAlert.title}</strong>
                      <p>{budgetAlert.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="no-notifications">
                    <CheckCircle size={25} />
                    <p>
                      No budget alerts. Your spending is under control!
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* My Account Section */}
        <div className="account-wrapper">

          <button
            className={`account-button ${showMenu ? "active" : ""}`}
            onClick={() => {
              setShowMenu(!showMenu);
              setShowNotifications(false);
            }}
          >
            <div className="account-avatar">
              <UserCircle size={27} />
            </div>

            <div className="account-info">
              <strong>My Account</strong>
              <span>Welcome!</span>
            </div>

            <ChevronDown
              size={17}
              className={showMenu ? "rotate-icon" : ""}
            />
          </button>

          {showMenu && (
            <div className="account-dropdown">

              <div className="dropdown-header">

                <div className="dropdown-avatar">
                  <UserCircle size={35} />
                </div>

                <div>
                  <h3>My Account</h3>
                  <p>Manage your account</p>
                </div>

              </div>

              <div className="dropdown-menu">

                <button onClick={() => {
                  setShowMenu(false);
                  navigate("/login");
                }}>
                  <LogIn size={19} />
                  <span>Login</span>
                </button>

                <button onClick={() => {
                  setShowMenu(false);
                  navigate("/register");
                }}>
                  <UserPlus size={19} />
                  <span>Create Account</span>
                </button>

                <button onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}>
                  <User size={19} />
                  <span>My Profile</span>
                </button>

                <button onClick={() => {
                  setShowMenu(false);
                  alert("Settings page coming soon!");
                }}>
                  <Settings size={19} />
                  <span>Settings</span>
                </button>

              </div>

              <div className="dropdown-footer">

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={19} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;
