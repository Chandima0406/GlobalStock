import React, { useState, useEffect } from 'react';
import ProfileUpdateForm from '@/components/forms/ProfileUpdateForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    // Check if user is first user from localStorage or auth context
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setIsFirstUser(parsedUser.isFirstUser || false);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Also check from auth context
    if (user) {
      setUserData(user);
      setIsFirstUser(user.isFirstUser || false);
    }
  }, [user]);

  const handleProfileUpdate = (updatedData) => {
    // Update local storage and state
    localStorage.setItem('user_data', JSON.stringify(updatedData));
    setUserData(updatedData);
    
    // You could also show a toast notification here
    console.log('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;