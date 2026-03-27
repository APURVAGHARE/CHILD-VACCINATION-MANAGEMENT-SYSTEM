import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  BellAlertIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { authAPI, childrenAPI, vaccinationAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [stats, setStats] = useState({
    childrenCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    dueTodayCount: 0
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchChildrenData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      // Fetch children
      const childrenResponse = await childrenAPI.getAll();
      const childrenData = childrenResponse.data.children || [];
      setChildren(childrenData);

      // Fetch upcoming vaccinations for each child
      let allUpcoming = [];
      let completedCount = 0;
      let dueTodayCount = 0;

      for (const child of childrenData) {
        try {
          const scheduleResponse = await vaccinationAPI.getSchedule(child.id);
          const upcoming = scheduleResponse.data.upcoming || [];
          allUpcoming = [...allUpcoming, ...upcoming];

          // Count completed and due today
          const historyResponse = await vaccinationAPI.getHistory(child.id);
          completedCount += historyResponse.data.completed?.length || 0;
          
          dueTodayCount += upcoming.filter(v => {
            const today = new Date().toISOString().split('T')[0];
            return v.scheduled_date === today;
          }).length;
        } catch (err) {
          console.error(`Error fetching data for child ${child.id}:`, err);
        }
      }

      setUpcomingVaccinations(allUpcoming.slice(0, 5)); // Show only 5 recent

      setStats({
        childrenCount: childrenData.length,
        upcomingCount: allUpcoming.length,
        completedCount,
        dueTodayCount
      });

    } catch (error) {
      console.error('Error fetching children data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Stats Cards Data - Dynamic from API
  const statCards = [
    { 
      name: 'My Children', 
      value: stats.childrenCount.toString(), 
      icon: UserGroupIcon, 
      change: children.map(c => c.full_name.split(' ')[0]).join(' & ') || 'No children yet',
      changeType: 'info',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Upcoming Vaccines', 
      value: stats.upcomingCount.toString(), 
      icon: CalendarIcon, 
      change: stats.upcomingCount > 0 ? `Next: ${upcomingVaccinations[0]?.vaccine_name || 'N/A'}` : 'No upcoming',
      changeType: 'info',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Completed Vaccines', 
      value: stats.completedCount.toString(), 
      icon: DocumentCheckIcon, 
      change: `${stats.completedCount} vaccine${stats.completedCount !== 1 ? 's' : ''} completed`,
      changeType: 'info',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Due Today', 
      value: stats.dueTodayCount.toString(), 
      icon: ClockIcon, 
      change: stats.dueTodayCount > 0 ? `${stats.dueTodayCount} vaccine${stats.dueTodayCount !== 1 ? 's' : ''} today` : 'No vaccines today',
      changeType: stats.dueTodayCount > 0 ? 'urgent' : 'info',
      color: stats.dueTodayCount > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'
    },
  ];

  // Chart Data - You can make these dynamic later
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Vaccinations',
        data: [2, 1, 3, 2, 2, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const vaccineDistribution = {
    labels: ['BCG', 'Polio', 'DTaP', 'Hep B', 'MMR', 'Others'],
    datasets: [
      {
        data: [2, 3, 2, 2, 1, 2],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const getStatusBadge = (status) => {
    const styles = {
      today: 'bg-red-100 text-red-800 border border-red-200',
      upcoming: 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
    };
    return styles[status] || styles.upcoming;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'today': return '⏰';
      case 'upcoming': return '📅';
      case 'completed': return '✅';
      default: return '📌';
    }
  };

  // Alert handlers with actual navigation
  const handleJoinCall = () => {
    navigate('/upcoming');
  };

  const handleScheduleNow = () => {
    navigate('/schedule');
  };

  const handleViewAllChildren = () => {
    navigate('/children');
  };

  const handleViewAllUpcoming = () => {
    navigate('/upcoming');
  };

  const handleAddChild = () => {
    navigate('/add-child');
  };

  const handleViewSchedule = () => {
    navigate('/schedule');
  };

  const handleViewGuide = () => {
    navigate('/guide');
  };

  const handleStatClick = (stat) => {
    if (stat.name === 'My Children') {
      navigate('/children');
    } else if (stat.name === 'Upcoming Vaccines') {
      navigate('/upcoming');
    } else if (stat.name === 'Completed Vaccines') {
      navigate('/history');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Welcome Message */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                Welcome back, {user?.full_name || 'Parent'}! 👋
                <SparklesIcon className="h-6 w-6 ml-2 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-primary-100 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-red-300" />
                Here's how your children's vaccinations are progressing
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={() => toast.info('You have no new notifications')}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-xl transition-all duration-300"
              >
                <BellAlertIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={stat.name} 
            className="group relative animate-slideIn cursor-pointer" 
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleStatClick(stat)}
          >
            <div className="card h-full transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-sm font-medium truncate ${
                  stat.changeType === 'urgent' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions for Parents */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.slice(0, 2).map((child, index) => (
            <div key={child.id} className={`card bg-gradient-to-r ${index === 0 ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{child.full_name}'s {index === 0 ? 'Vaccine Today!' : 'Next Vaccine'}</h3>
                  <p className="text-sm opacity-90 mb-2">
                    {index === 0 ? 'Polio vaccine at 2:30 PM' : 'MMR vaccine on March 15'}
                  </p>
                  <div className="flex items-center text-sm">
                    {index === 0 ? (
                      <ClockIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <CalendarIcon className="h-4 w-4 mr-1" />
                    )}
                    <span>{index === 0 ? 'Dr. Rajesh Kumar • Video Call' : 'Dr. Priya Singh • In-person'}</span>
                  </div>
                  <button 
                    onClick={index === 0 ? handleJoinCall : handleScheduleNow}
                    className="mt-4 bg-white text-green-600 px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all"
                  >
                    {index === 0 ? 'Join Call' : 'Schedule Now'}
                  </button>
                </div>
                <div className="text-7xl">{index === 0 ? '👶' : '👧'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="card hover:shadow-2xl transition-all duration-500 cursor-pointer"
          onClick={() => navigate('/reports')}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vaccines This Year</h2>
          <div className="h-64">
            <Bar data={monthlyData} options={chartOptions} />
          </div>
        </div>
        
        <div 
          className="card hover:shadow-2xl transition-all duration-500 cursor-pointer"
          onClick={() => navigate('/reports')}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vaccine Distribution</h2>
          <div className="h-64">
            <Doughnut data={vaccineDistribution} options={{
              ...chartOptions,
              cutout: '60%',
            }} />
          </div>
        </div>
      </div>

      {/* My Children Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Children */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Children</h2>
            <button 
              onClick={handleViewAllChildren}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium group flex items-center"
            >
              View all
              <ArrowTrendingUpIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {children.length > 0 ? (
              children.map((child, index) => (
                <div 
                  key={child.id} 
                  className="group flex items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/child/${child.id}`)}
                >
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl">
                    {child.gender === 'Female' ? '👧' : '👶'}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{child.full_name}</h3>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-600">
                        {Math.floor((new Date() - new Date(child.date_of_birth)) / (1000 * 60 * 60 * 24 * 365))} years
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Blood Group: {child.blood_group || 'Not specified'}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      DOB: {new Date(child.date_of_birth).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <Link to={`/child/${child.id}`} className="ml-4 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No children added yet</p>
                <Link to="/add-child" className="btn-primary inline-flex items-center">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Child
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Vaccinations */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Vaccines</h2>
            <button 
              onClick={handleViewAllUpcoming}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium group flex items-center"
            >
              View all
              <ArrowTrendingUpIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingVaccinations.length > 0 ? (
              upcomingVaccinations.map((item, index) => {
                const child = children.find(c => c.id === item.child_id);
                const isToday = new Date(item.scheduled_date).toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index} 
                    className="group flex items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/upcoming')}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl
                                  ${isToday ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
                      {isToday ? '⏰' : '📅'}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{child?.full_name || 'Unknown'}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center ${
                          isToday ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {isToday ? 'Today' : new Date(item.scheduled_date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.vaccine_name} vaccination</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming vaccinations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white transform hover:scale-105 transition-all duration-500 cursor-pointer"
             onClick={handleAddChild}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Add New Child</h3>
              <p className="text-sm opacity-90 mb-4">Track vaccinations for another child</p>
              <Link to="/add-child" className="inline-block bg-white text-primary-600 px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg">
                + Add Child
              </Link>
            </div>
            <UserPlusIcon className="h-16 w-16 opacity-30" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white transform hover:scale-105 transition-all duration-500 cursor-pointer"
             onClick={handleViewSchedule}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">View Schedule</h3>
              <p className="text-sm opacity-90 mb-4">See all upcoming appointments</p>
              <Link to="/schedule" className="inline-block bg-white text-green-600 px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg">
                View Calendar
              </Link>
            </div>
            <CalendarIcon className="h-16 w-16 opacity-30" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-500 cursor-pointer"
             onClick={handleViewGuide}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vaccine Guide</h3>
              <p className="text-sm opacity-90 mb-4">Learn about each vaccine</p>
              <Link to="/guide" className="inline-block bg-white text-purple-600 px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg">
                Read Guide
              </Link>
            </div>
            <DocumentCheckIcon className="h-16 w-16 opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;