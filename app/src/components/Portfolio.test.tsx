import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CartView from './Portfolio';
import { CartContext } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('CartView Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
  });

  const renderWithEmptyCart = () => {
    return render(
      <ThemeProvider>
        <ToastProvider>
          <CartContext.Provider value={{
            cartItems: [],
            addToCart: vi.fn(),
            removeFromCart: vi.fn(),
            updateItemQuantity: vi.fn(),
            clearCart: vi.fn(),
            itemCount: 0,
            totalPrice: 0
          }}>
            <CartView setView={mockSetView} />
          </CartContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  const renderWithItems = () => {
    return render(
      <ThemeProvider>
        <ToastProvider>
          <CartContext.Provider value={{
            cartItems: [
              { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc', quantity: 2 },
              { id: 2, name: 'Product 2', price: 200, image: 'img2.jpg', category: 'Sneakers', description: 'Desc', quantity: 1 }
            ],
            addToCart: vi.fn(),
            removeFromCart: vi.fn(),
            updateItemQuantity: vi.fn(),
            clearCart: vi.fn(),
            itemCount: 3,
            totalPrice: 400
          }}>
            <CartView setView={mockSetView} />
          </CartContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  it('should render cart title', () => {
    renderWithEmptyCart();
    expect(screen.getByText('Your Cart')).toBeInTheDocument();
  });

  it('should show empty cart message when cart is empty', () => {
    renderWithEmptyCart();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('should show start shopping button when cart is empty', () => {
    renderWithEmptyCart();
    expect(screen.getByRole('button', { name: 'Start Shopping' })).toBeInTheDocument();
  });

  it('should navigate to home when start shopping is clicked', () => {
    renderWithEmptyCart();
    
    const button = screen.getByRole('button', { name: 'Start Shopping' });
    fireEvent.click(button);
    
    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });

  it('should render cart items when cart has items', () => {
    renderWithItems();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should render order summary', () => {
    renderWithItems();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('should show total price', () => {
    renderWithItems();
    expect(screen.getAllByText('₹400').length).toBeGreaterThan(0);
  });

  it('should show item count in subtotal', () => {
    renderWithItems();
    expect(screen.getByText(/Subtotal \(3 items\)/)).toBeInTheDocument();
  });

  it('should show free shipping', () => {
    renderWithItems();
    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('should render proceed to checkout button', () => {
    renderWithItems();
    expect(screen.getByRole('button', { name: 'Proceed to Checkout' })).toBeInTheDocument();
  });

  it('should navigate to checkout when proceed is clicked', () => {
    renderWithItems();
    
    const button = screen.getByRole('button', { name: 'Proceed to Checkout' });
    fireEvent.click(button);
    
    expect(mockSetView).toHaveBeenCalledWith({ type: 'checkout' });
  });
});
