import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';  // Go up two levels: components/Layout -> components -> src -> services
const Navbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: '💉 Aaradhya - MMR vaccine due tomorrow', date: '2024-03-14', read: false, type: 'urgent' },
    { id: 2, text: '✅ Vihaan\'s vaccination completed today', date: '2024-03-10', read: false, type: 'success' },
    { id: 3, text: '📊 Monthly report ready for your family', date: '2024-03-01', read: true, type: 'info' },
    { id: 4, text: '⚠️ 2 vaccinations need scheduling', date: '2024-03-05', read: false, type: 'warning' },
  ]);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.info('Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/children?search=${searchQuery}`);
      toast.info(`Searching for "${searchQuery}"...`);
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    toast.info('Opening all notifications');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'urgent':
        return '🔴';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return '📌';
    }
  };

  const getTimeAgo = (date) => {
    const given = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - given);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays/7)} weeks ago`;
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'add':
        navigate('/add-child');
        toast.info('Opening Add Child form');
        break;
      case 'schedule':
        navigate('/schedule');
        toast.info('Opening Vaccination Schedule');
        break;
      case 'report':
        navigate('/reports');
        toast.info('Opening Reports');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Get first name for greeting
  const getFirstName = (fullName) => {
    return fullName ? fullName.split(' ')[0] : 'Parent';
  };

  // Get avatar based on gender (if available) or default
  const getAvatar = () => {
    return '👩'; // Default, you can make this dynamic based on user's gender
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200/50 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Left section */}
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="text-gray-500 hover:text-primary-600 lg:hidden mr-4 p-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
              title="Toggle Sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Welcome message - Dynamic User Name */}
            <div className="hidden lg:block">
              <h2 className="text-sm text-gray-500">Welcome back,</h2>
              <p className="text-lg font-semibold text-gray-900 flex items-center">
                {user?.full_name || 'Parent'}! 👋
                <HeartIcon className="h-5 w-5 text-red-500 ml-2 animate-pulse" />
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-lg ml-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search your children, vaccines, or records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-4 focus:ring-primary-200 
                           focus:border-primary-500 transition-all duration-300
                           bg-gray-50 group-hover:bg-white"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </form>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions Dropdown */}
            <Menu as="div" className="relative hidden lg:block">
              <Menu.Button className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all duration-300">
                <span className="text-sm font-semibold">Quick Actions</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleQuickAction('add')}
                        className={`w-full text-left px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors flex items-center`}
                      >
                        <span className="mr-3">👶</span>
                        Add New Child
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleQuickAction('schedule')}
                        className={`w-full text-left px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors flex items-center`}
                      >
                        <span className="mr-3">📅</span>
                        Schedule Vaccination
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleQuickAction('report')}
                        className={`w-full text-left px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors flex items-center`}
                      >
                        <span className="mr-3">📊</span>
                        Generate Report
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-3 text-gray-500 hover:text-primary-600 
                                     transition-all duration-300 rounded-xl hover:bg-primary-50
                                     group">
                <BellIcon className="h-6 w-6 group-hover:animate-wiggle" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 
                                 text-white text-xs flex items-center justify-center 
                                 rounded-full animate-pulse shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-96 bg-white rounded-2xl 
                                     shadow-2xl py-2 z-50 border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`w-full text-left px-6 py-4 hover:bg-gray-50 
                                       transition-all duration-200 border-b border-gray-50 last:border-0
                                       ${!notification.read ? 'bg-primary-50/30' : ''}`}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 font-medium">{notification.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.date)}</p>
                                </div>
                                {!notification.read && (
                                  <span className="h-2 w-2 bg-primary-600 rounded-full mt-2"></span>
                                )}
                              </div>
                            </button>
                          )}
                        </Menu.Item>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No new notifications
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-100 px-6 py-3">
                    <button 
                      onClick={handleViewAllNotifications}
                      className="text-sm text-primary-600 hover:text-primary-700 
                                     font-medium w-full text-center"
                    >
                      View all notifications
                    </button>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            
            {/* Profile Menu - Dynamic User Data */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 p-2 rounded-xl 
                                   hover:bg-primary-50 transition-all duration-300 group">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r 
                                from-pink-500 to-purple-600 flex items-center 
                                justify-center text-white font-bold text-xl
                                ring-4 ring-pink-100 group-hover:ring-pink-200 transition-all">
                    {getAvatar()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 
                                 rounded-full ring-2 ring-white"></span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Parent'}</p>
                  <p className="text-xs text-gray-500">
                    {user?.mobile ? `📱 ${user.mobile}` : 'Parent Account'}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 
                                         transition-colors hidden lg:block" />
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-64 bg-white rounded-2xl 
                                     shadow-2xl py-2 z-50 border border-gray-100">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Parent'}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email || 'email@example.com'}</p>
                    {user?.mobile && (
                      <p className="text-xs text-primary-600 mt-2">📱 {user.mobile}</p>
                    )}
                  </div>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`block px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors`}
                        onClick={() => toast.info('Opening profile')}
                      >
                        <div className="flex items-center">
                          <UserCircleIcon className="h-5 w-5 mr-3" />
                          My Profile
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`block px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors`}
                        onClick={() => toast.info('Opening settings')}
                      >
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/family"
                        className={`block px-4 py-3 text-sm ${
                          active ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        } transition-colors`}
                        onClick={() => toast.info('Viewing family members')}
                      >
                        <div className="flex items-center">
                          <HeartIcon className="h-5 w-5 mr-3" />
                          My Family
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-3 text-sm ${
                          active ? 'bg-red-50 text-red-600' : 'text-red-600'
                        } transition-colors`}
                      >
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;