import React from 'react';
import Navbar from '../../components/common/Navbar';

const Airports = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Airports</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover more about our Airports and services. We are dedicated to providing the best travel experience in Gujarat.
          </p>
        </div>
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Coming Soon</h2>
            <p className="text-gray-500">We are currently curating the best information for this page. Please check back later!</p>
            <button className="mt-8 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airports;
