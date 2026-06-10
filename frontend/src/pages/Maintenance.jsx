import React from 'react';
import { Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hammer className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">We'll be back soon!</h1>
        <p className="text-gray-500 mb-8">
          Stayzium is currently undergoing scheduled maintenance to improve our services. 
          Please check back shortly.
        </p>
        <Link 
          to="/login"
          className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Maintenance;
