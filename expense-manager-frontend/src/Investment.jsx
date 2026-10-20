
import { useEffect, useState } from "react";
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from "./api";
import "./Investment.css";

const emptyForm = {
  investmentName: "",
  investmentType: "Mutual Fund",
  investedAmount: "",
  currentValue: "",
  purchaseDate: "",
  notes: "",
};

const investmentTypes = [
  "Stocks",
  "Mutual Fund",
  "Fixed Deposit",
  "Gold",
  "Bonds",
  "ETF",
  "Other",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function Investment({ onBackToDashboard }) {
  const [investments, setInvestments] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadInvestments() {
    setIsLoading(true);
    setError("");

    try {
      const result = await getInvestments();

      setInvestments(
        Array.isArray(result)
          ? result
          : Array.isArray(result?.content)
            ? result.content
            : []
      );
    } catch (err) {
      setError(err.message || "Unable to load investments.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvestments();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startNewInvestment() {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditing(investment) {
    setEditingId(investment.id);
    setFormData({
      investmentName: investment.investmentName ?? "",
      investmentType: investment.investmentType ?? "Other",
      investedAmount: String(investment.investedAmount ?? ""),
      currentValue: String(investment.currentValue ?? ""),
      purchaseDate: investment.purchaseDate ?? "",
      notes: investment.notes ?? "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const invested = Number(formData.investedAmount);
    const current = Number(formData.currentValue);

    if (!formData.investmentName.trim()) {
      setError("Please enter an investment name.");
      return;
    }

    if (!Number.isFinite(invested) || invested <= 0) {
      setError("Invested amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(current) || current < 0) {
      setError("Current value cannot be negative.");
      return;
    }

    const payload = {
      investmentName: formData.investmentName.trim(),
      investmentType: formData.investmentType,
      investedAmount: invested,
      currentValue: current,
      purchaseDate: formData.purchaseDate || null,
      notes: formData.notes.trim() || null,
    };

    setIsSaving(true);

    try {
      if (editingId !== null) {
        await updateInvestment(editingId, payload);
        setMessage("Investment updated successfully.");
      } else {
        await createInvestment(payload);
        setMessage("Investment added successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      await loadInvestments();
    } catch (err) {
      setError(err.message || "Unable to save investment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(investment) {
    const confirmed = window.confirm(
      `Delete "${investment.investmentName}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteInvestment(investment.id);

      setInvestments((current) =>
        current.filter((item) => item.id !== investment.id)
      );

      setMessage("Investment deleted successfully.");

      if (editingId === investment.id) {
        cancelForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete investment.");
    }
  }

  const totalInvested = investments.reduce(
    (sum, item) => sum + (Number(item.investedAmount) || 0),
    0
  );

  const currentTotalValue = investments.reduce(
    (sum, item) => sum + (Number(item.currentValue) || 0),
    0
  );

  const totalProfitLoss = currentTotalValue - totalInvested;

  const totalReturn =
    totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

  return (
    <div className="investment-page">
      <header className="investment-header">
        <div>
          <p className="muted">PERSONAL FINANCE / WEALTH</p>
          <h1>Investments</h1>
          <p className="investment-subtitle">
            Track your portfolio and see how your investments are performing.
          </p>
        </div>

        <button
          className="investment-secondary-button"
          type="button"
          onClick={onBackToDashboard}
        >
          ← Dashboard
        </button>
      </header>

      <section className="investment-stats">
        <article className="investment-stat-card">
          <p>Total invested</p>
          <h2>{formatCurrency(totalInvested)}</h2>
        </article>

        <article className="investment-stat-card">
          <p>Current value</p>
          <h2>{formatCurrency(currentTotalValue)}</h2>
        </article>

        <article className="investment-stat-card">
          <p>Total profit / loss</p>
          <h2 className={totalProfitLoss >= 0 ? "investment-positive" : "investment-negative"}>
            {totalProfitLoss > 0 ? "+" : ""}
            {formatCurrency(totalProfitLoss)}
          </h2>
          <span className={totalProfitLoss >= 0 ? "investment-positive" : "investment-negative"}>
            {totalReturn.toFixed(2)}% overall return
          </span>
        </article>
      </section>

      <section className="investment-panel">
        <div className="investment-panel-heading">
          <div>
            <h2>Your portfolio</h2>
            <p className="muted">
              {investments.length} investment
              {investments.length === 1 ? "" : "s"} recorded
            </p>
          </div>

          <button
            className="investment-primary-button"
            type="button"
            onClick={startNewInvestment}
          >
            + Add investment
          </button>
        </div>

        {error && (
          <p className="investment-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="investment-message" role="status">
            {message}
          </p>
        )}

        {showForm && (
          <form className="investment-form" onSubmit={handleSubmit}>
            <h3>
              {editingId !== null ? "Edit investment" : "Add an investment"}
            </h3>

            <div className="investment-form-grid">
              <label>
                Investment name
                <input
                  name="investmentName"
                  value={formData.investmentName}
                  onChange={handleChange}
                  placeholder="e.g. Nifty 50 Index Fund"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Investment type
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleChange}
                  required
                >
                  {investmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Invested amount (₹)
                <input
                  name="investedAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.investedAmount}
                  onChange={handleChange}
                  placeholder="25000"
                  required
                />
              </label>

              <label>
                Current value (₹)
                <input
                  name="currentValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={handleChange}
                  placeholder="28000"
                  required
                />
              </label>

              <label>
                Purchase date
                <input
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                Notes (optional)
                <input
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add a note"
                  maxLength={500}
                />
              </label>
            </div>

            <div className="investment-form-actions">
              <button
                className="investment-primary-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update investment"
                    : "Save investment"}
              </button>

              <button
                className="investment-secondary-button"
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
          <p className="muted">Loading investments...</p>
        ) : investments.length === 0 ? (
          <div className="investment-empty">
            <div className="investment-empty-icon">↗</div>
            <h3>Your portfolio starts here</h3>
            <p className="muted">
              Add your first investment to track its value and returns.
            </p>
          </div>
        ) : (
          <div className="investment-list">
            {investments.map((investment) => {
              const invested = Number(investment.investedAmount) || 0;
              const value = Number(investment.currentValue) || 0;
              const profitLoss = value - invested;
              const returnPercent =
                invested > 0 ? (profitLoss / invested) * 100 : 0;

              return (
                <article className="investment-card" key={investment.id}>
                  <div className="investment-card-top">
                    <div className="investment-type-icon">₹</div>

                    <div className="investment-card-title">
                      <h3>{investment.investmentName}</h3>
                      <p className="muted">{investment.investmentType}</p>
                    </div>

                    <strong
                      className={
                        profitLoss >= 0
                          ? "investment-positive"
                          : "investment-negative"
                      }
                    >
                      {profitLoss > 0 ? "+" : ""}
                      {formatCurrency(profitLoss)}
                    </strong>
                  </div>

                  <div className="investment-values">
                    <div>
                      <span>Invested</span>
                      <strong>{formatCurrency(invested)}</strong>
                    </div>

                    <div>
                      <span>Current value</span>
                      <strong>{formatCurrency(value)}</strong>
                    </div>

                    <div>
                      <span>Return</span>
                      <strong
                        className={
                          profitLoss >= 0
                            ? "investment-positive"
                            : "investment-negative"
                        }
                      >
                        {returnPercent.toFixed(2)}%
                      </strong>
                    </div>
                  </div>

                  {investment.purchaseDate && (
                    <p className="investment-date">
                      Purchase date: {investment.purchaseDate}
                    </p>
                  )}

                  {investment.notes && (
                    <p className="investment-notes">{investment.notes}</p>
                  )}

                  <div className="investment-card-actions">
                    <button
                      className="investment-secondary-button"
                      type="button"
                      onClick={() => startEditing(investment)}
                    >
                      Edit
                    </button>

                    <button
                      className="investment-delete-button"
                      type="button"
                      onClick={() => handleDelete(investment)}
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
