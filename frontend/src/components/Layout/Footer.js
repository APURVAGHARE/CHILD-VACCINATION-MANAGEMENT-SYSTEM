import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const handleLinkClick = (linkName) => {
    alert(`🔗 ${linkName} - This feature will be available soon!`);
  };

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Left Section - Copyright */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>&copy; {currentYear} VaccineTracker.</span>
            <span className="hidden md:inline">Made with ❤️ for parents</span>
            <HeartIcon className="h-4 w-4 text-red-500 animate-pulse ml-2" />
          </div>
          
          {/* Center Section - Quick Links */}
          <div className="flex space-x-6">
            <button 
              onClick={() => handleLinkClick('Privacy Policy')}
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 relative group"
            >
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 
                           group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => handleLinkClick('Terms of Use')}
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 relative group"
            >
              Terms of Use
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 
                           group-hover:w-full transition-all duration-300"></span>
            </button>
            <button 
              onClick={() => handleLinkClick('Help Center')}
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 relative group"
            >
              Help Center
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 
                           group-hover:w-full transition-all duration-300"></span>
            </button>
          </div>
          
          {/* Right Section - Version */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-500">Active</span>
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg font-medium">
                v2.0.0
              </span>
            </div>
          </div>
        </div>

        {/* Parent-Focused Stats Bar */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex justify-center space-x-8 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              <span 
                className="cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => alert('📊 1,234 parents are using VaccineTracker!')}
              >
                1,234 Happy Parents
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span 
                className="cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => alert('💉 5,678 vaccinations have been tracked successfully!')}
              >
                5,678 Vaccinations Tracked
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
              <span 
                className="cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => alert('⭐ 98% of vaccinations are on time! Keep up the good work!')}
              >
                98% On-Time Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;