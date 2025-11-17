import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';

const VendorPending = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vendor Application Pending
          </h1>
          <p className="text-gray-600">
            Thank you for your interest in becoming a vendor on GlobalStock!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-left text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Our team will review your application within 2-3 business days</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You'll receive an email notification once your application is reviewed</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>If approved, you'll gain access to vendor features and can start selling</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            to="/profile"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Profile
          </Link>
          <Link
            to="/login"
            className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Login
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@globalstock.com" className="text-blue-600 hover:underline">
              support@globalstock.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VendorPending;
