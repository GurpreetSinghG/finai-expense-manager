import { useState } from "react";
import { loginUser } from "./api";

export default function Login({ onLoginSuccess, onCreateAccount }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await loginUser(formData.username.trim(), formData.password);
      onLoginSuccess();
    } catch (error) {
      setError(error.message || "Unable to log in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">Fin<span>AI</span></h1>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to manage your finances.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" value={formData.username} onChange={handleChange} autoComplete="username" placeholder="Enter your username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter your password" required />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="add-button login-button" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          Don&apos;t have an account? <button type="button" onClick={onCreateAccount}>Create account</button>
        </p>
      </div>
    </div>
  );
}
