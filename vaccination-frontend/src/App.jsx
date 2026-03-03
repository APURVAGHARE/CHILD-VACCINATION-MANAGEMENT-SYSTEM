import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddChild from "./pages/AddChild";
import ChildProfile from "./pages/ChildProfile";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import VaccineInfo from "./pages/VaccineInfo";
import Clinics from "./pages/Clinics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-child" element={<AddChild />} />
            <Route path="/child/:id" element={<ChildProfile />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/history" element={<History />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/vaccines" element={<VaccineInfo />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;