export default function AppointmentCard({ appointment }) {
  return (
    <div className="card appointment-card">
      <h3>{appointment.child_name}</h3>

      <p>
        <strong>Vaccine:</strong> {appointment.vaccine_name}
      </p>

      <p>
        <strong>Date:</strong>{" "}
        {new Date(appointment.date).toLocaleDateString()}
      </p>

      <p className="status">
        Status: {appointment.status}
      </p>
    </div>
  );
}