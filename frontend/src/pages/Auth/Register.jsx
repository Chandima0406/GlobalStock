import React from 'react';
import RegistrationForm from '@/components/forms/RegistrationForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

const RegistrationPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center py-12 bg-gray-50">
        <RegistrationForm />
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationPage;