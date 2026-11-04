
import { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Sidebar from "./components/Sidebarr";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddTransaction from "./pages/AddTransaction";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";

import "./App.css";

const API_URL =
  "http://localhost/Personal-Finance-Tracker-React/backend/api";

// Protect all application pages
function ProtectedLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${API_URL}/me.php`, {
          method: "GET",
          credentials: "include"
        });

        const data = await response.json();

        setIsAuthenticated(response.ok && data.success === true);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkLogin();
  }, []);

  // Wait until PHP checks the session
  if (checkingAuth) {
    return <div className="auth-loading">Checking login...</div>;
  }

  // Redirect users who are not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="page-content">

          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/add-transaction"
              element={<AddTransaction />}
            />

            <Route path="/transactions" element={<Transactions />} />

            <Route path="/budget" element={<Budget />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/income" element={<Income />} />

            <Route path="/expenses" element={<Expenses />} />
             <Route path="/profile" element={<Profile />} />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>

        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
