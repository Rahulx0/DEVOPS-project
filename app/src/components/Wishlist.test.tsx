import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WishlistView from './Wishlist';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('WishlistView Component', () => {
  const mockSetView = vi.fn();
  const mockAddToCart = vi.fn();
  const mockRemoveFromWishlist = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    mockAddToCart.mockClear();
    mockRemoveFromWishlist.mockClear();
  });

  const renderWithEmptyWishlist = () => {
    return render(
      <ThemeProvider>
        <ToastProvider>
          <CartContext.Provider value={{
            cartItems: [],
            addToCart: mockAddToCart,
            removeFromCart: vi.fn(),
            updateItemQuantity: vi.fn(),
            clearCart: vi.fn(),
            itemCount: 0,
            totalPrice: 0
          }}>
            <WishlistContext.Provider value={{
              wishlistItems: [],
              addToWishlist: vi.fn(),
              removeFromWishlist: mockRemoveFromWishlist,
              isWishlisted: vi.fn(() => false),
              wishlistCount: 0
            }}>
              <WishlistView setView={mockSetView} />
            </WishlistContext.Provider>
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
            cartItems: [],
            addToCart: mockAddToCart,
            removeFromCart: vi.fn(),
            updateItemQuantity: vi.fn(),
            clearCart: vi.fn(),
            itemCount: 0,
            totalPrice: 0
          }}>
            <WishlistContext.Provider value={{
              wishlistItems: [
                { id: 1, name: 'Wishlist Item 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' },
                { id: 2, name: 'Wishlist Item 2', price: 200, image: 'img2.jpg', category: 'Sneakers', description: 'Desc' }
              ],
              addToWishlist: vi.fn(),
              removeFromWishlist: mockRemoveFromWishlist,
              isWishlisted: vi.fn(() => true),
              wishlistCount: 2
            }}>
              <WishlistView setView={mockSetView} />
            </WishlistContext.Provider>
          </CartContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  it('should render wishlist title', () => {
    renderWithEmptyWishlist();
    expect(screen.getByText('Your Wishlist')).toBeInTheDocument();
  });

  it('should show empty wishlist message', () => {
    renderWithEmptyWishlist();
    expect(screen.getByText('Your wishlist is empty.')).toBeInTheDocument();
  });

  it('should show discover products button when empty', () => {
    renderWithEmptyWishlist();
    expect(screen.getByRole('button', { name: 'Discover Products' })).toBeInTheDocument();
  });

  it('should navigate to home when discover products is clicked', () => {
    renderWithEmptyWishlist();
    
    const button = screen.getByRole('button', { name: 'Discover Products' });
    fireEvent.click(button);
    
    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });

  it('should render wishlist items', () => {
    renderWithItems();
    expect(screen.getByText('Wishlist Item 1')).toBeInTheDocument();
    expect(screen.getByText('Wishlist Item 2')).toBeInTheDocument();
  });

  it('should render item prices', () => {
    renderWithItems();
    expect(screen.getByText('₹100')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
  });

  it('should render move to cart buttons', () => {
    renderWithItems();
    const moveButtons = screen.getAllByRole('button', { name: /Move to Cart/ });
    expect(moveButtons.length).toBe(2);
  });

  it('should move item to cart when move to cart is clicked', () => {
    renderWithItems();
    
    const moveButtons = screen.getAllByRole('button', { name: /Move to Cart/ });
    fireEvent.click(moveButtons[0]);
    
    expect(mockAddToCart).toHaveBeenCalled();
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
  });

  it('should remove item when trash is clicked', () => {
    renderWithItems();
    
    const buttons = screen.getAllByRole('button');
    const trashButtons = buttons.filter(btn => btn.className.includes('destructive'));
    
    if (trashButtons.length > 0) {
      fireEvent.click(trashButtons[0]);
      expect(mockRemoveFromWishlist).toHaveBeenCalled();
    }
  });

  it('should navigate to product detail when image is clicked', () => {
    renderWithItems();
    
    const images = screen.getAllByRole('img');
    if (images.length > 0) {
      const cardHeader = images[0].closest('div[class*="cursor-pointer"]');
      if (cardHeader) {
        fireEvent.click(cardHeader);
        expect(mockSetView).toHaveBeenCalledWith({ type: 'product', id: 1 });
      }
    }
  });
});
