import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  icon,
  rightIcon,
  onRightIconClick,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#2962ff] focus:border-[#2962ff] transition-colors
            ${icon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div 
            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
