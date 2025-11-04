import React from 'react';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import ProductCreationForm from '@/components/forms/ProductCreationForm/ProductCreationForm';

const ProductCreationPage = () => {
  const handleProductCreated = (productData) => {
    // Handle successful product creation (e.g., redirect to product list or show success message)
    console.log('Product created:', productData);
    // You could navigate to the product list or dashboard here
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow py-8 bg-gray-50">
        <ProductCreationForm onProductCreated={handleProductCreated} />
      </main>
      <Footer />
    </div>
  );
};

export default ProductCreationPage;