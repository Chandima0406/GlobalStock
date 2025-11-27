/**
 * Global authentication interceptor utility
 * Handles automatic logout on token expiration (401 responses)
 */

/**
 * Create a fetch wrapper that intercepts 401 responses
 * @param {Function} logoutCallback - Function to call when 401 is detected
 * @returns {Function} Enhanced fetch function
 */
export const createAuthenticatedFetch = (logoutCallback) => {
  return async (url, options = {}) => {
    try {
      const response = await fetch(url, options);

      // Check for 401 Unauthorized
      if (response.status === 401) {
        console.warn('Authentication failed (401). Logging out...');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('remember_me');
        
        // Call logout callback to update app state
        if (logoutCallback) {
          logoutCallback();
        }
        
        // Redirect to login
        window.location.href = '/login?session_expired=true';
        
        // Throw error to stop further processing
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      // Re-throw if it's a network error (not our 401 error)
      if (error.message !== 'Session expired. Please login again.') {
        throw error;
      }
      throw error;
    }
  };
};

/**
 * Setup global 401 listener for all fetch calls
 * This is a more aggressive approach that monitors all fetch calls
 */
export const setupGlobal401Interceptor = (logoutCallback) => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Only intercept API calls, not external resources
    const isApiCall = args[0]?.includes('/api/') || args[0]?.includes('localhost:5000');
    
    if (response.status === 401 && isApiCall) {
      console.warn('Global 401 interceptor: Session expired');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
      
      // Call logout callback
      if (logoutCallback) {
        logoutCallback();
      }
      
      // Redirect to login
      window.location.href = '/login?session_expired=true';
    }
    
    return response;
  };
};

export default {
  createAuthenticatedFetch,
  setupGlobal401Interceptor
};
