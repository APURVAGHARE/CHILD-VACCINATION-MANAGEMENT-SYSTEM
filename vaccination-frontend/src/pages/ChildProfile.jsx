import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import VaccineTable from "../components/VaccineTable";

export default function ChildProfile() {
  const { id } = useParams();
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await api.get(`/api/schedule/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setVaccines(res.data);
      } catch (error) {
        console.error("Error fetching vaccine schedule");
      }
    };

    fetchVaccines();
  }, [id]);

  return (
    <div className="container">
      <h2>Child Profile</h2>
      <VaccineTable vaccines={vaccines} />
    </div>
  );
}