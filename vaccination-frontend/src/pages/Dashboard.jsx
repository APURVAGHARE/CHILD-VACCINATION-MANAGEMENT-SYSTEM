import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ChildCard from "../components/ChildCard";
import AlertBox from "../components/AlertBox";

export default function Dashboard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchChildren = async () => {
      try {
        const res = await api.get("/api/children", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setChildren(res.data);
      } catch (error) {
        console.error("Error fetching children");
        localStorage.removeItem("token");
        navigate("/login");
      }

      setLoading(false);
    };

    fetchChildren();
  }, [navigate]);

  return (
    <div className="container">
      {children.length > 0 && (
        <AlertBox message="Stay on track. Check upcoming vaccinations." type="success" />
      )}

      <h2>Your Children</h2>

      {loading ? (
        <p>Loading...</p>
      ) : children.length === 0 ? (
        <p>No children added yet.</p>
      ) : (
        children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))
      )}
    </div>
  );
}