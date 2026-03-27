 import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Reports = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildReport, setShowChildReport] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const reportCardRef = useRef(null);

  // Sample children data with vaccination records
  const children = [
    {
      id: 1,
      name: 'Emma Watson',
      avatar: '👧',
      dob: '2022-03-15',
      age: '2 years',
      gender: 'Female',
      bloodGroup: 'A+',
      parentName: 'Sarah Watson',
      parentPhone: '+1 (234) 567-8901',
      parentEmail: 'sarah.w@email.com',
      address: '123 Main St, New York, NY 10001',
      pediatrician: 'Dr. Sarah Smith',
      completedVaccines: 8,
      totalVaccines: 12,
      lastVisit: '2024-02-15',
      nextVisit: '2024-03-15',
      vaccinations: [
        { name: 'BCG', date: '2022-03-16', status: 'completed', dose: 1, batch: 'BCG20220315' },
        { name: 'Hepatitis B', date: '2022-03-16', status: 'completed', dose: 1, batch: 'HEP20220315' },
        { name: 'Hepatitis B', date: '2022-05-15', status: 'completed', dose: 2, batch: 'HEP20220510' },
        { name: 'Polio (OPV)', date: '2022-05-15', status: 'completed', dose: 1, batch: 'POL20220510' },
        { name: 'DTaP', date: '2022-05-15', status: 'completed', dose: 1, batch: 'DTA20220510' },
        { name: 'Rotavirus', date: '2022-05-15', status: 'completed', dose: 1, batch: 'ROT20220510' },
        { name: 'PCV', date: '2022-05-15', status: 'completed', dose: 1, batch: 'PCV20220510' },
        { name: 'DTaP', date: '2022-07-20', status: 'completed', dose: 2, batch: 'DTA20220715' },
        { name: 'Polio (OPV)', date: '2024-03-15', status: 'upcoming', dose: 3 },
        { name: 'MMR', date: '2024-04-10', status: 'upcoming', dose: 1 },
      ]
    },
    {
      id: 2,
      name: 'Noah Smith',
      avatar: '👶',
      dob: '2023-09-10',
      age: '6 months',
      gender: 'Male',
      bloodGroup: 'O+',
      parentName: 'John Smith',
      parentPhone: '+1 (234) 567-8902',
      parentEmail: 'john.s@email.com',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      pediatrician: 'Dr. Michael Chen',
      completedVaccines: 4,
      totalVaccines: 8,
      lastVisit: '2024-02-10',
      nextVisit: '2024-03-10',
      vaccinations: [
        { name: 'BCG', date: '2023-09-11', status: 'completed', dose: 1, batch: 'BCG20230910' },
        { name: 'Hepatitis B', date: '2023-09-11', status: 'completed', dose: 1, batch: 'HEP20230910' },
        { name: 'DTaP', date: '2023-11-15', status: 'completed', dose: 1, batch: 'DTA20231110' },
        { name: 'Polio (OPV)', date: '2023-11-15', status: 'completed', dose: 1, batch: 'POL20231110' },
        { name: 'Rotavirus', date: '2024-01-20', status: 'completed', dose: 2, batch: 'ROT20240115' },
        { name: 'DTaP', date: '2024-03-10', status: 'today', dose: 2 },
        { name: 'Polio (OPV)', date: '2024-03-10', status: 'today', dose: 2 },
      ]
    },
    {
      id: 3,
      name: 'Olivia Johnson',
      avatar: '👧',
      dob: '2020-02-28',
      age: '4 years',
      gender: 'Female',
      bloodGroup: 'B+',
      parentName: 'Mike Johnson',
      parentPhone: '+1 (234) 567-8903',
      parentEmail: 'mike.j@email.com',
      address: '789 Pine Rd, Chicago, IL 60007',
      pediatrician: 'Dr. Emily Brown',
      completedVaccines: 10,
      totalVaccines: 14,
      lastVisit: '2024-01-28',
      nextVisit: '2024-03-20',
      vaccinations: [
        { name: 'BCG', date: '2020-02-29', status: 'completed', dose: 1, batch: 'BCG20200228' },
        { name: 'Hepatitis B', date: '2020-02-29', status: 'completed', dose: 1, batch: 'HEP20200228' },
        { name: 'DTaP', date: '2020-04-28', status: 'completed', dose: 1, batch: 'DTA20200425' },
        { name: 'MMR', date: '2021-03-01', status: 'completed', dose: 1, batch: 'MMR20210225' },
        { name: 'Varicella', date: '2021-03-01', status: 'completed', dose: 1, batch: 'VAR20210225' },
        { name: 'DTaP', date: '2024-02-28', status: 'overdue', dose: 4 },
        { name: 'MMR', date: '2024-03-20', status: 'upcoming', dose: 2 },
      ]
    },
  ];

  // Sample report data
  const reports = [
    {
      id: 1,
      name: 'Monthly Vaccination Summary',
      type: 'summary',
      date: '2024-03-01',
      format: 'PDF',
      size: '2.4 MB',
      pages: 12,
      description: 'Complete summary of all vaccinations administered in March 2024',
      thumbnail: '📊'
    },
    {
      id: 2,
      name: 'Children Registration Report',
      type: 'demographic',
      date: '2024-03-01',
      format: 'Excel',
      size: '1.8 MB',
      pages: 8,
      description: 'Detailed report of all registered children with demographic data',
      thumbnail: '👥'
    },
    {
      id: 3,
      name: 'Vaccination Coverage Analysis',
      type: 'analytics',
      date: '2024-02-28',
      format: 'PDF',
      size: '3.2 MB',
      pages: 15,
      description: 'Analysis of vaccination coverage rates by age group and region',
      thumbnail: '📈'
    },
  ];

  // Chart data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Vaccinations Administered',
        data: [450, 520, 610, 580, 630, 720, 680, 750, 820, 790, 850, 910],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const vaccineCoverageData = {
    labels: ['BCG', 'Polio', 'DTaP', 'MMR', 'Hepatitis B', 'Rotavirus', 'PCV', 'Influenza'],
    datasets: [
      {
        label: 'Coverage Rate (%)',
        data: [98, 95, 92, 88, 94, 86, 89, 72],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const ageGroupData = {
    labels: ['0-1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years'],
    datasets: [
      {
        label: 'Children',
        data: [245, 312, 458, 367, 189],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
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

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Report generated successfully!');
    }, 2000);
  };

  const handleViewChildReport = (child) => {
    setSelectedChild(child);
    setShowChildReport(true);
  };

  const handleDownloadPDF = async () => {
    if (!reportCardRef.current) return;

    try {
      toast.info('Generating PDF...');
      
      // Capture the report card as canvas
      const canvas = await html2canvas(reportCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      pdf.save(`${selectedChild.name}_Vaccination_Report.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Report link copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'upcoming':
        return 'bg-blue-100 text-blue-600';
      case 'today':
        return 'bg-green-100 text-green-600 animate-pulse';
      case 'overdue':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-primary-100">Generate and download vaccination reports</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate New
                  </>
                )}
              </button>
              <button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
        {['summary', 'demographic', 'analytics', 'alerts', 'child-cards'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${reportType === type 
                ? 'bg-white shadow-md text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Date Range Selector */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <input type="date" className="input-field w-auto" />
                <span>to</span>
                <input type="date" className="input-field w-auto" />
              </>
            )}
          </div>

          <div className="flex space-x-2">
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <PrinterIcon className="h-5 w-5" />
            </button>
            <button onClick={handleShare} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <ShareIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Child Report Cards Section */}
      {reportType === 'child-cards' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Child Vaccination Report Cards</h2>
          <p className="text-gray-600">Click on any child to view and download their complete vaccination report</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, index) => (
              <div
                key={child.id}
                className="card hover:scale-105 transition-all duration-500 cursor-pointer group animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleViewChildReport(child)}
              >
                {/* Header with Avatar */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-3xl">
                      {child.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: #{child.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-semibold text-gray-900">{child.age}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Blood Group</p>
                    <p className="font-semibold text-gray-900">{child.bloodGroup}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Vaccination Progress</span>
                    <span className="font-bold text-primary-600">
                      {child.completedVaccines}/{child.totalVaccines}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${(child.completedVaccines / child.totalVaccines) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Next Visit */}
                <div className="bg-primary-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-600 font-semibold">NEXT VISIT</span>
                    <CalendarIcon className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-900 mt-1">{child.nextVisit}</p>
                </div>

                {/* View Report Button */}
                <button className="mt-4 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Report Card
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section (for other report types) */}
      {reportType !== 'child-cards' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Children</p>
                  <p className="text-3xl font-bold mt-2">1,571</p>
                </div>
                <UserGroupIcon className="h-12 w-12 text-white/30" />
              </div>
              <div className="mt-4 text-blue-100 text-sm">↑ 12% from last month</div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Vaccinations</p>
                  <p className="text-3xl font-bold mt-2">8,542</p>
                </div>
                <HeartIcon className="h-12 w-12 text-white/30" />
              </div>
              <div className="mt-4 text-green-100 text-sm">↑ 8% from last month</div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Coverage Rate</p>
                  <p className="text-3xl font-bold mt-2">89%</p>
                </div>
                <ChartBarIcon className="h-12 w-12 text-white/30" />
              </div>
              <div className="mt-4 text-yellow-100 text-sm">↑ 5% from last year</div>
            </div>

            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Overdue</p>
                  <p className="text-3xl font-bold mt-2">124</p>
                </div>
                <ExclamationTriangleIcon className="h-12 w-12 text-white/30" />
              </div>
              <div className="mt-4 text-red-100 text-sm">↓ 3% from last month</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Vaccination Trend</h2>
              <div className="h-80">
                <Bar data={monthlyData} options={chartOptions} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vaccine Coverage Rates</h2>
              <div className="h-80">
                <Bar data={vaccineCoverageData} options={chartOptions} />
              </div>
            </div>

            <div className="card lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Age Group Distribution</h2>
              <div className="h-80">
                <Pie data={ageGroupData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Generated Reports List */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">
                    {report.thumbnail}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <span>{report.date}</span>
                      <span className="mx-2">•</span>
                      <span>{report.format}</span>
                      <span className="mx-2">•</span>
                      <span>{report.size}</span>
                      <span className="mx-2">•</span>
                      <span>{report.pages} pages</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Child Report Card Modal */}
      {showChildReport && selectedChild && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
            
            {/* Report Card Content */}
            <div ref={reportCardRef} className="p-8">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 -m-8 mb-8 p-8 rounded-t-3xl">
                <div className="flex justify-between items-start text-white">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Vaccination Report Card</h2>
                    <p className="text-primary-100">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl mb-2">{selectedChild.avatar}</div>
                    <p className="font-semibold">ID: #{selectedChild.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
              </div>

              {/* Child Information */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedChild.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-900">{selectedChild.dob}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">{selectedChild.age}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium text-gray-900">{selectedChild.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Blood Group</p>
                      <p className="font-medium text-gray-900">{selectedChild.bloodGroup}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent/Guardian</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedChild.parentName}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedChild.parentPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedChild.parentEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedChild.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pediatrician</p>
                    <p className="font-semibold text-gray-900">{selectedChild.pediatrician}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Visit</p>
                    <p className="font-semibold text-gray-900">{selectedChild.lastVisit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Visit</p>
                    <p className="font-semibold text-gray-900">{selectedChild.nextVisit}</p>
                  </div>
                </div>
              </div>

              {/* Vaccination Progress */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-bold text-primary-600">
                      {selectedChild.completedVaccines}/{selectedChild.totalVaccines} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                      style={{ width: `${(selectedChild.completedVaccines / selectedChild.totalVaccines) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Vaccination History Table */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaccination History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dose</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedChild.vaccinations.map((vaccine, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{vaccine.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Dose {vaccine.dose}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{vaccine.date || 'Not scheduled'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{vaccine.batch || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vaccine.status)}`}>
                              {vaccine.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR Code and Summary */}
              <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center">
                    <QrCodeIcon className="h-10 w-10 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Scan to verify</p>
                    <p className="text-xs text-gray-500">Certificate ID: VAC-{selectedChild.id}-{new Date().getFullYear()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Authorized by</p>
                  <p className="text-sm font-semibold text-gray-900">City Health Department</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end space-x-3 rounded-b-3xl">
              <button
                onClick={handleDownloadPDF}
                className="btn-primary flex items-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center"
              >
                <PrinterIcon className="h-5 w-5 mr-2" />
                Print
              </button>
              <button
                onClick={() => setShowChildReport(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
