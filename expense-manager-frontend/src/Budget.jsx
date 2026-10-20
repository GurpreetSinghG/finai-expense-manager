
import { useEffect, useState } from "react";
import {
  getBudgets,
  getBudgetProgress,
  createBudget,
  updateBudget,
  deleteBudget,
} from "./api";
import "./Budget.css";

function currentPeriod() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

const initialPeriod = currentPeriod();

const emptyForm = {
  category: "Groceries",
  monthlyLimit: "",
  year: initialPeriod.year,
  month: initialPeriod.month,
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));

export default function Budget({ onBackToDashboard }) {
  const [budgets, setBudgets] = useState([]);
  const [progress, setProgress] = useState([]);

  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [viewYear, setViewYear] = useState(initialPeriod.year);
  const [viewMonth, setViewMonth] = useState(initialPeriod.month);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refreshBudgets() {
    setIsLoading(true);
    setError("");

    try {
      const [budgetData, progressData] = await Promise.all([
        getBudgets(),
        getBudgetProgress(viewYear, viewMonth),
      ]);

      setBudgets(Array.isArray(budgetData) ? budgetData : []);
      setProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      setError(err.message || "Unable to load budgets.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshBudgets();
    // Reload when the displayed year or month changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      ...emptyForm,
      year: viewYear,
      month: viewMonth,
    });
    setEditingId(null);
  }

  function handleEdit(budget) {
    setFormData({
      category: budget.category,
      monthlyLimit: String(budget.monthlyLimit),
      year: budget.year,
      month: budget.month,
    });

    setEditingId(budget.id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const monthlyLimit = Number(formData.monthlyLimit);
    const year = Number(formData.year);
    const month = Number(formData.month);

    if (
      !formData.category.trim() ||
      !Number.isFinite(monthlyLimit) ||
      monthlyLimit <= 0 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      setError("Enter a valid category, positive limit, year, and month.");
      return;
    }

    const payload = {
      category: formData.category.trim(),
      monthlyLimit,
      year,
      month,
    };

    setIsSaving(true);

    try {
      if (editingId !== null) {
        await updateBudget(editingId, payload);
        setMessage("Budget updated successfully.");
      } else {
        await createBudget(payload);
        setMessage("Budget created successfully.");
      }

      setViewYear(year);
      setViewMonth(month);
      resetForm();

      // Refresh immediately using the period just saved.
      const [budgetData, progressData] = await Promise.all([
        getBudgets(),
        getBudgetProgress(year, month),
      ]);

      setBudgets(Array.isArray(budgetData) ? budgetData : []);
      setProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      setError(err.message || "Unable to save budget.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteBudget(id);
      setMessage("Budget deleted successfully.");
      await refreshBudgets();
    } catch (err) {
      setError(err.message || "Unable to delete budget.");
    }
  }

  const progressByBudgetId = new Map(
    progress.map((item) => [item.budgetId, item])
  );

  const displayedBudgets = budgets.filter(
    (budget) =>
      budget.year === viewYear &&
      budget.month === viewMonth
  );

  return (
    <main className="budget-page">
      <header className="budget-header">
        <div>
          <p className="muted">FINAI / PERSONAL FINANCE</p>
          <h1>Monthly Budgets</h1>
          <p className="muted">
            Set spending limits and track your progress.
          </p>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={onBackToDashboard}
        >
          ← Dashboard
        </button>
      </header>

      <section className="panel budget-panel">
        <h2>{editingId !== null ? "Edit Budget" : "Create Budget"}</h2>

        <form onSubmit={handleSubmit} className="budget-form">
          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Groceries">Groceries</option>
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Transport">Transport</option>
              <option value="Fitness">Fitness</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Shopping">Shopping</option>
              <option value="Rent">Rent</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Monthly limit (₹)
            <input
              name="monthlyLimit"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.monthlyLimit}
              onChange={handleChange}
              placeholder="5000"
              required
            />
          </label>

          <label>
            Year
            <input
              name="year"
              type="number"
              min="2000"
              max="9999"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Month
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
            >
              {[
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December",
              ].map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="login-error budget-message" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="income budget-message" role="status">
              {message}
            </p>
          )}

          <div className="budget-form-actions">
            <button
              className="add-button"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingId !== null
                  ? "Update Budget"
                  : "Create Budget"}
            </button>

            {editingId !== null && (
              <button
                className="text-button"
                type="button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel budget-panel">
        <div className="budget-list-header">
          <div>
            <h2>Spending Progress</h2>
            <p className="muted">
              Actual debit transactions compared with your limits.
            </p>
          </div>
        </div>

        <div className="budget-period">
          <label>
            Year
            <input
              type="number"
              min="2000"
              value={viewYear}
              onChange={(event) =>
                setViewYear(Number(event.target.value))
              }
            />
          </label>

          <label>
            Month
            <select
              value={viewMonth}
              onChange={(event) =>
                setViewMonth(Number(event.target.value))
              }
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2000, index, 1).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && <p className="muted">Loading budgets...</p>}

        {!isLoading && displayedBudgets.length === 0 && (
          <p className="muted">
            No budgets found for this month. Create one above to get started.
          </p>
        )}

        <div className="budget-list">
          {displayedBudgets.map((budget) => {
            const item = progressByBudgetId.get(budget.id);
            const spent = Number(item?.amountSpent ?? 0);
            const limit = Number(budget.monthlyLimit);
            const remaining = Number(
              item?.amountRemaining ?? limit
            );
            const percentage = Number(item?.percentageUsed ?? 0);
            const barWidth = Math.min(Math.max(percentage, 0), 100);

            return (
              <article className="budget-item" key={budget.id}>
                <div className="budget-item-top">
                  <div>
                    <h3>{budget.category}</h3>
                    <p className="muted">
                      {currency(spent)} spent of {currency(limit)}
                    </p>
                  </div>

                  <span
                    className={
                      percentage >= 100
                        ? "budget-status over-budget"
                        : "budget-status"
                    }
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div
                  className="budget-progress-track"
                  role="progressbar"
                  aria-valuenow={Math.max(0, percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${budget.category} budget used`}
                >
                  <div
                    className={
                      percentage >= 100
                        ? "budget-progress-fill over-budget-fill"
                        : "budget-progress-fill"
                    }
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="budget-item-bottom">
                  <span className={remaining < 0 ? "expense" : "muted"}>
                    {remaining < 0
                      ? `${currency(Math.abs(remaining))} over budget`
                      : `${currency(remaining)} remaining`}
                  </span>

                  <div className="budget-actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => handleEdit(budget)}
                    >
                      Edit
                    </button>

                    <button
                      className="budget-delete-button"
                      type="button"
                      onClick={() => handleDelete(budget.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
