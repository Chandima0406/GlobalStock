import React from 'react';

/**
 * Reusable Button component for the e-commerce application
 * Supports various styles, sizes, states, and icons
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost' | 'link'} props.variant - Button style variant
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} props.size - Button size
 * @param {boolean} props.isLoading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 * @param {'button' | 'submit' | 'reset'} props.type - Button type
 * @param {function} props.onClick - Click handler
 * @param {string} props.href - If provided, renders as anchor tag
 * @param {React.ElementType} props.icon - Icon component
 * @param {'left' | 'right'} props.iconPosition - Icon position
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  href,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 shadow-sm',
    outline: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    link: 'bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-700 underline focus:ring-blue-500 p-0',
  };

  // Size styles
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base',
  };

  // Icon size mapping
  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5',
  };

  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${iconPosition === 'left' ? 'mr-2' : 'ml-2'} ${iconSizeClasses[size]}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Icon component
  const renderIcon = () => {
    if (isLoading) return <LoadingSpinner />;
    if (Icon && typeof Icon === 'function') {
      return <Icon className={`${iconSizeClasses[size]} ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`} />;
    }
    return null;
  };

  // Content with icon
  const content = (
    <>
      {iconPosition === 'left' && renderIcon()}
      <span>{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  // If href is provided, render as link
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Default button
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;