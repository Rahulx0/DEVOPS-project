import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useWishlist } from './useWishlist';
import { WishlistProvider } from '../context/WishlistContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(WishlistProvider, null, children)
);

describe('useWishlist hook', () => {
  it('should return wishlist context when used within WishlistProvider', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.wishlistItems).toBeDefined();
    expect(result.current.addToWishlist).toBeDefined();
    expect(result.current.removeFromWishlist).toBeDefined();
  });

  it('should throw error when used outside WishlistProvider', () => {
    expect(() => {
      renderHook(() => useWishlist());
    }).toThrow('useWishlist must be used within a WishlistProvider');
  });
});
