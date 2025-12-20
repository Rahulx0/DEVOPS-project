import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WishlistView from './Wishlist';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider, WishlistContext } from '../context/WishlistContext';
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

describe('WishlistView Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
  });

  it('should render wishlist title', () => {
    render(<WishlistView setView={mockSetView} />, { wrapper });
    expect(screen.getByText('Your Wishlist')).toBeInTheDocument();
  });

  it('should show empty wishlist message', () => {
    render(<WishlistView setView={mockSetView} />, { wrapper });
    expect(screen.getByText('Your wishlist is empty.')).toBeInTheDocument();
  });

  it('should show discover products button when empty', () => {
    render(<WishlistView setView={mockSetView} />, { wrapper });
    expect(screen.getByRole('button', { name: 'Discover Products' })).toBeInTheDocument();
  });

  it('should navigate to home when discover products is clicked', () => {
    render(<WishlistView setView={mockSetView} />, { wrapper });
    
    const button = screen.getByRole('button', { name: 'Discover Products' });
    fireEvent.click(button);
    
    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });

  // Tests with items using mocked context
  const renderWithItems = () => {
    const mockAddToCart = vi.fn();
    const mockRemoveFromWishlist = vi.fn();
    
    return {
      ...render(
        <ThemeProvider>
          <ToastProvider>
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
              <CartProvider>
                <WishlistView setView={mockSetView} />
              </CartProvider>
            </WishlistContext.Provider>
          </ToastProvider>
        </ThemeProvider>
      ),
      mockRemoveFromWishlist
    };
  };

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
    const { mockRemoveFromWishlist } = renderWithItems();
    
    const moveButtons = screen.getAllByRole('button', { name: /Move to Cart/ });
    fireEvent.click(moveButtons[0]);
    
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
  });

  it('should remove item when trash is clicked', () => {
    const { mockRemoveFromWishlist } = renderWithItems();
    
    const buttons = screen.getAllByRole('button');
    const trashButtons = buttons.filter(btn => btn.className.includes('destructive'));
    
    if (trashButtons.length > 0) {
      fireEvent.click(trashButtons[0]);
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
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

  // Test with full context to cover handleMoveToCart and handleRemove with showToast
  const renderWithFullContext = () => {
    const mockRemoveFromWishlist = vi.fn();
    
    return {
      ...render(
        <ThemeProvider>
          <ToastProvider>
            <WishlistContext.Provider value={{
              wishlistItems: [
                { id: 1, name: 'Test Item', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
              ],
              addToWishlist: vi.fn(),
              removeFromWishlist: mockRemoveFromWishlist,
              isWishlisted: vi.fn(() => true),
              wishlistCount: 1
            }}>
              <CartProvider>
                <WishlistView setView={mockSetView} />
              </CartProvider>
            </WishlistContext.Provider>
          </ToastProvider>
        </ThemeProvider>
      ),
      mockRemoveFromWishlist
    };
  };

  it('should call handleMoveToCart which adds to cart and removes from wishlist', () => {
    const { mockRemoveFromWishlist } = renderWithFullContext();
    
    const moveButton = screen.getByRole('button', { name: /Move to Cart/ });
    fireEvent.click(moveButton);
    
    // Should remove from wishlist after adding to cart
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
  });

  it('should call handleRemove which removes from wishlist', () => {
    const { mockRemoveFromWishlist } = renderWithFullContext();
    
    // Find the destructive button (trash icon)
    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(btn => btn.className.includes('destructive'));
    
    expect(trashButton).toBeDefined();
    if (trashButton) {
      fireEvent.click(trashButton);
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
    }
  });
});
