
import { useEffect, useState } from "react";
import {
  getFinancialGoals,
  createFinancialGoal,
  updateFinancialGoal,
  deleteFinancialGoal,
} from "./api";
import "./SavingsGoals.css";

const emptyForm = {
  goalName: "",
  targetAmount: "",
  currentAmount: "0",
  targetDate: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getProgress(goal) {
  const target = Number(goal.targetAmount) || 0;
  const saved = Number(goal.currentAmount) || 0;

  if (target <= 0) return 0;
  return Math.round((saved / target) * 100);
}

export default function SavingsGoals({ onBackToDashboard }) {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadGoals() {
    setIsLoading(true);
    setError("");

    try {
      const result = await getFinancialGoals();

      // Supports a normal list or a Spring Page response.
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.content)
          ? result.content
          : [];

      setGoals(list);
    } catch (err) {
      setError(err.message || "Unable to load savings goals.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startNewGoal() {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditing(goal) {
    setEditingId(goal.id);
    setFormData({
      goalName: goal.goalName ?? "",
      targetAmount: String(goal.targetAmount ?? ""),
      currentAmount: String(goal.currentAmount ?? "0"),
      targetDate: goal.targetDate ?? "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const target = Number(formData.targetAmount);
    const saved = Number(formData.currentAmount);

    if (!formData.goalName.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!Number.isFinite(target) || target <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(saved) || saved < 0) {
      setError("Current savings cannot be negative.");
      return;
    }

    setIsSaving(true);

    const payload = {
      goalName: formData.goalName.trim(),
      targetAmount: target,
      currentAmount: saved,
      targetDate: formData.targetDate || null,
    };

    try {
      if (editingId !== null) {
        await updateFinancialGoal(editingId, payload);
        setMessage("Savings goal updated successfully.");
      } else {
        await createFinancialGoal(payload);
        setMessage("Savings goal created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      await loadGoals();
    } catch (err) {
      setError(err.message || "Unable to save savings goal.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(goal) {
    const confirmed = window.confirm(
      `Delete the savings goal "${goal.goalName}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteFinancialGoal(goal.id);
      setGoals((current) =>
        current.filter((item) => item.id !== goal.id)
      );
      setMessage("Savings goal deleted successfully.");

      if (editingId === goal.id) {
        cancelForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete savings goal.");
    }
  }

  const totalTarget = goals.reduce(
    (sum, goal) => sum + (Number(goal.targetAmount) || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) => sum + (Number(goal.currentAmount) || 0),
    0
  );

  return (
    <div className="savings-page">
      <header className="savings-header">
        <div>
          <p className="muted">PERSONAL FINANCE / PLANNING</p>
          <h1>Savings Goals</h1>
          <p className="savings-subtitle">
            Turn your financial plans into achievable milestones.
          </p>
        </div>

        <button
          className="savings-secondary-button"
          type="button"
          onClick={onBackToDashboard}
        >
          ← Dashboard
        </button>
      </header>

      <section className="savings-stats">
        <article className="savings-stat-card">
          <p>Total goals</p>
          <h2>{goals.length}</h2>
        </article>

        <article className="savings-stat-card">
          <p>Total target</p>
          <h2>{formatCurrency(totalTarget)}</h2>
        </article>

        <article className="savings-stat-card">
          <p>Total saved</p>
          <h2>{formatCurrency(totalSaved)}</h2>
        </article>
      </section>

      <section className="savings-panel">
        <div className="savings-panel-heading">
          <div>
            <h2>Your goals</h2>
            <p className="muted">Track your progress towards each target.</p>
          </div>

          <button
            className="savings-primary-button"
            type="button"
            onClick={startNewGoal}
          >
            + Add goal
          </button>
        </div>

        {error && (
          <p className="savings-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="savings-message" role="status">
            {message}
          </p>
        )}

        {showForm && (
          <form className="savings-form" onSubmit={handleSubmit}>
            <h3>{editingId !== null ? "Edit goal" : "Create a savings goal"}</h3>

            <div className="savings-form-grid">
              <label>
                Goal name
                <input
                  name="goalName"
                  value={formData.goalName}
                  onChange={handleChange}
                  placeholder="e.g. Emergency fund"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Target amount (₹)
                <input
                  name="targetAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="50000"
                  required
                />
              </label>

              <label>
                Currently saved (₹)
                <input
                  name="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Target date
                <input
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="savings-form-actions">
              <button
                className="savings-primary-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update goal"
                    : "Create goal"}
              </button>

              <button
                className="savings-secondary-button"
                type="button"
                onClick={cancelForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="muted">Loading savings goals...</p>
        ) : goals.length === 0 ? (
          <div className="savings-empty">
            <div className="savings-empty-icon">◎</div>
            <h3>Start saving for something meaningful</h3>
            <p className="muted">
              Create your first goal and track your progress here.
            </p>
          </div>
        ) : (
          <div className="savings-goal-list">
            {goals.map((goal) => {
              const percentage = getProgress(goal);
              const saved = Number(goal.currentAmount) || 0;
              const target = Number(goal.targetAmount) || 0;
              const remaining = Math.max(target - saved, 0);

              return (
                <article className="savings-goal-card" key={goal.id}>
                  <div className="savings-goal-top">
                    <div>
                      <h3>{goal.goalName}</h3>
                      <p className="muted">
                        {goal.targetDate
                          ? `Target date: ${goal.targetDate}`
                          : "No target date set"}
                      </p>
                    </div>

                    <span className="savings-percent">
                      {percentage}%
                    </span>
                  </div>

                  <div className="savings-progress-track">
                    <div
                      className="savings-progress-fill"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="savings-goal-amounts">
                    <span>
                      <strong>{formatCurrency(saved)}</strong>
                      <small> saved</small>
                    </span>

                    <span>
                      <strong>{formatCurrency(target)}</strong>
                      <small> target</small>
                    </span>
                  </div>

                  <p className="savings-remaining">
                    {remaining === 0
                      ? "🎉 Target reached!"
                      : `${formatCurrency(remaining)} left to reach your goal`}
                  </p>

                  <div className="savings-goal-actions">
                    <button
                      className="savings-secondary-button"
                      type="button"
                      onClick={() => startEditing(goal)}
                    >
                      Edit
                    </button>

                    <button
                      className="savings-delete-button"
                      type="button"
                      onClick={() => handleDelete(goal)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
