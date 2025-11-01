import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';
import Card from '../../ui/Card/Card';
import Alert from '../../ui/Alert/Alert';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    vendorRequest: false,
  });

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    return { checks, strength };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.length < 2 || value.length > 50) {
          newErrors.name = 'Name must be between 2-50 characters';
        } else if (/[^a-zA-Z\s]/.test(value)) {
          newErrors.name = 'Name cannot contain special characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (passwordStrength.strength < 4) {
          newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'phone':
        if (value && !/^\+?[\d\s\-()]{10,}$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validate field on change
    if (type !== 'checkbox') {
      validateField(name, fieldValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    let isValid = true;
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    // Additional validations
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (formData.phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare data for backend (exclude role field for security)
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim() || '',
        vendorRequest: formData.vendorRequest
      };

      // Use environment variable or proxy
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Handle different response structures
      if (data.token || data.data?.token) {
        localStorage.setItem('auth_token', data.token || data.data.token);
      }

      // Show success message
      setSuccessMessage('Registration successful! Please check your email for verification.');
      
      // Redirect based on vendor request
      setTimeout(() => {
        if (formData.vendorRequest) {
          navigate('/vendor-pending');
        } else {
          navigate('/dashboard');
        }
      }, 2000);

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join GlobalStock today</p>
      </div>

      {/* Success message display */}
      {successMessage && (
        <Alert variant="success" message={successMessage} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            error={errors.name}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email"
            error={errors.email}
            required
          />
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+94 77 217 4920"
            error={errors.phone}
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a strong password"
              error={errors.password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Password Strength:</span>
                <span className={`
                  ${passwordStrength.strength >= 4 ? 'text-green-600' : 
                    passwordStrength.strength >= 3 ? 'text-yellow-600' : 
                    'text-red-600'}
                `}>
                  {passwordStrength.strength >= 4 ? 'Strong' : 
                   passwordStrength.strength >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`
                    h-1 rounded-full transition-all duration-300
                    ${passwordStrength.strength >= 4 ? 'bg-green-500 w-full' : 
                      passwordStrength.strength >= 3 ? 'bg-yellow-500 w-3/4' : 
                      passwordStrength.strength >= 2 ? 'bg-orange-500 w-1/2' : 
                      'bg-red-500 w-1/4'}
                  `}
                />
              </div>
              
              {/* Password Requirements */}
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-1">{passwordStrength.checks.length ? '✓' : '○'}</span>
                  At least 6 characters
                </div>
                <div className={`flex items-center ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-1">{passwordStrength.checks.uppercase ? '✓' : '○'}</span>
                  One uppercase letter
                </div>
                <div className={`flex items-center ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-1">{passwordStrength.checks.lowercase ? '✓' : '○'}</span>
                  One lowercase letter
                </div>
                <div className={`flex items-center ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-1">{passwordStrength.checks.number ? '✓' : '○'}</span>
                  One number
                </div>
                <div className={`flex items-center ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-1">{passwordStrength.checks.special ? '✓' : '○'}</span>
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Vendor Request Checkbox */}
        <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <input
            id="vendorRequest"
            name="vendorRequest"
            type="checkbox"
            checked={formData.vendorRequest}
            onChange={handleChange}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="vendorRequest" className="text-sm text-gray-700">
            <span className="font-medium">I want to become a vendor</span>
            <p className="text-gray-500 mt-1 text-xs">
              Vendor applications are reviewed by our team. You'll be notified once your account is approved.
            </p>
          </label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="error" message={errors.submit} />
        )}

        {/* Submit Button - Using Your Button Component */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading || Object.keys(errors).length > 0}
          className="w-full"
        >
          Create Account
        </Button>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default RegistrationForm;