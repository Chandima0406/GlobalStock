import React from 'react';
import { formatTimeRemaining } from '@/hooks/useInactivityTimeout';
import { Button } from '@/components/ui/Button';

/**
 * Inactivity Warning Modal
 * Displays a warning when user is about to be logged out due to inactivity
 */
const InactivityWarning = ({ 
  timeRemaining, 
  onStayLoggedIn, 
  onLogoutNow 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Are you still there?
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          You've been inactive for a while. For your security, you'll be automatically logged out in:
        </p>

        {/* Countdown */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-700 mb-1">
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-sm text-yellow-600">
              minutes remaining
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onLogoutNow}
            className="flex-1"
          >
            Logout Now
          </Button>
          <Button
            variant="primary"
            onClick={onStayLoggedIn}
            className="flex-1"
          >
            Stay Logged In
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Click "Stay Logged In" to continue your session
        </p>
      </div>
    </div>
  );
};

export default InactivityWarning;
