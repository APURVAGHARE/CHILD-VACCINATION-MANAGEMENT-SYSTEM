 import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 z-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-primary-600 mb-2 animate-pulse">
          Loading...
        </h2>
        <p className="text-gray-600">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
