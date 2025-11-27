/**
 * Multi-Tab Logout Synchronization
 * Syncs logout across all browser tabs using localStorage events
 */

const LOGOUT_EVENT_KEY = 'logout_event';
const LOGOUT_TIMESTAMP_KEY = 'logout_timestamp';

/**
 * Setup multi-tab logout listener
 * @param {Function} onLogout - Callback when logout is detected in another tab
 */
export const setupMultiTabLogout = (onLogout) => {
  const handleStorageChange = (event) => {
    // Check if logout event occurred
    if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
      console.log('Logout detected in another tab. Syncing...');
      
      // Clear current tab's auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call logout callback
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login
      window.location.href = '/login?reason=logout_sync';
    }

    // Also check if token was removed directly
    if (event.key === 'token' && event.oldValue && !event.newValue) {
      console.log('Token removed in another tab. Syncing logout...');
      
      if (onLogout) {
        onLogout();
      }
      
      window.location.href = '/login?reason=logout_sync';
    }
  };

  // Listen for storage events
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Broadcast logout to all tabs
 * Call this when user logs out in current tab
 */
export const broadcastLogout = () => {
  // Set a timestamp to trigger storage event
  localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
  
  // Remove the event key after a short delay
  setTimeout(() => {
    localStorage.removeItem(LOGOUT_EVENT_KEY);
  }, 1000);
};

/**
 * Setup multi-tab login sync
 * @param {Function} onLogin - Callback when login is detected in another tab
 */
export const setupMultiTabLogin = (onLogin) => {
  const handleStorageChange = (event) => {
    // Check if token was added
    if (event.key === 'token' && !event.oldValue && event.newValue) {
      console.log('Login detected in another tab. Syncing...');
      
      // Get user data
      const userData = localStorage.getItem('user');
      
      if (userData && onLogin) {
        try {
          const parsedUser = JSON.parse(userData);
          onLogin(parsedUser, event.newValue);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default {
  setupMultiTabLogout,
  broadcastLogout,
  setupMultiTabLogin
};
