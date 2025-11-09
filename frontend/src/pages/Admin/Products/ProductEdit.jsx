import React from 'react';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import ProductEditForm from '@/components/forms/ProductEditForm/ProductEditForm';

const ProductEditPage = () => {
  const handleSave = (updatedProductData) => {
    // Handle successful product update
    console.log('Product updated:', updatedProductData);
    // You could navigate to product detail page or show success message
  };

  const handleCancel = () => {
    // Handle cancel action
    console.log('Edit cancelled');
    // You could navigate back to previous page
  };

  // Mock product data - replace with actual data from props/API
  const productData = {
    id: '123',
    name: 'Sample Product',
    description: 'Product description here',
    price: 99.99,
    sku: 'SKU12345',
    quantity: 100,
    category: 'electronics',
    status: 'active',
    images: [
      { id: '1', url: '/images/product1.jpg' },
      { id: '2', url: '/images/product2.jpg' }
    ]
    // ... other product fields
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <ProductEditForm
            productId="123"
            productData={productData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductEditPage;