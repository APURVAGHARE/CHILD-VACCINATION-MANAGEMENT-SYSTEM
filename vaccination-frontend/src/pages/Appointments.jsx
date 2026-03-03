import { useEffect, useState } from "react";
import api from "../api";
import AppointmentCard from "../components/AppointmentCard";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/api/appointments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments");
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container">
      <h2>Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
      ) : (
        appointments.map((appt) => (
          <AppointmentCard key={appt.id} appointment={appt} />
        ))
      )}
    </div>
  );
}