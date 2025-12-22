import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

// Custom hook to access the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  // Ensure the hook is used within a CartProvider
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// CI: pipeline test 2025-11-20

