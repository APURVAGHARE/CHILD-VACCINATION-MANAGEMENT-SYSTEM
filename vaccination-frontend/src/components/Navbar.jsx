import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        VacciTrack
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/vaccines">Vaccines</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/clinics">Clinics</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/help">Help</Link>
      </div>
    </nav>
  );
}