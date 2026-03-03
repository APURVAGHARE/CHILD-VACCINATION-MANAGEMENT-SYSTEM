import { useEffect, useState } from "react";
import api from "../api";
import VaccineTable from "../components/VaccineTable";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get("/api/schedule", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setSchedule(res.data);
      } catch (error) {
        console.error("Error fetching schedule");
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className="container">
      <h2>Vaccination Schedule</h2>

      {schedule.length === 0 ? (
        <p>No scheduled vaccines found.</p>
      ) : (
        <VaccineTable vaccines={schedule} />
      )}
    </div>
  );
}