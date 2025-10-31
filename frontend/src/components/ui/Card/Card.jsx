import React from 'react';

/**
 * Reusable Card component
 */
const Card = ({
  children,
  className = '',
  padding = 'p-6',
  shadow = 'shadow-sm',
  border = 'border border-gray-200',
  ...props
}) => {
  
  const cardClasses = `bg-white rounded-lg ${padding} ${shadow} ${border} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header component
const CardHeader = ({ children, className = '' }) => (
  
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// Card Content component
const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Card Footer component
const CardFooter = ({ children, className = '' }) => (
  
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;