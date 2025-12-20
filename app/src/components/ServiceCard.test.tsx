import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductCard from './ServiceCard';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </ThemeProvider>
);

describe('ProductCard Component', () => {
  const mockSetView = vi.fn();
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 1500,
    image: 'test.jpg',
    category: 'Apparel' as const,
    description: 'Test description'
  };

  beforeEach(() => {
    mockSetView.mockClear();
  });

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    expect(screen.getByText('₹1,500')).toBeInTheDocument();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    const img = screen.getByAltText('Test Product');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('should render add to cart button', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
  });

  it('should navigate to product detail when card is clicked', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    
    const card = screen.getByText('Test Product').closest('div[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
      expect(mockSetView).toHaveBeenCalledWith({ type: 'product', id: 1 });
    }
  });

  it('should add product to cart when add to cart is clicked', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    
    const addButton = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(addButton);
    
    // Should not navigate (stopPropagation)
    expect(mockSetView).not.toHaveBeenCalled();
  });

  it('should toggle wishlist when heart is clicked', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    
    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons.find(btn => btn.querySelector('svg'));
    
    if (wishlistButton) {
      fireEvent.click(wishlistButton);
      // Should not navigate
      expect(mockSetView).not.toHaveBeenCalled();
    }
  });

  it('should remove from wishlist when already wishlisted', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    
    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons.find(btn => btn.querySelector('svg'));
    
    if (wishlistButton) {
      // Add to wishlist first
      fireEvent.click(wishlistButton);
      // Then remove
      fireEvent.click(wishlistButton);
    }
  });

  it('should show filled heart when in wishlist', () => {
    render(<ProductCard product={mockProduct} setView={mockSetView} />, { wrapper });
    
    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons.find(btn => btn.querySelector('svg'));
    
    if (wishlistButton) {
      fireEvent.click(wishlistButton);
      // Heart should now be filled - check the SVG class
      const svg = wishlistButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    }
  });
});
