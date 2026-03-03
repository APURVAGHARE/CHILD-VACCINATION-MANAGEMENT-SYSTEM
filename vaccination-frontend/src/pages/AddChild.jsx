import { useState } from "react";
import api from "../api";

export default function AddChild() {
  const [child, setChild] = useState({
    name: "",
    dob: "",
    gender: "",
    bloodGroup: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setChild({ ...child, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/api/children", child, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMessage("Child added successfully.");
      setChild({ name: "", dob: "", gender: "", bloodGroup: "" });
    } catch (error) {
      setMessage("Error adding child.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Add Child</h2>

      {message && <p className="form-message">{message}</p>}

      <form onSubmit={handleSubmit} className="form">
        <input
          name="name"
          placeholder="Child Name"
          value={child.name}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="dob"
          value={child.dob}
          onChange={handleChange}
          required
        />

        <input
          name="gender"
          placeholder="Gender"
          value={child.gender}
          onChange={handleChange}
        />

        <input
          name="bloodGroup"
          placeholder="Blood Group"
          value={child.bloodGroup}
          onChange={handleChange}
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}