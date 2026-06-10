import React from 'react';

const Loader = ({ size = 'md', color = 'text-[#2962ff]', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`${sizes[size]} rounded-full border-gray-200 border-t-current animate-spin ${color}`}
      />
    </div>
  );
};

export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader size="lg" className="mb-4" />
      {message && <p className="text-gray-500 font-medium">{message}</p>}
    </div>
  );
};

export default Loader;
