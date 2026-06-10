import React from 'react';

export const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-50 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 bg-gray-50 border-t border-gray-50 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
};
