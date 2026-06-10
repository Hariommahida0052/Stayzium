import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const BackToHome = () => {
  return (
    <Link 
      to="/" 
      className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 px-4 py-2.5 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm border border-gray-100 hover:-translate-y-0.5"
    >
      <Home className="w-4 h-4" />
      <span className="hidden sm:inline">Back to Home</span>
    </Link>
  );
};

export default BackToHome;
