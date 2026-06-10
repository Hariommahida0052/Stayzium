import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#2962ff] text-white hover:bg-[#1e4bd8] active:scale-[0.98] shadow-sm focus:ring-[#2962ff]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98] focus:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:scale-[0.98] focus:ring-[#2962ff]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:scale-[0.98] focus:ring-gray-500',
    link: 'bg-transparent text-[#2962ff] hover:underline p-0 focus:ring-0',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const finalClassName = `${baseClasses} ${variants[variant]} ${variant !== 'link' ? sizes[size] : ''} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
