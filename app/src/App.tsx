import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/About';
import ProductsPage from './components/Services';
import CartView from './components/Portfolio';
import CheckoutView from './components/Team';
import SuccessView from './components/Contact';
import ProductDetail from './components/ProductDetail';
import WishlistView from './components/Wishlist';
import ToastContainer from './components/Toast';
import { AppView } from './lib/types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>({ type: 'home' });

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
      case 'home':
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="bg-background text-text-dark font-sans min-h-screen flex flex-col">
            <Header setView={setView} />
            <main className="flex-grow pt-20">
              {renderView()}
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
// CI: pipeline test 2025-11-20