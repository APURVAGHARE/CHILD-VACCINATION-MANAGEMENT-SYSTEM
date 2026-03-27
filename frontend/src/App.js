 import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import ChildList from './pages/ChildList';
import AddChild from './pages/AddChild';
import ChildProfile from './pages/ChildProfile';
import VaccinationSchedule from './pages/VaccinationSchedule';
import UpcomingVaccinations from './pages/UpcomingVaccinations';
import VaccinationHistory from './pages/VaccinationHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NearbyClinics from './pages/nearbyclinics';

// Components
import Chatbot from './components/Chatbot/Chatbot';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex">
          {isAuthenticated && (
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          )}
          
          <div className={`flex-1 transition-all duration-500 ${isAuthenticated ? 'lg:ml-72' : ''}`}>
            {isAuthenticated && <Navbar setSidebarOpen={setSidebarOpen} />}
            
            <main className="p-4 md:p-6 lg:p-8 animate-fadeIn">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/children" element={
                  <ProtectedRoute>
                    <ChildList />
                  </ProtectedRoute>
                } />
                <Route path="/add-child" element={
                  <ProtectedRoute>
                    <AddChild />
                  </ProtectedRoute>
                } />
                <Route path="/child/:id" element={
                  <ProtectedRoute>
                    <ChildProfile />
                  </ProtectedRoute>
                } />
                <Route path="/schedule" element={
                  <ProtectedRoute>
                    <VaccinationSchedule />
                  </ProtectedRoute>
                } />
                <Route path="/upcoming" element={
                  <ProtectedRoute>
                    <UpcomingVaccinations />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <VaccinationHistory />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

              <Route path="/nearby-clinics" element={<NearbyClinics />} />
              </Routes>
            </main>
            
            {isAuthenticated && <Footer />}
          </div>
          
          {/* Chatbot Component - Available on all pages when authenticated */}
          {isAuthenticated && <Chatbot />}
        </div>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="rounded-xl shadow-2xl"
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
