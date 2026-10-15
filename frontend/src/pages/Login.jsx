
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/login",
        form
      );

      setIsError(false);
      setMessage(response.data.message || "Login successful!");

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Change this to your stock dashboard route when it is ready.
      setTimeout(() => navigate("/stockmaster"), 800);
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="yellow-section" />

      <section className="auth-card login-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">
          Sign in to your stock management system
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {message && (
            <p className={isError ? "message error" : "message success"}>
              {message}
            </p>
          )}

          <button className="yellow-button" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="switch-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </section>
    </main>
  );
}
