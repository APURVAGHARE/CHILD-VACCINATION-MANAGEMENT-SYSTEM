import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/auth/signup", form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed.");
    }
  };

  return (
    <div className="container">
      <h2>Create Account</h2>

      {error && <p className="form-message" style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button className="primary-btn">
          Create Account
        </button>
      </form>
    </div>
  );
}