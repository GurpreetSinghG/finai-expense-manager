export default function Logout({ onLogout }) {
  return (
    <button className="logout-button" type="button" onClick={onLogout}>
      ↪ Log out
    </button>
  );
}
