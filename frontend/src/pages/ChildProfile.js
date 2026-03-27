import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PencilIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  PrinterIcon,
  ShareIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { childrenAPI, vaccinationAPI } from '../services/api';

const ChildProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    completedVaccines: 0,
    totalVaccines: 0,
    upcomingCount: 0
  });

  // Fetch child data on component mount
  useEffect(() => {
    fetchChildData();
  }, [id]);

  const fetchChildData = async () => {
    setLoading(true);
    try {
      // Fetch child details
      const childResponse = await childrenAPI.getById(id);
      setChild(childResponse.data.child);

      // Fetch vaccination schedule
      const scheduleResponse = await vaccinationAPI.getSchedule(id);
      
      // Separate upcoming and completed
      const upcoming = scheduleResponse.data.upcoming || [];
      const completed = scheduleResponse.data.completed || [];
      
      setUpcomingVaccinations(upcoming);
      setVaccinationHistory(completed);

      setStats({
        completedVaccines: completed.length,
        totalVaccines: upcoming.length + completed.length,
        upcomingCount: upcoming.length
      });

    } catch (error) {
      console.error('Error fetching child data:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Child not found');
        navigate('/children');
      } else {
        toast.error('Failed to load child data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'due':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print preview opened');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!');
  };

  const handleReminder = () => {
    if (upcomingVaccinations.length > 0) {
      const nextVaccine = upcomingVaccinations[0];
      toast.success(`Reminder set for ${nextVaccine.vaccine_name} on ${new Date(nextVaccine.scheduled_date).toLocaleDateString('en-IN')}`);
    } else {
      toast.info('No upcoming vaccinations to set reminder for');
    }
  };

  const handleSchedule = () => {
    navigate('/schedule');
  };

  const handleEdit = () => {
    navigate(`/edit-child/${id}`);
  };

  const handleContactDoctor = () => {
    // This would open a modal or navigate to contact page
    toast.info('Contact doctor feature coming soon');
  };

  const handleViewCertificate = (vaccine) => {
    toast.info(`Certificate for ${vaccine.vaccine_name} will be available soon`);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading child profile...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 bg-primary-100 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <UserIcon className="mx-auto h-24 w-24 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Child not found</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              The child you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => navigate('/children')}
              className="mt-6 btn-primary"
            >
              Back to My Children
            </button>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(child.date_of_birth);
  const avatar = child.gender === 'Female' ? '👧' : '👶';

  return (
    <div className="space-y-8">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to My Children
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handleReminder}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="Set Reminder"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="Print Records"
          >
            <PrinterIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="Share with Doctor"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            title="Edit Profile"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleSchedule}
            className="btn-primary flex items-center"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule Vaccine
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-6xl border-4 border-white/50 shadow-2xl">
                {avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{child.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-primary-100">
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Born: {formatDate(child.date_of_birth)} ({age})
                </span>
                <span className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  Blood Group: {child.blood_group || 'Not specified'}
                </span>
                <span className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {child.gender}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{stats.completedVaccines}</p>
                <p className="text-xs text-primary-100">Completed</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-3xl font-bold text-white">{stats.upcomingCount}</p>
                <p className="text-xs text-primary-100">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'vaccines', 'appointments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 relative font-medium text-sm transition-colors capitalize
                ${activeTab === tab 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Child Card */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <HeartIcon className="h-5 w-5 text-primary-600 mr-2" />
                  About {child.full_name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{child.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900">{formatDate(child.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">{age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Blood Group</p>
                    <p className="font-medium text-gray-900">{child.blood_group || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{child.gender}</p>
                  </div>
                </div>
              </div>

              {/* Vaccination Progress Card */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vaccination Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-bold text-primary-600">
                        {stats.completedVaccines}/{stats.totalVaccines} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                        style={{ width: stats.totalVaccines > 0 ? `${(stats.completedVaccines / stats.totalVaccines) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.completedVaccines}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.upcomingCount}</p>
                      <p className="text-xs text-gray-600">Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Next Upcoming Vaccine */}
              {upcomingVaccinations.length > 0 && (
                <div className="card border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Vaccine</h3>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900">{upcomingVaccinations[0].vaccine_name}</p>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-600">
                        {formatDate(upcomingVaccinations[0].scheduled_date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Dose {upcomingVaccinations[0].dose_number || 1}</p>
                    <button 
                      onClick={handleSchedule}
                      className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-all"
                    >
                      Schedule Now
                    </button>
                  </div>
                </div>
              )}

              {/* Tips Card */}
              <div className="card bg-yellow-50 border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">💡 Parent Tips</h3>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Bring vaccination card to appointments</li>
                  <li>• Dress your child in comfortable clothes</li>
                  <li>• Ask doctor about possible side effects</li>
                  <li>• Give extra cuddles after shots</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Vaccines Tab */}
        {activeTab === 'vaccines' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-3xl font-bold text-green-700">{stats.completedVaccines}</p>
              </div>
              <div className="card bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-600">Upcoming</p>
                <p className="text-3xl font-bold text-blue-700">{stats.upcomingCount}</p>
              </div>
              <div className="card bg-purple-50 border border-purple-200">
                <p className="text-sm text-purple-600">Total Needed</p>
                <p className="text-3xl font-bold text-purple-700">{stats.totalVaccines}</p>
              </div>
            </div>

            {/* Vaccination History Table */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vaccination Record</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Completed Vaccinations */}
                    {vaccinationHistory.map((vaccine, index) => (
                      <tr key={`completed-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {vaccine.vaccine_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(vaccine.date_administered)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dose {vaccine.dose_number || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewCertificate(vaccine)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Upcoming Vaccinations */}
                    {upcomingVaccinations.map((vaccine, index) => (
                      <tr key={`upcoming-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {vaccine.vaccine_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(vaccine.scheduled_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dose {vaccine.dose_number || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-400">Not available</span>
                        </td>
                      </tr>
                    ))}

                    {vaccinationHistory.length === 0 && upcomingVaccinations.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No vaccination records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            
            {upcomingVaccinations.length > 0 ? (
              <div className="space-y-4">
                {upcomingVaccinations.map((appointment, index) => {
                  const isToday = new Date(appointment.scheduled_date).toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate('/schedule')}
                    >
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl ${
                        isToday ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                      }`}>
                        {isToday ? '⏰' : '📅'}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{appointment.vaccine_name}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            isToday ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {isToday ? 'Today' : formatDate(appointment.scheduled_date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Dose {appointment.dose_number || 1}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSchedule();
                        }}
                        className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm"
                      >
                        {isToday ? 'Join' : 'Schedule'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-500 mb-4">Schedule your child's next vaccination</p>
                <button onClick={handleSchedule} className="btn-primary">Schedule Now</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildProfile;