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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(() => {
    // Check URL for admin access: ?admin=true
    if (window.location.search.includes('admin=true')) {
      return { type: 'admin' };
    }
    return { type: 'home' };
  });

  const renderView = () => {
    switch (view.type) {
      case 'apparel':
        return <ProductsPage setView={setView} category="Apparel" />;
      case 'sneakers':
        return <ProductsPage setView={setView} category="Sneakers" />;
      case 'product':
        return <ProductDetail setView={setView} productId={view.id} />;
      case 'cart':
        return <CartView setView={setView} />;
      case 'wishlist':
        return <WishlistView setView={setView} />;
      case 'checkout':
        return <CheckoutView setView={setView} />;
      case 'success':
        return <SuccessView setView={setView} />;
      case 'admin':
        return <AdminProducts />;
      case 'home':
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="bg-background dark:bg-gray-900 text-text-dark dark:text-gray-100 font-sans min-h-screen flex flex-col transition-colors duration-300">
              <Header setView={setView} />
              <main className="flex-grow pt-20">
                {renderView()}
              </main>
              <Footer />
              <ToastContainer />
              <Chatbot />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
// CI: pipeline test 2025-11-20