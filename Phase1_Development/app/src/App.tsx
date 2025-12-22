// Main App component and providers setup
import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/About';
import ProductsPage from './components/Services';
import CartView from './components/Portfolio';
import CheckoutView from './components/Team';
import SuccessView from './components/Contact';
import ProductDetail from './components/ProductDetail';
import WishlistView from './components/Wishlist';
import AdminProducts from './components/AdminProducts';
import ToastContainer from './components/Toast';
import Chatbot from './components/Chatbot';
import { AppView } from './lib/types';

// App component manages the main view and context providers
const App: React.FC = () => {
  // State to track which view is currently active
  const [view, setView] = useState<AppView>(() => {
    // Check URL for admin access: ?admin=true
    if (globalThis.location.search.includes('admin=true')) {
      return { type: 'admin' };
    }
    return { type: 'home' };
  });

  // Function to render the correct view based on state
  const renderView = () => {
    switch (view.type) {
      case 'apparel':
        // Show apparel products
        return <ProductsPage setView={setView} category="Apparel" />;
      case 'sneakers':
        // Show sneakers products
        return <ProductsPage setView={setView} category="Sneakers" />;
      case 'product':
        // Show product detail page
        return <ProductDetail setView={setView} productId={view.id} />;
      case 'cart':
        // Show cart view
        return <CartView setView={setView} />;
      case 'wishlist':
        // Show wishlist view
        return <WishlistView setView={setView} />;
      case 'checkout':
        // Show checkout view
        return <CheckoutView setView={setView} />;
      case 'success':
        // Show success page after checkout
        return <SuccessView setView={setView} />;
      case 'admin':
        // Show admin products management
        return <AdminProducts />;
      case 'home':
      default:
        // Show home/about page
        return <Home setView={setView} />;
    }
  };

  // Wrap the app in all context providers and render main layout
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="bg-background dark:bg-gray-900 text-text-dark dark:text-gray-100 font-sans min-h-screen flex flex-col transition-colors duration-300">
              {/* Header navigation */}
              <Header setView={setView} />
              <main className="flex-grow pt-20">
                {/* Main content based on current view */}
                {renderView()}
              </main>
              {/* Footer section */}
              <Footer />
              {/* Toast notifications */}
              <ToastContainer />
              {/* Chatbot widget */}
              <Chatbot />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

// Export the App component as default
export default App;
// CI: pipeline test 2025-11-20