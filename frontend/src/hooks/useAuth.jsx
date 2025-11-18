/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

// Create AuthContext
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  getRedirectPath: () => {}
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export AuthContext for provider
export { AuthContext };
