import React, { createContext, useState, useCallback, useMemo, ReactNode, useContext } from 'react';
import { CartItem, Product } from '../lib/types';
import { ToastContext } from './ToastContext';

// A simple hook to ensure toast context is available
const useCartToast = () => {
    const showToast = useContext(ToastContext);
    if (showToast === undefined) {
      throw new Error('useCartToast must be used within a ToastProvider');
    }
    return showToast;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const showToast = useCartToast();

  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart`);
  }, [showToast]);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateItemQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    itemCount,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};