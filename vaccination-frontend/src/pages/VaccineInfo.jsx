import { useEffect, useState } from "react";
import api from "../api";
import VaccineTable from "../components/VaccineTable";

export default function VaccineInfo() {
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await api.get("/api/vaccines", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setVaccines(res.data);
      } catch (error) {
        console.error("Error fetching vaccines");
      }
    };

    fetchVaccines();
  }, []);

  return (
    <div className="container">
      <h2>All Vaccines</h2>

      {vaccines.length === 0 ? (
        <p>No vaccine data available.</p>
      ) : (
        <VaccineTable vaccines={vaccines} />
      )}
    </div>
  );
}