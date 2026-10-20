import { useState } from "react";
import { registerUser } from "./api";

export default function CreateUser({ onBackToLogin }) {
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      await registerUser(formData);
      setSuccess("Account created successfully. You can now sign in.");
      setFormData({ fullName: "", username: "", email: "", password: "" });
    } catch (error) {
      setError(error.message || "Unable to create your account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand">Fin<span>AI</span></h1>
        <h2>Create your account</h2>
        <p className="muted">Start managing your finances with FinAI.</p>
        <form onSubmit={handleSubmit}>
          <label>Full name<input name="fullName" value={formData.fullName} onChange={handleChange} autoComplete="name" maxLength={100} placeholder="Enter your full name" required /></label>
          <label>Username<input name="username" value={formData.username} onChange={handleChange} autoComplete="username" placeholder="Choose a username" required /></label>
          <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" placeholder="Enter your email" required /></label>
          <label>Password<input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
          {success ? (
            <button className="add-button login-button" type="button" onClick={onBackToLogin}>Go to sign in</button>
          ) : (
            <button className="add-button login-button" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</button>
          )}
        </form>
        <p className="auth-switch">Already have an account? <button type="button" onClick={onBackToLogin}>Sign in</button></p>
      </div>
    </div>
  );
}
