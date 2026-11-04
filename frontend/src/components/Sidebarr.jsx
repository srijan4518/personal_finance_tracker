
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  LogOut
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost/Personal-Finance-Tracker-React/backend/api/logout.php",
        {
          method: "POST",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed.");
      }

      navigate("/login");
    } catch (error) {
      alert(error.message || "Unable to logout. Please try again.");
    }
  };

  return (
    <aside className="sidebar">

      <div className="logo">
        <Wallet size={28} />
        <h2>FinanceTrack</h2>
      </div>

      <p className="menu-title">MAIN MENU</p>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className="menu-link">
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/income" className="menu-link">
          <TrendingUp size={20} />
          Income
        </NavLink>

        <NavLink to="/expenses" className="menu-link">
          <TrendingDown size={20} />
          Expenses
        </NavLink>

        <NavLink to="/transactions" className="menu-link">
          <ArrowLeftRight size={20} />
          Transactions
        </NavLink>

        <NavLink to="/reports" className="menu-link">
          <ChartNoAxesCombined size={20} />
          Reports
        </NavLink>

        <NavLink to="/budget" className="menu-link">
          <Wallet size={20} />
          Budget
        </NavLink>

      </nav>

      <div className="sidebar-bottom">
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
