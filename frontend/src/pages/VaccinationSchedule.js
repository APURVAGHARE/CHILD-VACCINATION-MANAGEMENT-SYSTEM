import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { vaccinationAPI, childrenAPI } from '../services/api';

const VaccinationSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Data states
  const [children, setChildren] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [apiError, setApiError] = useState(null);
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    child_id: '',
    vaccine_id: '',
    clinic_name: '',
    appointment_date: '',
    time_slot: '10:00 AM',
    doctor_name: '',
    notes: ''
  });

  // Standard vaccination schedule - Indian context (static data)
  const standardSchedule = [
    { 
      age: 'Birth', 
      vaccines: [
        { name: 'BCG', description: 'Tuberculosis', priority: 'high' },
        { name: 'Hepatitis B - Dose 1', description: 'Hepatitis B', priority: 'high' },
        { name: 'Polio (OPV) - Dose 0', description: 'Polio', priority: 'high' }
      ] 
    },
    { 
      age: '6 Weeks', 
      vaccines: [
        { name: 'DTaP - Dose 1', description: 'Diphtheria, Tetanus, Pertussis', priority: 'high' },
        { name: 'Polio (OPV) - Dose 1', description: 'Polio', priority: 'high' },
        { name: 'Hepatitis B - Dose 2', description: 'Hepatitis B', priority: 'high' },
        { name: 'Rotavirus - Dose 1', description: 'Rotavirus', priority: 'high' },
        { name: 'PCV - Dose 1', description: 'Pneumococcal', priority: 'high' }
      ] 
    },
    { 
      age: '10 Weeks', 
      vaccines: [
        { name: 'DTaP - Dose 2', description: 'Diphtheria, Tetanus, Pertussis', priority: 'high' },
        { name: 'Polio (OPV) - Dose 2', description: 'Polio', priority: 'high' },
        { name: 'Rotavirus - Dose 2', description: 'Rotavirus', priority: 'high' },
        { name: 'PCV - Dose 2', description: 'Pneumococcal', priority: 'high' }
      ] 
    },
    { 
      age: '14 Weeks', 
      vaccines: [
        { name: 'DTaP - Dose 3', description: 'Diphtheria, Tetanus, Pertussis', priority: 'high' },
        { name: 'Polio (OPV) - Dose 3', description: 'Polio', priority: 'high' },
        { name: 'Hepatitis B - Dose 3', description: 'Hepatitis B', priority: 'high' },
        { name: 'Rotavirus - Dose 3', description: 'Rotavirus', priority: 'high' },
        { name: 'PCV - Dose 3', description: 'Pneumococcal', priority: 'high' }
      ] 
    },
    { 
      age: '6 Months', 
      vaccines: [
        { name: 'Influenza - Dose 1', description: 'Flu', priority: 'seasonal' }
      ] 
    },
    { 
      age: '7 Months', 
      vaccines: [
        { name: 'Influenza - Dose 2', description: 'Flu', priority: 'seasonal' }
      ] 
    },
    { 
      age: '9 Months', 
      vaccines: [
        { name: 'MMR - Dose 1', description: 'Measles, Mumps, Rubella', priority: 'high' },
        { name: 'Varicella - Dose 1', description: 'Chickenpox', priority: 'high' },
        { name: 'Hepatitis A - Dose 1', description: 'Hepatitis A', priority: 'high' }
      ] 
    },
    { 
      age: '12 Months', 
      vaccines: [
        { name: 'PCV Booster', description: 'Pneumococcal', priority: 'high' },
        { name: 'MMR - Dose 2', description: 'Measles, Mumps, Rubella', priority: 'high' },
        { name: 'Varicella - Dose 2', description: 'Chickenpox', priority: 'high' }
      ] 
    },
    { 
      age: '15 Months', 
      vaccines: [
        { name: 'DTaP Booster - Dose 1', description: 'Diphtheria, Tetanus, Pertussis', priority: 'high' },
        { name: 'Hepatitis A - Dose 2', description: 'Hepatitis A', priority: 'high' }
      ] 
    },
    { 
      age: '18 Months', 
      vaccines: [
        { name: 'Polio (OPV) Booster', description: 'Polio', priority: 'high' }
      ] 
    },
    { 
      age: '2 Years', 
      vaccines: [
        { name: 'Typhoid Conjugate Vaccine', description: 'Typhoid', priority: 'recommended' }
      ] 
    },
    { 
      age: '5 Years', 
      vaccines: [
        { name: 'DTaP Booster - Dose 2', description: 'Diphtheria, Tetanus, Pertussis', priority: 'high' },
        { name: 'Polio (OPV) Booster', description: 'Polio', priority: 'high' },
        { name: 'MMR - Dose 3', description: 'Measles, Mumps, Rubella', priority: 'high' }
      ] 
    },
    { 
      age: '10 Years', 
      vaccines: [
        { name: 'Tdap Booster', description: 'Tetanus, Diphtheria, Pertussis', priority: 'high' },
        { name: 'HPV Vaccine - Dose 1', description: 'Human Papillomavirus', priority: 'recommended' }
      ] 
    },
    { 
      age: '16 Years', 
      vaccines: [
        { name: 'Tdap Booster', description: 'Tetanus, Diphtheria, Pertussis', priority: 'high' },
        { name: 'HPV Vaccine - Dose 2/3', description: 'Human Papillomavirus', priority: 'recommended' },
        { name: 'Meningococcal Vaccine', description: 'Meningitis', priority: 'recommended' }
      ] 
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      // Fetch children
      console.log('Fetching children...');
      const childrenRes = await childrenAPI.getAll();
      console.log('Children response:', childrenRes.data);
      setChildren(childrenRes.data.children || []);

      // Fetch vaccines from database
      await fetchVaccines();

      // Fetch appointments for all children
      // Fetch appointments for all children
let allAppointments = [];
for (const child of childrenRes.data.children) {
  try {
    console.log(`Fetching appointments for child ${child.id}...`);
    const appointmentsRes = await vaccinationAPI.getAppointments(child.id);
    console.log(`Appointments for child ${child.id}:`, appointmentsRes.data);
    
    // Format appointments with child name and extract clinic/doctor from notes
    const childAppointments = (appointmentsRes.data.appointments || []).map(apt => {
      // Try to extract clinic and doctor from notes if they were stored there
      let clinic_name = null;
      let doctor_name = null;
      let cleanNotes = apt.notes;
      
      if (apt.notes) {
        const clinicMatch = apt.notes.match(/Clinic: ([^\n]+)/);
        const doctorMatch = apt.notes.match(/Doctor: ([^\n]+)/);
        
        if (clinicMatch) clinic_name = clinicMatch[1];
        if (doctorMatch) doctor_name = doctorMatch[1];
        
        // Remove the clinic and doctor lines from notes for display
        cleanNotes = apt.notes
          .replace(/Clinic: [^\n]+\n?/, '')
          .replace(/Doctor: [^\n]+\n?/, '')
          .trim();
      }
      
      return {
        ...apt,
        child_name: child.full_name,
        clinic_name: clinic_name,
        doctor_name: doctor_name,
        clean_notes: cleanNotes
      };
    });
    
    allAppointments = [...allAppointments, ...childAppointments];
  } catch (err) {
    console.error(`Error fetching appointments for child ${child.id}:`, err);
  }
}
console.log('All appointments:', allAppointments);
setAppointments(allAppointments);

    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError(error.message);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      setVaccinesLoading(true);
      console.log('Fetching vaccines from API...');
      
      const vaccinesRes = await vaccinationAPI.getVaccines();
      console.log('Raw vaccines API response:', vaccinesRes);
      console.log('Vaccines data:', vaccinesRes.data);

      // Handle different response structures
      let vaccinesData = [];
      if (vaccinesRes.data && vaccinesRes.data.success && vaccinesRes.data.vaccines) {
        // Standard structure: { success: true, vaccines: [...] }
        vaccinesData = vaccinesRes.data.vaccines;
      } else if (vaccinesRes.data && vaccinesRes.data.vaccines) {
        // Alternative: { vaccines: [...] }
        vaccinesData = vaccinesRes.data.vaccines;
      } else if (Array.isArray(vaccinesRes.data)) {
        // Direct array
        vaccinesData = vaccinesRes.data;
      } else if (vaccinesRes.data && vaccinesRes.data.data) {
        // Nested data
        vaccinesData = vaccinesRes.data.data;
      }

      console.log('Processed vaccines data:', vaccinesData);
      console.log(`Found ${vaccinesData.length} vaccines`);
      
      setVaccines(vaccinesData);
      
      if (vaccinesData.length === 0) {
        console.warn('No vaccines found in the response');
        toast.info('No vaccines available in the database');
      }
      
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      setApiError(error.message);
      toast.error('Failed to load vaccines');
    } finally {
      setVaccinesLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getAppointmentsForDate = (date) => {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  const dayAppointments = appointments.filter(a => a.appointment_date === dateStr);
  return dayAppointments;
};

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.appointment_date === dateStr);
    
    if (dayAppointments.length > 0) {
      setSelectedAppointment(dayAppointments[0]);
      setShowAppointmentModal(true);
    } else {
      // Open schedule modal for this date
      setNewAppointment({
        child_id: children.length > 0 ? children[0].id : '',
        vaccine_id: '',
        clinic_name: '',
        appointment_date: dateStr,
        time_slot: '10:00 AM',
        doctor_name: '',
        notes: ''
      });
      setShowScheduleModal(true);
    }
  };

  const handleScheduleNew = () => {
    // Set default date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    setNewAppointment({
      child_id: children.length > 0 ? children[0].id : '',
      vaccine_id: '',
      clinic_name: '',
      appointment_date: `${year}-${month}-${day}`,
      time_slot: '10:00 AM',
      doctor_name: '',
      notes: ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
  e.preventDefault();
  
  if (!newAppointment.child_id || !newAppointment.vaccine_id || !newAppointment.appointment_date || !newAppointment.time_slot) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    setLoading(true);
    
    // Call API to save appointment
    const response = await vaccinationAPI.scheduleAppointment({
      child_id: newAppointment.child_id,
      vaccine_id: newAppointment.vaccine_id,
      clinic_name: newAppointment.clinic_name,
      appointment_date: newAppointment.appointment_date,
      time_slot: newAppointment.time_slot,
      doctor_name: newAppointment.doctor_name,
      notes: newAppointment.notes
    });

    console.log('Appointment scheduled:', response.data);
    
    toast.success('Appointment scheduled successfully!');
    setShowScheduleModal(false);
    
    // Reset form
    setNewAppointment({
      child_id: children.length > 0 ? children[0].id : '',
      vaccine_id: '',
      clinic_name: '',
      appointment_date: '',
      time_slot: '10:00 AM',
      doctor_name: '',
      notes: ''
    });
    
    // Refresh data to show the new appointment
    await fetchData();
    
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    toast.error(error.response?.data?.error || 'Failed to schedule appointment');
  } finally {
    setLoading(false);
  }
};

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await vaccinationAPI.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled');
      fetchData();
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleGetDirections = (location) => {
    // Open Google Maps with the location
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleJoinCall = () => {
    toast.info('Video call link will be sent to your email');
  };

  const handleRetryFetch = () => {
    fetchData();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'recommended':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'seasonal':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      case 'today':
        return 'bg-red-100 text-red-600 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Vaccination Schedule</h1>
          <p className="text-primary-100">View and manage your children's vaccination appointments</p>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">Error loading data: {apiError}</p>
            </div>
            <button
              onClick={handleRetryFetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Child Filter */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
          <select
            value="all"
            onChange={(e) => {}}
            className="bg-transparent border-none focus:ring-0 text-sm px-4 py-2"
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.full_name}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                ${viewMode === mode 
                  ? 'bg-white shadow-md text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 min-w-[240px] text-center">
            {monthName} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Schedule Button */}
        <button
          onClick={handleScheduleNew}
          className="btn-primary"
        >
          Schedule New
        </button>

        {/* Debug button - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={fetchVaccines}
            className="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
          >
            Refresh Vaccines
          </button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-32 bg-gray-50 rounded-xl" />
          ))}
          
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(date => {
            const dayAppointments = getAppointmentsForDate(date);
            const hasAppointments = dayAppointments.length > 0;
            const isToday = date === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() &&
                           currentDate.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDate === date;
            
            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className={`h-32 p-2 border-2 rounded-xl hover:shadow-lg transition-all duration-300 text-left relative group
                  ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                  ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                  ${hasAppointments ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                <span className={`text-sm font-medium mb-2 inline-block w-6 h-6 text-center rounded-full
                  ${isToday ? 'bg-primary-600 text-white' : isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                  {date}
                </span>
                
                {hasAppointments && (
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt, index) => {
                      const child = children.find(c => c.id === apt.child_id);
                      return (
                        <div key={index} className="text-xs p-1 bg-white rounded shadow-sm flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          <span className="truncate font-medium">{child?.full_name?.split(' ')[0]}</span>
                          <span className="mx-1">•</span>
                          <span>{apt.time_slot}</span>
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Hover preview */}
                {hasAppointments && (
                  <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
                    <p className="text-xs text-white font-medium">
                      {dayAppointments.length} appointment{dayAppointments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 text-primary-600 mr-2" />
            Upcoming Appointments
          </h2>
          
          <div className="space-y-4">
            {appointments.filter(a => a.status === 'scheduled' || a.status === 'today').length > 0 ? (
              appointments
                .filter(a => a.status === 'scheduled' || a.status === 'today')
                .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
                .slice(0, 5)
                .map((appointment, index) => {
                  const child = children.find(c => c.id === appointment.child_id);
                  const isToday = new Date(appointment.appointment_date).toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:shadow-lg transition-all duration-300 animate-slideIn cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowAppointmentModal(true);
                      }}
                    >
                      <div className="h-14 w-14 rounded-xl bg-white shadow-lg flex items-center justify-center text-2xl">
                        {child?.gender === 'Female' ? '👧' : '👶'}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{child?.full_name}</h3>
                          {isToday && (
                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold animate-pulse">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{appointment.vaccine_name} vaccination</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(appointment.appointment_date).toLocaleDateString('en-IN')}
                          <ClockIcon className="h-3 w-3 ml-3 mr-1" />
                          {appointment.time_slot}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No upcoming appointments scheduled
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={handleScheduleNew}
              className="w-full p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all text-left group"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Schedule Appointment</p>
                  <p className="text-xs text-gray-500">Book a new vaccination</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/upcoming')}
              className="w-full p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all text-left group"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClockIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">View Upcoming</p>
                  <p className="text-xs text-gray-500">See all pending vaccinations</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/history')}
              className="w-full p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all text-left group"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">View History</p>
                  <p className="text-xs text-gray-500">Check vaccination records</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Standard Vaccination Schedule */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
          Standard Vaccination Schedule (India)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {standardSchedule.map((item, index) => (
            <div 
              key={index} 
              className="border-2 border-gray-100 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:border-primary-200 animate-slideIn cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => {
                toast.info(`Viewing details for ${item.age} schedule`);
              }}
            >
              <h3 className="font-bold text-primary-600 mb-3 text-lg">{item.age}</h3>
              <ul className="space-y-2">
                {item.vaccines.map((vaccine, vIndex) => (
                  <li key={vIndex} className="text-sm">
                    <div className="flex items-start">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${getPriorityColor(vaccine.priority)}`}>
                        {vaccine.priority === 'high' ? '✓' : '○'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{vaccine.name}</p>
                        <p className="text-xs text-gray-500">{vaccine.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Recommended</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Seasonal</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Optional</span>
          </div>
        </div>
      </div>

      {/* Schedule New Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideIn">
            <div className="relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white sticky top-0">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-2">Schedule Appointment</h2>
                <p className="text-primary-100">Book a new vaccination appointment</p>
              </div>

              {/* Form */}
              <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                {/* Child Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Child <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newAppointment.child_id}
                    onChange={(e) => setNewAppointment({...newAppointment, child_id: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Choose a child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Vaccine Selection - FIXED VERSION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vaccine <span className="text-red-500">*</span>
                  </label>
                  {vaccinesLoading ? (
                    <div className="input-field flex items-center justify-center py-3">
                      <div className="loading-spinner-small mr-2"></div>
                      <span className="text-gray-500">Loading vaccines...</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={newAppointment.vaccine_id}
                      onChange={(e) => setNewAppointment({...newAppointment, vaccine_id: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Choose a vaccine</option>
                      {vaccines.length > 0 ? (
                        vaccines.map(vaccine => (
                          <option key={vaccine.id} value={vaccine.id}>
                            {vaccine.vaccine_name} 
                            {vaccine.dose_number ? ` (Dose ${vaccine.dose_number})` : ''}
                            {vaccine.recommended_age_months ? ` - ${vaccine.recommended_age_months} months` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No vaccines available</option>
                      )}
                    </select>
                  )}
                  {!vaccinesLoading && vaccines.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      No vaccines found. Please check database.
                    </p>
                  )}
                </div>

                {/* Clinic Name - Text input (simple) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic/Hospital Name
                  </label>
                  <input
                    type="text"
                    value={newAppointment.clinic_name}
                    onChange={(e) => setNewAppointment({...newAppointment, clinic_name: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Apollo Clinic, Fortis Hospital"
                  />
                </div>

                {/* Doctor Name - Text input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor's Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newAppointment.doctor_name}
                    onChange={(e) => setNewAppointment({...newAppointment, doctor_name: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Dr. Priya Singh"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newAppointment.time_slot}
                    onChange={(e) => setNewAppointment({...newAppointment, time_slot: e.target.value})}
                    className="input-field"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows="3"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    className="input-field"
                    placeholder="Any special instructions or notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Schedule Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideIn">
            <div className="relative">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
                <p className="text-primary-100">{new Date(selectedAppointment.appointment_date).toLocaleDateString('en-IN')}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Child Info */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-3xl">
                    {children.find(c => c.id === selectedAppointment.child_id)?.gender === 'Female' ? '👧' : '👶'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {children.find(c => c.id === selectedAppointment.child_id)?.full_name}
                    </h3>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Vaccine</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.vaccine_name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Time</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.time_slot}</p>
                  </div>
                  {selectedAppointment.clinic_name && (
                    <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Clinic</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.clinic_name}</p>
                    </div>
                  )}
                  {selectedAppointment.doctor_name && (
                    <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Doctor</p>
                      <p className="font-semibold text-gray-900">{selectedAppointment.doctor_name}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900 mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Notes</p>
                    <p className="text-sm text-yellow-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => handleCancelAppointment(selectedAppointment.id)}
                        className="flex-1 btn-danger"
                      >
                        Cancel Appointment
                      </button>
                      <button 
                        onClick={() => setShowAppointmentModal(false)}
                        className="flex-1 btn-secondary"
                      >
                        Close
                      </button>
                    </>
                  )}
                  {selectedAppointment.status === 'today' && (
                    <button 
                      onClick={() => handleGetDirections(selectedAppointment.location)}
                      className="flex-1 btn-primary"
                    >
                      Get Directions
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for DocumentTextIcon
const DocumentTextIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default VaccinationSchedule;