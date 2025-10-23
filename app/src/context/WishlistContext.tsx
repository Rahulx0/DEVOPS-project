import React, { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Product } from '../lib/types';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  wishlistCount: number;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlistItems(prevItems => {
      if (prevItems.find(item => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const isWishlisted = useCallback((productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    wishlistCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};