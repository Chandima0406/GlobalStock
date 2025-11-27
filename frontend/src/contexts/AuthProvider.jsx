import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';
import { setupGlobal401Interceptor } from '../utils/authInterceptor';
import { useInactivityTimeout, useInactivityWarning } from '../hooks/useInactivityTimeout';
import { setupMultiTabLogout, broadcastLogout } from '../utils/multiTabSync';
import InactivityWarning from '../components/ui/InactivityWarning';

// AuthProvider component to wrap your app
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Inactivity timeout configuration (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_THRESHOLD = 5 * 60 * 1000;   // 5 minutes warning

  // Handle automatic logout on inactivity
  const handleInactivityLogout = () => {
    console.warn('User logged out due to inactivity');
    logout();
    navigate('/login?reason=inactivity');
  };

  // Use inactivity timeout hook (only when authenticated)
  const { timeRemaining, resetTimer } = useInactivityTimeout(
    handleInactivityLogout,
    INACTIVITY_TIMEOUT,
    isAuthenticated
  );

  // Show warning when time is running out
  const showInactivityWarning = useInactivityWarning(timeRemaining, WARNING_THRESHOLD);

  // Handle "Stay Logged In" button
  const handleStayLoggedIn = () => {
    resetTimer();
  };

  // Handle "Logout Now" button
  const handleLogoutNow = () => {
    logout();
    navigate('/login');
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Setup global 401 interceptor
  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    setupGlobal401Interceptor(handleGlobalLogout);
  }, []);

  // Setup multi-tab logout sync
  useEffect(() => {
    const handleMultiTabLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    const cleanup = setupMultiTabLogout(handleMultiTabLogout);
    
    return cleanup;
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const getRedirectPath = (userData) => {
    // If user is the first user in the system, redirect to profile update
    if (userData?.isFirstUser) {
      return '/profile';
    }

    // If profile is complete, send to products
    if (userData?.isProfileComplete) {
      return '/products';
    }

    // Otherwise send to profile for completion
    return '/profile';
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Broadcast logout to other tabs
    broadcastLogout();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    getRedirectPath,
    resetInactivityTimer: resetTimer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Inactivity Warning Modal */}
      {isAuthenticated && showInactivityWarning && (
        <InactivityWarning
          timeRemaining={timeRemaining}
          onStayLoggedIn={handleStayLoggedIn}
          onLogoutNow={handleLogoutNow}
        />
      )}
    </AuthContext.Provider>
  );
};
