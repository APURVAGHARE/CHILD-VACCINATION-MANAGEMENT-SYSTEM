import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PencilIcon, 
  TrashIcon,
  UserPlusIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { childrenAPI } from '../services/api';

const ChildList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [children, setChildren] = useState([]);
  
  // Fetch children from API
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await childrenAPI.getAll();
      setChildren(response.data.children || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load children data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (child) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await childrenAPI.delete(selectedChild.id);
      setChildren(children.filter(child => child.id !== selectedChild.id));
      toast.success(`${selectedChild.full_name}'s record removed successfully`, {
        icon: '🗑️',
      });
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('Failed to delete child record');
    } finally {
      setShowDeleteModal(false);
      setSelectedChild(null);
    }
  };

  const handleViewProfile = (childId) => {
    navigate(`/child/${childId}`);
  };

  const handleEdit = (child) => {
    navigate(`/edit-child/${child.id}`);
  };

  const handleSchedule = (child) => {
    navigate(`/schedule?child=${child.id}`);
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

  const getStatusBadge = (status) => {
    const styles = {
      today: 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-200',
      upcoming: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-200',
      overdue: 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-200',
      completed: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200'
    };
    return styles[status] || styles.upcoming;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'today': return '⏰';
      case 'upcoming': return '📅';
      case 'overdue': return '⚠️';
      case 'completed': return '✅';
      default: return '📌';
    }
  };

  const getAgeInMonths = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    return (today.getFullYear() - birthDate.getFullYear()) * 12 + 
           (today.getMonth() - birthDate.getMonth());
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, we'll use mock status - in real app, this would come from API
    const childAgeMonths = getAgeInMonths(child.date_of_birth);
    let matchesAge = true;
    if (filterAge === 'infant') {
      matchesAge = childAgeMonths < 12;
    } else if (filterAge === 'toddler') {
      matchesAge = childAgeMonths >= 12 && childAgeMonths < 36;
    } else if (filterAge === 'preschool') {
      matchesAge = childAgeMonths >= 36 && childAgeMonths < 72;
    } else if (filterAge === 'school') {
      matchesAge = childAgeMonths >= 72;
    }
    
    return matchesSearch && matchesAge;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543333995-a78aea2eee50?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                My Children
                <span className="ml-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-normal">
                  {children.length} {children.length === 1 ? 'child' : 'children'}
                </span>
              </h1>
              <p className="text-primary-100">Track and manage your children's vaccinations</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/add-child"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add New Child
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Card for New Parents */}
      {children.length === 0 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-yellow-200 flex items-center justify-center text-3xl">
              👋
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to VaccineTracker!</h2>
              <p className="text-gray-600 mb-4">Start by adding your first child to begin tracking their vaccinations.</p>
              <Link to="/add-child" className="btn-primary inline-flex items-center">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Your First Child
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {children.length > 0 && (
        <div className="card">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by child name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm"
                >
                  <option value="all">All Ages</option>
                  <option value="infant">Infants (0-12 months)</option>
                  <option value="toddler">Toddlers (1-3 years)</option>
                  <option value="preschool">Preschool (3-6 years)</option>
                  <option value="school">School Age (6+ years)</option>
                </select>
              </div>

              <div className="flex bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Children Grid/List View */}
      {children.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child, index) => {
              const age = calculateAge(child.date_of_birth);
              const avatar = child.gender === 'Female' ? '👧' : '👶';
              
              return (
                <div 
                  key={child.id} 
                  className="group card hover:scale-105 transition-all duration-500 animate-slideIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                        {avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {child.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                          {age}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                      <p className="font-semibold text-gray-900">{child.blood_group || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">{child.gender}</p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>DOB: {new Date(child.date_of_birth).toLocaleDateString('en-IN')}</span>
                  </div>

                  {/* Progress Bar - Mock for now */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Vaccination Progress</span>
                      <span className="font-bold text-primary-600">0/12</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 relative"
                        style={{ width: '0%' }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleViewProfile(child.id)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
                      title="View Profile"
                    >
                      <UserIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(child)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSchedule(child)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Schedule Appointment"
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(child)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChildren.map((child) => {
                    const age = calculateAge(child.date_of_birth);
                    const avatar = child.gender === 'Female' ? '👧' : '👶';
                    
                    return (
                      <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-xl">
                              {avatar}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{child.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{age}</div>
                          <div className="text-xs text-gray-500">{child.gender}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{child.blood_group || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(child.date_of_birth).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => handleViewProfile(child.id)} className="text-primary-600 hover:text-primary-900">
                              View
                            </button>
                            <button onClick={() => handleSchedule(child)} className="text-green-600 hover:text-green-900">
                              Schedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Empty State */}
      {filteredChildren.length === 0 && children.length > 0 && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 bg-primary-100 rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="mx-auto h-24 w-24 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No children match your search</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={`Remove ${selectedChild?.full_name}?`}
        message={`Are you sure you want to remove ${selectedChild?.full_name} from your family? Their vaccination records will be permanently deleted.`}
        type="danger"
      />
    </div>
  );
};

export default ChildList;