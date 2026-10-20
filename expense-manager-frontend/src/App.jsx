import { useState } from "react";
import "./App.css";
import Login from "./Login";
import CreateUser from "./CreateUser";
import Logout from "./Logout";
import Budget from "./Budget";
import SavingsGoals from "./SavingsGoals";
import Investment from "./Investment";
import DashboardStats from "./components/DashboardStats";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import { useTransactions } from "./hooks/useTransactions";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem("finai_access_token"))
  );
  const [authView, setAuthView] = useState("login");

  const [activePage, setActivePage] = useState("dashboard");

  const finance = useTransactions(isAuthenticated);

  function handleLogout() {
    sessionStorage.removeItem("finai_access_token");
    sessionStorage.removeItem("finai_user");
    finance.resetTransactions();
    setAuthView("login");
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    if (authView === "register") {
      return <CreateUser onBackToLogin={() => setAuthView("login")} />;
    }

    return (
      <Login
        onLoginSuccess={() => setIsAuthenticated(true)}
        onCreateAccount={() => setAuthView("register")}
      />
    );
  }
  if (activePage === "budgets") {
  return (
    <Budget onBackToDashboard={() => setActivePage("dashboard")} />
  );
}
if (activePage === "goals") {
  return (
    <SavingsGoals
      onBackToDashboard={() => setActivePage("dashboard")}
    />
  );

}

if (activePage === "investments") {
  return (
    <Investment
      onBackToDashboard={() => setActivePage("dashboard")}
    />
  );
}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="brand">Fin<span>AI</span></h2>
        <p className="menu-label">WORKSPACE</p>
        <nav>
          <a className="nav-link active" href="#dashboard">◫ Dashboard</a>
          <a className="nav-link" href="#transactions">↔ Transactions</a>
         
          <a
            className={`nav-link ${activePage === "budgets" ? "active" : ""}`}
            href="#budgets"
            onClick={(event) => {
            event.preventDefault();
            setActivePage("budgets");
            }}
          >
            ◷ Budgets
          </a>

          
        <a
            className={`nav-link ${activePage === "goals" ? "active" : ""}`}
            href="#goals"
            onClick={(event) => {
            event.preventDefault();
            setActivePage("goals");
            }}
          >
            ✧ Savings Goals
        
        </a>

        
        <a
          className={`nav-link ${activePage === "investments" ? "active" : ""}`}
          href="#investments"
          onClick={(event) => {
          event.preventDefault();
          setActivePage("investments");
          }}
        >
          ↗ Investments
        </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="avatar">G</div>
            <div>
              <strong>My Account</strong>
              <p className="muted">Personal Finance</p>
            </div>
          </div>
          <Logout onLogout={handleLogout} />
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="muted">PERSONAL FINANCE / OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>
          <button className="date-button" type="button">
            {new Intl.DateTimeFormat("en-IN", {
              month: "long",
              year: "numeric",
            }).format(new Date())} ▾
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="muted">YOUR MONEY, MADE CLEAR</p>
            <h2>Welcome back 👋</h2>
            <p>Here's an overview of your finances.</p>
          </div>
          <div className="welcome-mark">₹</div>
        </section>

        <DashboardStats
          totalIncome={finance.totalIncome}
          totalExpenses={finance.totalExpenses}
          netCashFlow={finance.netCashFlow}
          savingsRate={finance.savingsRate}
          formatCurrency={finance.formatCurrency}
          isLoading={finance.isLoadingSummary}
          error={finance.summaryError}
        />

        <TransactionForm
          formData={finance.formData}
          onChange={finance.handleChange}
          onSubmit={finance.handleSubmit}
          isSaving={finance.isSavingTransaction}
          error={finance.transactionError}
          message={finance.transactionMessage}
        />

        <TransactionList
          transactions={finance.transactions}
          totalElements={finance.totalElements}
          isLoading={finance.isLoadingTransactions}
          isLoadingAll={finance.isLoadingAllTransactions}
          showAll={finance.showAllTransactions}
          error={finance.transactionError}
          onViewAll={finance.handleViewAllTransactions}
        />

        <p className="demo-note">Transactions are loaded from your FinAI backend.</p>
      </main>
    </div>
  );
}
