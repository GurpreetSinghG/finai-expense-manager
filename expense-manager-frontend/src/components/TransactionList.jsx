export default function TransactionList({
  transactions,
  totalElements,
  isLoading,
  isLoadingAll,
  showAll,
  error,
  onViewAll,
}) {
  const hasMoreThanFirstPage = totalElements > transactions.length;

  return (
    <section className="panel" id="transactions">
      <div className="panel-heading">
        <div>
          <h2>Recent Transactions</h2>
          <p className="muted">
            Showing {transactions.length} of {totalElements} transactions
          </p>
        </div>

        {(hasMoreThanFirstPage || showAll) && (
          <button
            className="text-button"
            type="button"
            onClick={onViewAll}
            disabled={isLoading || isLoadingAll || totalElements === 0}
          >
            {isLoadingAll ? "Loading..." : showAll ? "Show less ↑" : "View all →"}
          </button>
        )}
      </div>

      {isLoading && <p className="muted">Loading transactions...</p>}
      {error && <p className="login-error" role="alert">{error}</p>}
      {!isLoading && !error && transactions.length === 0 && (
        <p className="muted">No transactions found yet.</p>
      )}

      <div className="transaction-list">
        {transactions.map((transaction) => (
          <div className="transaction-row" key={transaction.id}>
            <div className={`transaction-icon ${transaction.amount > 0 ? "credit-icon" : "debit-icon"}`}>
              {transaction.amount > 0 ? "↙" : "↗"}
            </div>
            <div className="transaction-info">
              <strong>{transaction.name}</strong>
              <span className="muted">{transaction.category}</span>
              {transaction.transactionDate && (
                <span className="muted">{transaction.transactionDate}</span>
              )}
            </div>
            <strong className={transaction.amount > 0 ? "income" : "expense"}>
              {transaction.amount > 0 ? "+" : "−"}₹{Math.abs(transaction.amount).toLocaleString("en-IN")}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
