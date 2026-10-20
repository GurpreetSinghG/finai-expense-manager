export default function TransactionForm({ formData, onChange, onSubmit, isSaving, error, message }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Add Transaction</h2>
          <p className="muted">Record income or an expense</p>
        </div>
      </div>

      <form className="transaction-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            Transaction name
            <input name="name" value={formData.name} onChange={onChange} placeholder="e.g. Monthly rent" required />
          </label>

          <label>
            Category
            <select name="category" value={formData.category} onChange={onChange}>
              <option value="Groceries">Groceries</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Food">Food</option>
              <option value="Utilities">Utilities</option>
              <option value="Transport">Transport</option>
              <option value="Fitness">Fitness</option>
              <option value="Income">Income</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Type
            <select name="type" value={formData.type} onChange={onChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Amount (₹)
            <input name="amount" type="number" min="0.01" step="0.01" value={formData.amount} onChange={onChange} placeholder="0.00" required />
          </label>

          <label>
            Transaction date
            <input name="transactionDate" type="date" value={formData.transactionDate} onChange={onChange} required />
          </label>
        </div>

        {error && <p className="login-error" role="alert">{error}</p>}
        {message && <p className="income" role="status">{message}</p>}

        <button className="add-button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "+ Add Transaction"}
        </button>
      </form>
    </section>
  );
}
