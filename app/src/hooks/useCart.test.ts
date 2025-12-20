import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useCart } from './useCart';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(ToastProvider, null,
    React.createElement(CartProvider, null, children)
  )
);

describe('useCart hook', () => {
  it('should return cart context when used within CartProvider', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.cartItems).toBeDefined();
    expect(result.current.addToCart).toBeDefined();
    expect(result.current.removeFromCart).toBeDefined();
  });

  it('should throw error when used outside CartProvider', () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
  });
});
