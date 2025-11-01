import React from 'react';
import LoginForm from '@/components/forms/LoginForm';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow flex items-center justify-center py-12 bg-gray-50">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;