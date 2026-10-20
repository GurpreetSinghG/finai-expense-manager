import StatCard from "./StatCard";

export default function DashboardStats({
  totalIncome,
  totalExpenses,
  netCashFlow,
  savingsRate,
  formatCurrency,
  isLoading,
  error,
}) {
  return (
    <>
      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}
      <section className="stats-grid">
        <StatCard
          title="Total Income"
          amount={isLoading ? "Loading..." : formatCurrency(totalIncome)}
          note="Current month · backend data"
        />
        <StatCard
          title="Total Expenses"
          amount={isLoading ? "Loading..." : formatCurrency(totalExpenses)}
          note="Current month · backend data"
        />
        <StatCard
          title="Net Cash Flow"
          amount={isLoading ? "Loading..." : formatCurrency(netCashFlow)}
          note="Income minus expenses"
        />
        <StatCard
          title="Savings Rate"
          amount={isLoading ? "Loading..." : `${savingsRate.toFixed(1)}%`}
          note="Net cash flow ÷ income"
        />
      </section>
    </>
  );
}
