
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    number: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/signup",
        form
      );

      setIsError(false);
      setMessage(response.data.message || "Account created successfully!");

      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="yellow-section" />

      <section className="auth-card signup-card">
        <h1>Create Account</h1>
        <p className="subtitle">Sign up to manage your stock inventory</p>

        <form onSubmit={handleSubmit}>
          <input
            name="fullname"
            placeholder="Full Name"
            value={form.fullname}
            onChange={handleChange}
            required
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="number"
            type="tel"
            placeholder="Phone Number"
            value={form.number}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {message && (
            <p className={isError ? "message error" : "message success"}>
              {message}
            </p>
          )}

          <button className="yellow-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
