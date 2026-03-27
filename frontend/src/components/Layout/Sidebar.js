import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,  // Added for clinics
  SparklesIcon         // Added for AI indicator
} from '@heroicons/react/24/outline';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [childrenCount, setChildrenCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showAIIndicator, setShowAIIndicator] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setChildrenCount(parsedUser.children_count || 0);
      setUpcomingCount(parsedUser.appointments_count || 0);
    }

    // Check if AI mode was last used (you can store this in localStorage)
    const aiMode = localStorage.getItem('aiMode') === 'true';
    setShowAIIndicator(aiMode);
  }, []);

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, path: '/', color: 'from-blue-500 to-blue-600' },
    { name: 'My Children', icon: UsersIcon, path: '/children', color: 'from-green-500 to-green-600' },
    { name: 'Add Child', icon: UserPlusIcon, path: '/add-child', color: 'from-purple-500 to-purple-600' },
    { name: 'Vaccination Schedule', icon: CalendarIcon, path: '/schedule', color: 'from-orange-500 to-orange-600' },
    { name: 'Upcoming Shots', icon: ClockIcon, path: '/upcoming', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Health Records', icon: DocumentTextIcon, path: '/history', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Reports', icon: ChartBarIcon, path: '/reports', color: 'from-pink-500 to-pink-600' },
    // NEW: Nearby Clinics with AI badge
    { 
      name: 'Nearby Clinics', 
      icon: BuildingOfficeIcon, 
      path: '/nearby-clinics', 
      color: 'from-teal-500 to-teal-600',
      badge: 'AI' 
    },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings', color: 'from-gray-500 to-gray-600' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get first name for display
  const getFirstName = (fullName) => {
    return fullName ? fullName.split(' ')[0] : 'Parent';
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden z-50
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-500 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Gradient Background with Animation */}
        <div className="relative h-full overflow-hidden">
          {/* Animated Background - PARENT FRIENDLY IMAGE */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
            {/* Animated circles */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col">
            {/* Logo Section */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-20 px-4 border-b border-white/20`}>
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse-slow">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">VaccineTracker</h2>
                    <p className="text-xs text-primary-200">For Parents</p>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
              )}
              
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-white/20">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        setSidebarOpen(false);
                        // If this is the Nearby Clinics link and it has AI badge, you might want to set a flag
                        if (item.badge === 'AI') {
                          // Optional: Set some context for AI mode
                        }
                      }}
                      className={({ isActive }) =>
                        `group relative flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl
                         transition-all duration-300 overflow-hidden
                         ${isActive 
                           ? 'bg-white text-primary-600 shadow-lg' 
                           : 'text-primary-100 hover:bg-white/10 hover:text-white'
                         }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`}></div>
                          )}
                          
                          {/* Icon */}
                          <div className={`relative ${isActive ? 'text-primary-600' : 'text-primary-200 group-hover:text-white'}`}>
                            <item.icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 
                                              ${isActive ? 'animate-pulse' : ''}`} />
                          </div>
                          
                          {/* Label with AI Badge */}
                          {!isCollapsed && (
                            <div className="ml-4 text-sm font-medium relative flex items-center justify-between w-full">
                              <span>{item.name}</span>
                              {item.badge === 'AI' && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] rounded-full flex items-center">
                                  <SparklesIcon className="h-3 w-3 mr-0.5" />
                                  AI
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Tooltip for collapsed mode */}
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded 
                                        opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                        transition-all duration-300 whitespace-nowrap z-50 flex items-center">
                              {item.name}
                              {item.badge === 'AI' && (
                                <span className="ml-1 px-1 bg-purple-500 text-white text-[10px] rounded flex items-center">
                                  <SparklesIcon className="h-2 w-2 mr-0.5" />
                                  AI
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Active Dot */}
                          {isActive && !isCollapsed && (
                            <span className="absolute right-3 h-2 w-2 rounded-full bg-primary-600 animate-ping"></span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Profile Section - Dynamic User Data */}
            <div className={`p-4 border-t border-white/20 ${isCollapsed ? 'text-center' : ''}`}>
              <div className={`flex ${isCollapsed ? 'flex-col' : 'items-center'} space-y-2`}>
                <div className="relative group">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 
                                flex items-center justify-center text-white font-bold text-lg
                                ring-4 ring-white/20 group-hover:ring-white/40 transition-all">
                    👩
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 
                                 rounded-full ring-2 ring-white"></span>
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 ml-3">
                    <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Parent'}</p>
                    <p className="text-xs text-primary-200 truncate">
                      {user?.mobile ? `📱 ${user.mobile}` : 'Parent Account'}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats - Dynamic from user data */}
              {!isCollapsed && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <p className="text-xs text-primary-200">My Kids</p>
                    <p className="text-lg font-bold text-white">{childrenCount}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                    <p className="text-xs text-primary-200">Upcoming</p>
                    <p className="text-lg font-bold text-white">{upcomingCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-20 left-0 w-full pointer-events-none">
              <HeartIcon className="h-16 w-16 text-white/5 mx-auto animate-pulse-slow" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;