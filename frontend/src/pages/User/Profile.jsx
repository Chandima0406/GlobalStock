import React, { useState, useEffect } from 'react';
import ProfileUpdateForm from '@/components/forms/ProfileUpdateForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const { user, login } = useAuth();
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Session expired. Please login again.');
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setUserData(data.data);
          
          // Check if user is first user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setIsFirstUser(parsedUser.isFirstUser || false);
            } catch (err) {
              console.error('Error parsing stored user:', err);
            }
          }
          
          // Update localStorage with fresh data
          const userForStorage = {
            id: data.data._id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            avatar: data.data.avatar,
            phone: data.data.phone,
            isFirstUser: isFirstUser
          };
          localStorage.setItem('user', JSON.stringify(userForStorage));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isFirstUser]);

  const handleProfileUpdate = async (updatedData) => {
    // Update state with new data
    setUserData(updatedData);
    
    // Update localStorage
    const userForStorage = {
      id: updatedData._id,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      avatar: updatedData.avatar,
      phone: updatedData.phone,
      isFirstUser: isFirstUser
    };
    localStorage.setItem('user', JSON.stringify(userForStorage));
    
    // Update auth context
    if (login) {
      login(userForStorage, localStorage.getItem('token'));
    }
    
    console.log('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="error" message={error} className="mb-6" />
          )}

          {/* Profile Content */}
          {!isLoading && !error && userData && (
            <>
              {/* First User Welcome Message */}
              {isFirstUser && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Welcome to GlobalStock!
                      </h3>
                      <p className="mt-1 text-sm text-blue-700">
                        As the first user, please complete your profile setup to get started. 
                        You'll be able to explore all features once your profile is updated.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <ProfileUpdateForm 
                userData={userData} 
                onUpdate={handleProfileUpdate}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;