import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [newsletter, setNewsletter] = useState({ email: '', loading: false, message: '', error: '' });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/featured`);
        const data = await response.json();
        if (data.success) {
          setFeaturedProducts(data.data.slice(0, 6)); // Limit to 6 products
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, [API_BASE_URL]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories?limit=6`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.slice(0, 6)); // Limit to 6 categories
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletter({ ...newsletter, loading: true, message: '', error: '' });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletter.email)) {
      setNewsletter({ ...newsletter, loading: false, error: 'Please enter a valid email address' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletter.email })
      });

      const data = await response.json();

      if (data.success) {
        setNewsletter({ email: '', loading: false, message: 'Thank you for subscribing!', error: '' });
      } else {
        setNewsletter({ ...newsletter, loading: false, error: data.message || 'Subscription failed' });
      }
    } catch {
      setNewsletter({ ...newsletter, loading: false, error: 'Something went wrong. Please try again.' });
    }
  };

  // Sample data for sections that don't have backend yet
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Wide Product Selection',
      description: 'Browse thousands of products across multiple categories'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Transactions',
      description: 'Shop with confidence using our encrypted payment system'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Fast Delivery',
      description: 'Get your orders delivered quickly to your doorstep'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Our customer service team is always here to help'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Best Prices',
      description: 'Competitive pricing and great deals on all products'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Easy Returns',
      description: 'Hassle-free returns within 30 days of purchase'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Verified Buyer',
      image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff',
      rating: 5,
      comment: 'Amazing service! Fast delivery and great product quality. Will definitely shop again.'
    },
    {
      name: 'Michael Chen',
      role: 'Premium Member',
      image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10B981&color=fff',
      rating: 5,
      comment: 'The best online marketplace I\'ve used. Wide selection and excellent customer support.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Regular Customer',
      image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=F59E0B&color=fff',
      rating: 4,
      comment: 'Great prices and reliable shipping. The return process was super easy when needed.'
    }
  ];

  const stats = [
    { label: 'Products Available', value: '10,000+' },
    { label: 'Happy Customers', value: '50,000+' },
    { label: 'Daily Orders', value: '1,000+' },
    { label: 'Countries Served', value: '25+' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to GlobalStock
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Your trusted marketplace for quality products at competitive prices. 
            Shop from thousands of items across multiple categories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/products')}
                  className="bg-white text-blue-600 hover:bg-blue-50 min-w-[200px]"
                >
                  Browse Products
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/profile')}
                  className="border-white text-white hover:bg-white hover:text-blue-600 min-w-[200px]"
                >
                  View Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="border-white text-white hover:bg-white hover:text-blue-600 min-w-[200px]"
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/products')}
                  className="border-white text-white hover:bg-white hover:text-blue-600 min-w-[200px]"
                >
                  Browse Products
                </Button>
              </>
            )}
          </div>
          {!isAuthenticated && (
            <p className="mt-6 text-blue-100">
              Already have an account?{' '}
              <Link to="/login" className="underline font-semibold hover:text-white">
                Log in
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GlobalStock?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide the best shopping experience with our top-notch features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Check out our most popular items
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="hidden md:inline-flex"
            >
              View All Products
            </Button>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product._id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.comparePrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price?.toFixed(2)}
                          </span>
                          {product.comparePrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8 md:hidden">
                <Button variant="primary" onClick={() => navigate('/products')}>
                  View All Products
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No featured products available at the moment.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Explore our wide range of product categories
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="p-4 animate-pulse">
                  <div className="bg-gray-200 h-24 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group"
                >
                  <Card className="p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-20 h-20 mx-auto mb-3 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      {category.icon ? (
                        <span className="text-3xl">{category.icon}</span>
                      ) : (
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No categories available at the moment.</p>
            </Card>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Don't just take our word for it
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About/Stats Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              About GlobalStock
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              We're committed to providing the best online shopping experience. Our platform 
              connects buyers and sellers worldwide, offering a secure and convenient marketplace 
              for everyone.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/about')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 md:p-12 text-center bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter and get exclusive deals, product launches, and more!
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletter.email}
                  onChange={(e) => setNewsletter({ ...newsletter, email: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={newsletter.loading}
                  disabled={newsletter.loading}
                  className="whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </div>
              {newsletter.message && (
                <p className="mt-3 text-green-600 font-medium">{newsletter.message}</p>
              )}
              {newsletter.error && (
                <p className="mt-3 text-red-600 font-medium">{newsletter.error}</p>
              )}
            </form>
            <p className="mt-4 text-sm text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
