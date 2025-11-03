import React, { useState, useEffect } from 'react';
import ProfileUpdateForm from '@/components/forms/ProfileUpdateForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from localStorage or API
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

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