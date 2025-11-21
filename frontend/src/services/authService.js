/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get authentication headers with token
 * @returns {Object} Headers object with Authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Fetch current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user data');
  }

  const data = await response.json();
  return data;
};

/**
 * Update user profile
 * @param {Object} profileData - Profile update data (JSON object)
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 409) {
      throw new Error(error.message || 'Email already exists');
    } else if (response.status === 401) {
      throw new Error(error.message || 'Current password is incorrect');
    } else if (response.status === 400) {
      throw new Error(error.message || 'Invalid data provided');
    } else {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  const data = await response.json();
  return data;
};

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  return data;
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  return data;
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage regardless of API response
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default {
  getCurrentUser,
  updateUserProfile,
  loginUser,
  registerUser,
  logoutUser
};
