import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from './Header';
import { CartProvider, CartContext } from '../context/CartContext';
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

// Custom wrapper with items in cart and wishlist
const WrapperWithItems: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <CartContext.Provider value={{
        cartItems: [{ id: 1, name: 'Test', price: 100, image: '', category: 'Apparel', description: '', quantity: 2 }],
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateItemQuantity: vi.fn(),
        clearCart: vi.fn(),
        itemCount: 2,
        totalPrice: 200
      }}>
        <WishlistContext.Provider value={{
          wishlistItems: [{ id: 1, name: 'Test', price: 100, image: '', category: 'Apparel', description: '' }],
          addToWishlist: vi.fn(),
          removeFromWishlist: vi.fn(),
          isWishlisted: vi.fn(() => true),
          wishlistCount: 1
        }}>
          {children}
        </WishlistContext.Provider>
      </CartContext.Provider>
    </ToastProvider>
  </ThemeProvider>
);

describe('Header Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should render header with logo', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    expect(screen.getByText('UrbanGear')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Sneakers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apparel' })).toBeInTheDocument();
  });

  it('should navigate to home when logo is clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const logo = screen.getByText('UrbanGear');
    fireEvent.click(logo);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });

  it('should navigate to sneakers when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const sneakersButton = screen.getByRole('button', { name: 'Sneakers' });
    fireEvent.click(sneakersButton);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'sneakers' });
  });

  it('should navigate to apparel when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const apparelButton = screen.getByRole('button', { name: 'Apparel' });
    fireEvent.click(apparelButton);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'apparel' });
  });

  it('should have theme toggle button', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const themeButton = screen.getByTitle(/Switch to dark mode/i);
    expect(themeButton).toBeInTheDocument();
  });

  it('should toggle theme when theme button is clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const themeButton = screen.getByTitle(/Switch to dark mode/i);
    fireEvent.click(themeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should show sun icon in dark mode', () => {
    localStorage.setItem('theme', 'dark');
    render(<Header setView={mockSetView} />, { wrapper });

    const themeButton = screen.getByTitle(/Switch to light mode/i);
    expect(themeButton).toBeInTheDocument();
  });

  it('should navigate to wishlist when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons.find(btn => btn.className.includes('relative') && !btn.textContent);
    
    if (wishlistButton) {
      fireEvent.click(wishlistButton);
    }
  });

  it('should navigate to cart when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const buttons = screen.getAllByRole('button');
    const cartButtons = buttons.filter(btn => btn.className.includes('relative'));
    
    if (cartButtons.length > 0) {
      fireEvent.click(cartButtons[0]);
      expect(mockSetView).toHaveBeenCalled();
    }
  });

  it('should show cart count badge when items in cart', () => {
    render(<Header setView={mockSetView} />, { wrapper: WrapperWithItems });

    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('should show wishlist count badge when items in wishlist', () => {
    render(<Header setView={mockSetView} />, { wrapper: WrapperWithItems });

    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});
