import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WishlistProvider, WishlistContext } from './WishlistContext';
import { useContext } from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WishlistProvider>{children}</WishlistProvider>
);

const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

describe('WishlistContext', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    image: 'test.jpg',
    category: 'Apparel' as const,
    description: 'Test description',
  };

  it('should start with empty wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.wishlistItems).toEqual([]);
    expect(result.current.wishlistCount).toBe(0);
  });

  it('should add item to wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.wishlistItems).toHaveLength(1);
    expect(result.current.wishlistItems[0].name).toBe('Test Product');
    expect(result.current.wishlistCount).toBe(1);
  });

  it('should not add duplicate items', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.wishlistItems).toHaveLength(1);
    expect(result.current.wishlistCount).toBe(1);
  });

  it('should remove item from wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.wishlistItems).toHaveLength(1);

    act(() => {
      result.current.removeFromWishlist(mockProduct.id);
    });

    expect(result.current.wishlistItems).toHaveLength(0);
    expect(result.current.wishlistCount).toBe(0);
  });

  it('should check if item is wishlisted', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.isWishlisted(mockProduct.id)).toBe(false);

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.isWishlisted(mockProduct.id)).toBe(true);
    expect(result.current.isWishlisted(999)).toBe(false);
  });
});
