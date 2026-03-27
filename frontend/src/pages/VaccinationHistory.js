import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { childrenAPI, vaccinationAPI } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const VaccinationHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('all');
  const [filterChild, setFilterChild] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    totalVaccinations: 0,
    uniqueChildren: 0,
    uniqueVaccines: 0,
    averagePerChild: 0,
    thisYear: 0,
    lastYear: 0
  });

  // Chart data
  const [monthlyData, setMonthlyData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Vaccinations Administered',
        data: Array(12).fill(0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  });

  const [vaccineTypeData, setVaccineTypeData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      // Fetch all children
      const childrenResponse = await childrenAPI.getAll();
      const childrenData = childrenResponse.data.children || [];
      setChildren(childrenData);

      // Fetch vaccination history for each child
      let allHistory = [];
      let vaccineCount = {};
      let monthlyCount = Array(12).fill(0);

      for (const child of childrenData) {
        try {
          const historyResponse = await vaccinationAPI.getHistory(child.id);
          const history = historyResponse.data.history || [];
          
          // Add child details to each record
          const enrichedHistory = history.map(h => ({
            ...h,
            childId: child.id,
            childName: child.full_name,
            childAvatar: child.gender === 'Female' ? '👧' : '👶',
            age: calculateAge(child.date_of_birth, h.date_administered)
          }));

          allHistory = [...allHistory, ...enrichedHistory];

          // Count vaccines for pie chart
          enrichedHistory.forEach(h => {
            vaccineCount[h.vaccine_name] = (vaccineCount[h.vaccine_name] || 0) + 1;
            
            // Count by month
            const month = new Date(h.date_administered).getMonth();
            monthlyCount[month]++;
          });

        } catch (err) {
          console.error(`Error fetching history for child ${child.id}:`, err);
        }
      }

      // Sort by date (newest first)
      allHistory.sort((a, b) => new Date(b.date_administered) - new Date(a.date_administered));
      setVaccinationHistory(allHistory);

      // Update vaccine pie chart data
      const vaccineLabels = Object.keys(vaccineCount).slice(0, 7); // Top 7 vaccines
      const vaccineData = vaccineLabels.map(l => vaccineCount[l]);
      
      setVaccineTypeData({
        labels: vaccineLabels,
        datasets: [
          {
            data: vaccineData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(107, 114, 128, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderWidth: 0,
          },
        ],
      });

      // Update monthly chart data
      setMonthlyData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Vaccinations Administered',
            data: monthlyCount,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      });

      // Calculate stats
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      const thisYearCount = allHistory.filter(h => 
        new Date(h.date_administered).getFullYear() === currentYear
      ).length;
      
      const lastYearCount = allHistory.filter(h => 
        new Date(h.date_administered).getFullYear() === lastYear
      ).length;

      const uniqueVaccines = [...new Set(allHistory.map(h => h.vaccine_name))].length;

      setStats({
        totalVaccinations: allHistory.length,
        uniqueChildren: childrenData.length,
        uniqueVaccines: uniqueVaccines,
        averagePerChild: childrenData.length > 0 ? (allHistory.length / childrenData.length).toFixed(1) : 0,
        thisYear: thisYearCount,
        lastYear: lastYearCount
      });

    } catch (error) {
      console.error('Error fetching history data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load vaccination history');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob, vaccinationDate) => {
    const birthDate = new Date(dob);
    const vacDate = new Date(vaccinationDate);
    const diffTime = vacDate - birthDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = diffDays / 30.44;
    const diffYears = diffMonths / 12;

    if (diffYears >= 1) {
      return `${Math.floor(diffYears)} year${Math.floor(diffYears) > 1 ? 's' : ''}`;
    } else if (diffMonths >= 1) {
      return `${Math.floor(diffMonths)} month${Math.floor(diffMonths) > 1 ? 's' : ''}`;
    } else {
      return `${Math.floor(diffDays)} day${Math.floor(diffDays) > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get unique years for filter
  const years = [...new Set(vaccinationHistory.map(v => 
    new Date(v.date_administered).getFullYear().toString()
  ))].sort().reverse();

  const filteredHistory = vaccinationHistory.filter(record => {
    const matchesSearch = record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vaccine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.doctor_name && record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesYear = filterYear === 'all' || new Date(record.date_administered).getFullYear().toString() === filterYear;
    
    const matchesChild = filterChild === 'all' || record.childId === filterChild;
    
    return matchesSearch && matchesYear && matchesChild;
  });

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handlePrint = (record) => {
    toast.success(`Preparing certificate for ${record.childName}`);
    // Implement print functionality
  };

  const handleDownloadPDF = async () => {
    if (!selectedRecord) return;

    try {
      toast.info('Generating PDF certificate...');
      
      // Create a simple PDF certificate
      const doc = new jsPDF();
      
      // Add header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Vaccination Certificate', 105, 25, { align: 'center' });
      
      // Add content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Certificate of Vaccination', 105, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`This is to certify that`, 105, 80, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(selectedRecord.childName, 105, 95, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`has received the ${selectedRecord.vaccine_name} vaccination`, 105, 110, { align: 'center' });
      
      doc.text(`Date: ${formatDate(selectedRecord.date_administered)}`, 105, 125, { align: 'center' });
      
      if (selectedRecord.doctor_name) {
        doc.text(`Administered by: ${selectedRecord.doctor_name}`, 105, 140, { align: 'center' });
      }
      
      if (selectedRecord.clinic_name) {
        doc.text(`Location: ${selectedRecord.clinic_name}`, 105, 155, { align: 'center' });
      }
      
      // Add footer
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 250, 210, 40, 'F');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated certificate', 105, 270, { align: 'center' });
      doc.text(`Certificate ID: ${selectedRecord.id || 'VAC-' + Date.now()}`, 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save(`${selectedRecord.childName}_${selectedRecord.vaccine_name}_Certificate.pdf`);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate certificate');
    }
  };

  const handleShare = (record) => {
    navigator.clipboard.writeText(`Vaccination Record: ${record.childName} - ${record.vaccine_name} on ${formatDate(record.date_administered)}`);
    toast.success('Record info copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vaccination history...</p>
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
              <h1 className="text-3xl font-bold mb-2">Vaccination History</h1>
              <p className="text-primary-100">Complete record of all administered vaccinations</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={fetchHistoryData}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <DocumentTextIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.totalVaccinations}</p>
          <p className="text-xs text-gray-500">Total Vaccinations</p>
        </div>
        
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueChildren}</p>
          <p className="text-xs text-gray-500">Children</p>
        </div>
        
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <HeartIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.uniqueVaccines}</p>
          <p className="text-xs text-gray-500">Vaccine Types</p>
        </div>
        
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <SparklesIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.averagePerChild}</p>
          <p className="text-xs text-gray-500">Avg per Child</p>
        </div>
        
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <CalendarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.thisYear}</p>
          <p className="text-xs text-gray-500">This Year</p>
        </div>
        
        <div className="card text-center p-4 hover:scale-105 transition-all">
          <ArrowPathIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats.lastYear}</p>
          <p className="text-xs text-gray-500">Last Year</p>
        </div>
      </div>

      {/* Charts Row */}
      {vaccinationHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
            <div className="h-64">
              <Bar data={monthlyData} options={chartOptions} />
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vaccine Distribution</h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={vaccineTypeData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by child, vaccine, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterChild}
                onChange={(e) => setFilterChild(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="all">All Children</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.full_name}</option>
                ))}
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

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredHistory.length} of {vaccinationHistory.length} records
        </div>
      </div>

      {/* History Grid/List View */}
      {filteredHistory.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((record, index) => (
              <div
                key={record.id || index}
                className="card hover:scale-105 transition-all duration-500 animate-slideIn cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleViewDetails(record)}
              >
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl">
                    {record.childAvatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.childName}</h3>
                    <p className="text-xs text-gray-500">Age: {record.age}</p>
                  </div>
                </div>

                {/* Vaccine Info */}
                <div className="bg-primary-50 p-3 rounded-xl mb-3">
                  <p className="text-xs text-primary-600 font-semibold">VACCINE</p>
                  <p className="font-bold text-gray-900">{record.vaccine_name}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(record.date_administered)}
                  </div>
                  {record.doctor_name && (
                    <div className="flex items-center text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {record.doctor_name}
                    </div>
                  )}
                  {record.clinic_name && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {record.clinic_name}
                    </div>
                  )}
                </div>

                {/* Certificate ID */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">ID: {record.id?.substring(0,8) || 'N/A'}</span>
                  <span className="text-xs text-green-600 flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrint(record); }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSelectedRecord(record);
                      handleDownloadPDF();
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Download PDF"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(record); }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Share"
                  >
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(record)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-lg">
                            {record.childAvatar}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{record.childName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.vaccine_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.date_administered)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.doctor_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.clinic_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handlePrint(record)} className="text-gray-600 hover:text-primary-600">
                            <PrinterIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRecord(record);
                              handleDownloadPDF();
                            }} 
                            className="text-gray-600 hover:text-primary-600"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 bg-primary-100 rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <DocumentTextIcon className="mx-auto h-24 w-24 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No vaccination records found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                {searchTerm || filterYear !== 'all' || filterChild !== 'all'
                  ? "Try adjusting your search or filters"
                  : "No vaccination records available. Add a child and record their vaccinations."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Vaccination Certificate</h2>
                  <p className="text-primary-100">Record ID: {selectedRecord.id?.substring(0,8) || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Child Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-3xl">
                  {selectedRecord.childAvatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedRecord.childName}</h3>
                  <p className="text-gray-600">Age at vaccination: {selectedRecord.age}</p>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Vaccine Name</p>
                  <p className="font-semibold text-gray-900">{selectedRecord.vaccine_name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Date Administered</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedRecord.date_administered)}</p>
                </div>
                {selectedRecord.doctor_name && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Administered By</p>
                    <p className="font-semibold text-gray-900">{selectedRecord.doctor_name}</p>
                  </div>
                )}
                {selectedRecord.clinic_name && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedRecord.clinic_name}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Notes</p>
                  <p className="text-sm text-yellow-700">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDownloadPDF();
                  }}
                  className="flex-1 btn-primary"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline-block" />
                  Download Certificate
                </button>
                <button 
                  onClick={() => {
                    handlePrint(selectedRecord);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 btn-secondary"
                >
                  <PrinterIcon className="h-5 w-5 mr-2 inline-block" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationHistory;