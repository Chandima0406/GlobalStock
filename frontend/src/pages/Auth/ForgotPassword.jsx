import React from 'react';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center py-12 bg-gray-50">
        <ForgotPasswordForm />
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;