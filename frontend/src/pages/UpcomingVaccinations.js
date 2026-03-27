import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { vaccinationAPI, childrenAPI } from '../services/api';

const UpcomingVaccinations = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vaccinationSchedule, setVaccinationSchedule] = useState([]);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch children
      console.log('Fetching children...');
      const childrenRes = await childrenAPI.getAll();
      console.log('Children response:', childrenRes.data);
      setChildren(childrenRes.data.children || []);

      // Fetch appointments and schedules for each child
      let allAppointments = [];
      let allSchedules = [];

      for (const child of childrenRes.data.children) {
        try {
          // Fetch appointments
          const appointmentsRes = await vaccinationAPI.getAppointments(child.id);
          console.log(`Appointments for child ${child.id}:`, appointmentsRes.data);
          
          const childAppointments = (appointmentsRes.data.appointments || []).map(apt => ({
            ...apt,
            child_id: child.id,
            child_name: child.full_name,
            child_avatar: child.gender === 'Female' ? '👧' : '👶',
            child_age: calculateAge(child.date_of_birth),
            parent_name: child.parent_name || 'Parent',
            parent_phone: child.phone || child.mobile,
            type: apt.clinic_name ? 'in-person' : 'telehealth',
            is_upcoming: true
          }));
          
          allAppointments = [...allAppointments, ...childAppointments];

          // Fetch vaccination schedule
          const scheduleRes = await vaccinationAPI.getSchedule(child.id);
          console.log(`Schedule for child ${child.id}:`, scheduleRes.data);
          
          const childSchedules = (scheduleRes.data.upcoming || []).map(schedule => ({
            id: `schedule-${schedule.id}`,
            child_id: child.id,
            child_name: child.full_name,
            child_avatar: child.gender === 'Female' ? '👧' : '👶',
            child_age: calculateAge(child.date_of_birth),
            vaccine_name: schedule.vaccine_name,
            dose_number: schedule.dose_number,
            due_date: schedule.scheduled_date,
            status: schedule.status,
            priority: schedule.is_mandatory ? 'high' : 'medium',
            scheduled_date: null,
            scheduled_time: null,
            doctor_name: null,
            clinic_name: null,
            location: 'To be scheduled',
            type: 'pending',
            notes: schedule.description || '',
            parent_name: child.parent_name || 'Parent',
            parent_phone: child.phone || child.mobile,
            completed_vaccines: scheduleRes.data.completed?.length || 0,
            total_vaccines: (scheduleRes.data.upcoming?.length || 0) + (scheduleRes.data.completed?.length || 0)
          }));
          
          allSchedules = [...allSchedules, ...childSchedules];

        } catch (err) {
          console.error(`Error fetching data for child ${child.id}:`, err);
        }
      }

      setAppointments(allAppointments);
      
      // Combine appointments and schedules
      const combined = [
        ...allAppointments.map(apt => ({
          id: apt.id,
          child_id: apt.child_id,
          child_name: apt.child_name,
          child_avatar: apt.child_avatar,
          child_age: apt.child_age,
          vaccine_name: apt.vaccine_name,
          dose_number: apt.dose_number,
          due_date: apt.appointment_date,
          status: getAppointmentStatus(apt.appointment_date, apt.status),
          priority: 'high',
          scheduled_date: apt.appointment_date,
          scheduled_time: apt.time_slot,
          doctor_name: apt.doctor_name,
          clinic_name: apt.clinic_name,
          location: apt.clinic_name || 'Video Call',
          type: apt.clinic_name ? 'in-person' : 'telehealth',
          notes: apt.clean_notes || apt.notes,
          parent_name: apt.parent_name,
          parent_phone: apt.parent_phone,
          reminders: true,
          completed_vaccines: apt.completed_vaccines || 0,
          total_vaccines: apt.total_vaccines || 0
        })),
        ...allSchedules
      ];

      console.log('Combined vaccinations:', combined);
      setVaccinationSchedule(combined);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load vaccination data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} months`;
    } else if (years === 1 && months === 0) {
      return '1 year';
    } else {
      return `${years} years, ${months} months`;
    }
  };

  const getAppointmentStatus = (appointmentDate, status) => {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'completed') return 'completed';
    
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate === today) return 'today';
    if (appointmentDate < today) return 'overdue';
    return 'upcoming';
  };

  // Stats calculation
  const stats = {
    today: vaccinationSchedule.filter(v => v.status === 'today').length,
    upcoming: vaccinationSchedule.filter(v => v.status === 'upcoming').length,
    overdue: vaccinationSchedule.filter(v => v.status === 'overdue').length,
    total: vaccinationSchedule.length
  };

  const handleSchedule = (vaccination) => {
    // Navigate to schedule page with pre-filled data
    toast.info(`Schedule appointment for ${vaccination.child_name}`);
    // You can navigate to the schedule page with state
    // navigate('/schedule', { state: { childId: vaccination.child_id, vaccineName: vaccination.vaccine_name } });
  };

  const handleReminder = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowReminderModal(true);
  };

  const handleMarkAsDone = async (id) => {
    try {
      // Find the appointment/schedule
      const item = vaccinationSchedule.find(v => v.id === id);
      
      if (!item) return;

      if (item.id.toString().startsWith('schedule-')) {
        // This is from schedule, need to mark as completed via record endpoint
        await vaccinationAPI.addRecord({
          child_schedule_id: item.id.replace('schedule-', ''),
          date_administered: new Date().toISOString().split('T')[0],
          clinic_name: 'Marked as completed',
          notes: 'Completed from upcoming list'
        });
        toast.success('Vaccination marked as completed!');
      } else {
        // This is an appointment, cancel it
        await vaccinationAPI.cancelAppointment(item.id);
        toast.success('Appointment completed!');
      }
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error marking as done:', error);
      toast.error('Failed to mark as completed');
    }
  };

  const handleReschedule = (vaccination) => {
    toast.info(`Rescheduling ${vaccination.child_name}'s appointment`);
    // Navigate to schedule page
  };

  const sendReminder = async () => {
    try {
      // In a real app, you'd call an API to send reminders
      toast.success(`Reminder sent to ${selectedVaccination?.parent_name || 'Parent'}`);
      setShowReminderModal(false);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'today':
        return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-200';
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-200';
      case 'overdue':
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-200';
      case 'completed':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-600 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-600 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'today':
        return '⏰';
      case 'upcoming':
        return '📅';
      case 'overdue':
        return '⚠️';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📌';
    }
  };

  const filteredVaccinations = vaccinationSchedule.filter(v => {
    const matchesSearch = (v.child_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (v.vaccine_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (v.parent_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedVaccinations = [...filteredVaccinations].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.due_date || a.scheduled_date || '2099-12-31';
      const dateB = b.due_date || b.scheduled_date || '2099-12-31';
      return new Date(dateA) - new Date(dateB);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    } else if (sortBy === 'name') {
      return (a.child_name || '').localeCompare(b.child_name || '');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading upcoming vaccinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upcoming Vaccinations</h1>
              <p className="text-primary-100">Track and manage pending vaccinations</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => toast.info('Bulk reminder feature coming soon')}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Set Reminders
              </button>
              <Link
                to="/schedule"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today</p>
              <p className="text-4xl font-bold mt-2">{stats.today}</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Upcoming</p>
              <p className="text-4xl font-bold mt-2">{stats.upcoming}</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Overdue</p>
              <p className="text-4xl font-bold mt-2">{stats.overdue}</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by child name, vaccine, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="all">All Status</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
              <ArrowPathIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus !== 'all') && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm flex items-center">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-primary-800">×</button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm flex items-center">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus('all')} className="ml-2 hover:text-primary-800">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Vaccinations List */}
      <div className="space-y-4">
        {sortedVaccinations.length > 0 ? (
          sortedVaccinations.map((vaccination, index) => (
            <div
              key={vaccination.id}
              className="card hover:scale-102 transition-all duration-500 animate-slideIn relative overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                vaccination.status === 'today' ? 'bg-green-500' :
                vaccination.status === 'upcoming' ? 'bg-blue-500' :
                vaccination.status === 'overdue' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Child Avatar and Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl">
                      {vaccination.child_avatar || '👶'}
                    </div>
                    <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                      vaccination.status === 'today' ? 'bg-green-500 animate-pulse' :
                      vaccination.status === 'upcoming' ? 'bg-blue-500' :
                      vaccination.status === 'overdue' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {vaccination.child_name}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-sm text-gray-500">{vaccination.child_age}</span>
                    </div>
                  </div>
                </div>

                {/* Vaccine Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(vaccination.status)}`}>
                      {getStatusIcon(vaccination.status)} {vaccination.status}
                    </span>
                    {vaccination.priority && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(vaccination.priority)}`}>
                        {vaccination.priority} priority
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="font-semibold text-gray-900">
                      {vaccination.vaccine_name} {vaccination.dose_number ? `(Dose ${vaccination.dose_number})` : ''}
                    </p>
                    {vaccination.doctor_name && (
                      <p className="text-sm text-gray-500">with {vaccination.doctor_name}</p>
                    )}
                  </div>
                </div>

                {/* Date and Time */}
                <div className="flex-1">
                  <div className="flex items-center text-gray-600 mb-1">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">
                      Due: {vaccination.due_date || vaccination.scheduled_date || 'Not scheduled'}
                    </span>
                  </div>
                  {vaccination.scheduled_time && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Scheduled: {vaccination.scheduled_time}</span>
                    </div>
                  )}
                </div>

                {/* Location and Type */}
                <div className="flex-1">
                  <div className="flex items-center text-gray-600 mb-1">
                    {vaccination.type === 'in-person' ? (
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    ) : (
                      <VideoCameraIcon className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span className="text-sm">{vaccination.location || 'To be determined'}</span>
                  </div>
                  {vaccination.parent_name && (
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{vaccination.parent_name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {vaccination.status === 'today' && (
                    <button
                      onClick={() => handleMarkAsDone(vaccination.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all hover:scale-110"
                      title="Mark as done"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleSchedule(vaccination)}
                    className="p-2 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200 transition-all hover:scale-110"
                    title="Schedule"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleReschedule(vaccination)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-all hover:scale-110"
                    title="Reschedule"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleReminder(vaccination)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-all hover:scale-110"
                    title="Send reminder"
                  >
                    <BellIcon className="h-5 w-5" />
                  </button>

                  <Link
                    to={`/child/${vaccination.child_id}`}
                    className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all hover:scale-110"
                    title="View profile"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Progress Bar - Only show if we have data */}
              {vaccination.total_vaccines > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Vaccination Progress</span>
                    <span className="font-medium text-primary-600">
                      {vaccination.completed_vaccines || 0}/{vaccination.total_vaccines} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${((vaccination.completed_vaccines || 0) / vaccination.total_vaccines) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Notes if any */}
              {vaccination.notes && vaccination.notes !== 'undefined' && vaccination.notes !== 'Clinic: Not specified\nDoctor: Not specified\n' && (
                <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                  📝 {vaccination.notes.replace(/Clinic: [^\n]+\n?/g, '').replace(/Doctor: [^\n]+\n?/g, '').trim()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 bg-primary-100 rounded-full blur-3xl"></div>
              </div>
              <div className="relative">
                <CalendarIcon className="mx-auto h-24 w-24 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming vaccinations</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "All vaccinations are up to date!"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedVaccination && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slideIn">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Reminder</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Send reminder to:</p>
                  <p className="font-semibold text-gray-900 mt-1">{selectedVaccination.parent_name || 'Parent'}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Regarding: {selectedVaccination.child_name}'s {selectedVaccination.vaccine_name} vaccination
                  </p>
                  {selectedVaccination.parent_phone && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedVaccination.parent_phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reminder Message
                  </label>
                  <textarea
                    rows="4"
                    className="input-field"
                    defaultValue={`Reminder: ${selectedVaccination.child_name} has an upcoming ${selectedVaccination.vaccine_name} vaccination ${selectedVaccination.due_date ? `due on ${selectedVaccination.due_date}` : ''}. Please schedule the appointment.`}
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    id="whatsapp"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="whatsapp" className="ml-2 block text-sm text-gray-700">
                    Also send via WhatsApp
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="sms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sms" className="ml-2 block text-sm text-gray-700">
                    Also send via SMS
                  </label>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={sendReminder}
                  className="flex-1 btn-primary"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingVaccinations;