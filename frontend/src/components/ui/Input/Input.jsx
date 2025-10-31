import React from 'react';

/**
 * Reusable Input component
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
  
  const stateClasses = error 
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white';

  
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;