import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome to VacciTrack</h1>
      <p>Manage your child's vaccination journey with clarity and confidence.</p>

      <div style={{ marginTop: "20px" }}>
        <button className="primary-btn" onClick={() => navigate("/signup")}>
          Register
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/login")}
          style={{ marginLeft: "10px" }}
        >
          Login
        </button>
      </div>
    </div>
  );
}