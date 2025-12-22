import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, render } from '@testing-library/react';
import React from 'react';
import { CartProvider, CartContext } from './CartContext';
import { ToastProvider } from './ToastContext';
import { useContext } from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <CartProvider>{children}</CartProvider>
  </ToastProvider>
);

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// Component that uses CartProvider without ToastProvider to test error
const TestCartWithoutToast: React.FC = () => {
  return (
    <CartProvider>
      <div>Test</div>
    </CartProvider>
  );
};

describe('CartContext', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    image: 'test.jpg',
    category: 'Apparel' as const,
    description: 'Test description',
  };

  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].name).toBe('Test Product');
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(100);
  });

  it('should increase quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cartItems).toHaveLength(1);

    act(() => {
      result.current.removeFromCart(mockProduct.id);
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateItemQuantity(mockProduct.id, 5);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
    expect(result.current.totalPrice).toBe(500);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateItemQuantity(mockProduct.id, 0);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart({ ...mockProduct, id: 2, name: 'Product 2' });
    });

    expect(result.current.cartItems).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should throw error when CartProvider is used without ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestCartWithoutToast />);
    }).toThrow('useCartToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });
});
