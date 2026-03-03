import { useEffect, useState } from "react";
import api from "../api";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setHistory(res.data);
      } catch (error) {
        console.error("Error fetching history");
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="container">
      <h2>Vaccination History</h2>

      {history.length === 0 ? (
        <p>No vaccination history found.</p>
      ) : (
        history.map((item) => (
          <div key={item.id} className="card">
            <p><strong>{item.vaccine_name}</strong></p>
            <p>{new Date(item.date).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}