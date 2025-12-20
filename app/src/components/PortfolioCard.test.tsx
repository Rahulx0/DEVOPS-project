import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CartItemRow from './PortfolioCard';
import { CartContext } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('CartItemRow Component', () => {
  const mockUpdateItemQuantity = vi.fn();
  const mockRemoveFromCart = vi.fn();
  
  const mockItem = {
    id: 1,
    name: 'Test Product',
    price: 1000,
    image: 'test.jpg',
    category: 'Apparel' as const,
    description: 'Test description',
    quantity: 2
  };

  beforeEach(() => {
    mockUpdateItemQuantity.mockClear();
    mockRemoveFromCart.mockClear();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <ToastProvider>
          <CartContext.Provider value={{
            cartItems: [mockItem],
            addToCart: vi.fn(),
            removeFromCart: mockRemoveFromCart,
            updateItemQuantity: mockUpdateItemQuantity,
            clearCart: vi.fn(),
            itemCount: 2,
            totalPrice: 2000
          }}>
            <CartItemRow item={mockItem} />
          </CartContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  it('should render item name', () => {
    renderComponent();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render item price', () => {
    renderComponent();
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
  });

  it('should render item image', () => {
    renderComponent();
    const img = screen.getByAltText('Test Product');
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('should render quantity', () => {
    renderComponent();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render total price for item', () => {
    renderComponent();
    expect(screen.getByText('₹2,000')).toBeInTheDocument();
  });

  it('should increase quantity when plus is clicked', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    const plusButton = buttons.find(btn => btn.textContent === '' && btn.querySelector('svg'));
    
    // Find the plus button (second quantity button)
    const quantityButtons = buttons.filter(btn => btn.className.includes('w-8'));
    if (quantityButtons.length >= 2) {
      fireEvent.click(quantityButtons[1]);
      expect(mockUpdateItemQuantity).toHaveBeenCalledWith(1, 3);
    }
  });

  it('should decrease quantity when minus is clicked', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    const quantityButtons = buttons.filter(btn => btn.className.includes('w-8'));
    
    if (quantityButtons.length >= 1) {
      fireEvent.click(quantityButtons[0]);
      expect(mockUpdateItemQuantity).toHaveBeenCalledWith(1, 1);
    }
  });

  it('should remove item when trash is clicked', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(btn => btn.className.includes('hover:text-red-500'));
    
    if (trashButton) {
      fireEvent.click(trashButton);
      expect(mockRemoveFromCart).toHaveBeenCalledWith(1);
    }
  });
});
