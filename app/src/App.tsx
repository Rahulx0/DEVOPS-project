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
import Wishlist from "./components/Wishlist";
import { Toaster } from "react-hot-toast";

// Re-triggering CI/CD workflow
function App() {
  const [view, setView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home setView={setView} />;
      case 'products':
        return <ProductsPage setView={setView} setSelectedProductId={setSelectedProductId} />;
      case 'cart':
        return <CartView setView={setView} />;
      case 'checkout':
        return <CheckoutView setView={setView} />;
      case 'success':
        return <SuccessView setView={setView} />;
      case 'productDetail':
        return <ProductDetail productId={selectedProductId} setView={setView} />;
      case 'wishlist':
        return <WishlistView setView={setView} />;
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <CartProvider>
      <WishlistProvider>
        <ToastProvider>
          <div className="bg-background text-text-dark font-sans min-h-screen flex flex-col">
            <Header setView={setView} />
            <main className="flex-grow pt-20">
              {renderView()}
            </main>
            <Footer />
            <Toaster />
          </div>
        </ToastProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;