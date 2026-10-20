export default function StatCard({ title, amount, note }) {
  return (
    <div className="stat-card">
      <p className="muted">{title}</p>
      <h2>{amount}</h2>
      <span className="stat-note">{note}</span>
    </div>
  );
}
