import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function BookAppointment() {
  const [form, setForm] = useState({
    child_id: "",
    vaccine_id: "",
    date: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/appointments", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Book Appointment</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          name="child_id"
          placeholder="Child ID"
          onChange={handleChange}
          required
        />

        <input
          name="vaccine_id"
          placeholder="Vaccine ID"
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          onChange={handleChange}
          required
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Booking..." : "Book"}
        </button>
      </form>
    </div>
  );
}