import React from 'react';

/**
 * Reusable Alert component
 */
const Alert = ({
  variant = 'info',
  message,
  title,
  onClose,
  className = '',
  children,
}) => {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  
  const alertClasses = `p-4 rounded-lg border ${variantStyles[variant]} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <div className={alertClasses} role="alert">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div>{message || children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};


const showAlert = (message, type = 'info') => {
  // This would integrate with a notification context/state management
  console.log(`Alert [${type}]: ${message}`);
};

// Static methods for easy usage
Alert.success = (message) => showAlert(message, 'success');
Alert.error = (message) => showAlert(message, 'error');
Alert.warning = (message) => showAlert(message, 'warning');
Alert.info = (message) => showAlert(message, 'info');

export default Alert;