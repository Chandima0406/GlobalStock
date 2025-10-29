import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { Target, Sparkles, Handshake, Lightbulb, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="grow">
        {/* Hero Section */}
        <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About GlobalStock
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your trusted partner in global e-commerce, connecting buyers and sellers worldwide
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => document.getElementById('our-story').scrollIntoView({ behavior: 'smooth' })}
            >
              Discover Our Story
            </Button>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="our-story" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Founded in 2025, GlobalStock emerged from a simple vision: to create a seamless 
                  global marketplace where quality meets accessibility. We believe everyone deserves 
                  access to premium products at fair prices, regardless of their location.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  What started as a small platform connecting local artisans with international 
                  customers has grown into a comprehensive e-commerce ecosystem serving millions 
                  of users across 50+ countries.
                </p>
                <div className="flex gap-4">
                  <Button variant="primary">Shop Now</Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <span className="text-gray-500 text-lg">Company Image/Infographic</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To democratize global commerce by providing a platform that empowers both 
                  buyers and sellers, fostering economic growth and cultural exchange through 
                  seamless cross-border transactions.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become the world's most trusted and inclusive e-commerce platform, 
                  connecting communities and transforming how people discover, purchase, 
                  and sell products globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust & Transparency</h3>
                <p className="text-gray-600">
                  We believe in building relationships based on honesty, clear communication, 
                  and mutual respect with our customers and partners.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Continuously evolving our platform to provide cutting-edge solutions 
                  that enhance the shopping experience for everyone.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Community</h3>
                <p className="text-gray-600">
                  Celebrating diversity and fostering connections across cultures, 
                  borders, and communities through commerce.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">1M+</div>
                <div className="text-blue-200">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-200">Countries Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-blue-200">Verified Sellers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99.2%</div>
                <div className="text-blue-200">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-300 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600">CEO Photo</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sarah Johnson</h3>
                <p className="text-blue-600 mb-2">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm">
                  Visionary leader with 15+ years in e-commerce and technology innovation.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-300 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600">CTO Photo</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Michael Chen</h3>
                <p className="text-blue-600 mb-2">Chief Technology Officer</p>
                <p className="text-gray-600 text-sm">
                  Tech expert driving our platform's scalability and security.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-300 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600">COO Photo</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Elena Rodriguez</h3>
                <p className="text-blue-600 mb-2">Chief Operations Officer</p>
                <p className="text-gray-600 text-sm">
                  Operations specialist ensuring seamless global logistics and customer experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Our Global Community?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you're looking to shop the world's best products or grow your business globally, 
              GlobalStock is here to support your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link to="/products">Start Shopping</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}