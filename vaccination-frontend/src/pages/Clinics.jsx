export default function Clinics() {
  const clinics = [
    { id: 1, name: "City Hospital", contact: "9876543210" },
    { id: 2, name: "Care Clinic", contact: "9123456780" }
  ];

  return (
    <div className="container">
      <h2>Clinics</h2>

      {clinics.map((clinic) => (
        <div key={clinic.id} className="card">
          <h3>{clinic.name}</h3>
          <p>Contact: {clinic.contact}</p>
        </div>
      ))}
    </div>
  );
}