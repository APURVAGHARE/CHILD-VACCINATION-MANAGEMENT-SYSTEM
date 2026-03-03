import { useNavigate } from "react-router-dom";

export default function ChildCard({ child }) {
  const navigate = useNavigate();

  return (
    <div className="card child-card">
      <h3>{child.name}</h3>

      <p>
        <strong>Date of Birth:</strong>{" "}
        {new Date(child.dob).toLocaleDateString()}
      </p>

      <button
        className="primary-btn"
        onClick={() => navigate(`/child/${child.id}`)}
      >
        View Profile →
      </button>
    </div>
  );
}