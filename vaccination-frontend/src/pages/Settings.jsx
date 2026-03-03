import { useEffect, useState } from "react";
import api from "../api";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put("/api/user/profile", profile, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage("Error updating profile.");
    }
  };

  return (
    <div className="container">
      <h2>Settings</h2>

      {message && <p className="form-message">{message}</p>}

      <div className="form">
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <input
          name="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <button className="primary-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}