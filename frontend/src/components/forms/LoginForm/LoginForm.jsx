import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
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
        } else {
          delete newErrors.password;
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
    const requiredFields = ['email', 'password'];
    let isValid = true;
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      // Use environment variable or default to localhost
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error(data.message || 'Invalid email or password');
        } else if (response.status === 403) {
          throw new Error(data.message || 'Your account has been suspended. Please contact support.');
        } else if (response.status === 429) {
          throw new Error(data.message || 'Too many login attempts. Please try again later.');
        } else {
          throw new Error(data.message || 'Login failed. Please try again.');
        }
      }

      // Login successful
      if (data.success) {
        const token = data.data?.token;
        const userData = {
          id: data.data._id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
          avatar: data.data.avatar,
          phone: data.data.phone
        };

        // Store in localStorage
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update auth context
          login(userData, token);
        }

        // Show success message
        setSuccessMessage(data.message || 'Login successful!');

        // Role-based redirect after short delay
        setTimeout(() => {
          const userRole = data.data?.role || 'customer';
          
          switch (userRole) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'vendor':
              // Check if vendor is approved
              navigate('/vendor/dashboard');
              break;
            case 'customer':
            default:
              navigate('/profile');
              break;
          }
        }, 1000);
      }

    } catch (error) {
      setErrors({ submit: error.message });
      
      // Clear password field on error for security
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your GlobalStock account</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" message={successMessage} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
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
            label="Email Address *"
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
              placeholder="Enter your password"
              error={errors.password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>

          <Link 
            to="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="error" message={errors.submit} />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          Sign In
        </Button>

        {/* Registration Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;