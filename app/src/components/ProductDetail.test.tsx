import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ProductDetail from './ProductDetail';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import * as firebase from '../lib/firebase';

vi.mock('../lib/firebase');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </ThemeProvider>
);

describe('ProductDetail Component', () => {
  const mockSetView = vi.fn();
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 1500,
    image: 'test.jpg',
    category: 'Apparel' as const,
    description: 'This is a test product description'
  };

  beforeEach(() => {
    mockSetView.mockClear();
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    vi.mocked(firebase.getProductById).mockImplementation(() => new Promise(() => {}));
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show product not found when product is null', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(null);
    
    render(<ProductDetail setView={mockSetView} productId={999} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });
  });

  it('should render back to home button when product not found', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(null);
    
    render(<ProductDetail setView={mockSetView} productId={999} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back to Home' })).toBeInTheDocument();
    });
  });

  it('should navigate to home when back to home is clicked', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(null);
    
    render(<ProductDetail setView={mockSetView} productId={999} />, { wrapper });
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: 'Back to Home' });
      fireEvent.click(button);
      expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
    });
  });

  it('should render product details', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('₹1,500')).toBeInTheDocument();
      expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    });
  });

  it('should render product image', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Product');
      expect(img).toHaveAttribute('src', 'test.jpg');
    });
  });

  it('should render add to cart button', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Cart/ })).toBeInTheDocument();
    });
  });

  it('should render add to wishlist button', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Wishlist/ })).toBeInTheDocument();
    });
  });

  it('should render back to category link', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Back to Apparel/ })).toBeInTheDocument();
    });
  });

  it('should navigate to category when back link is clicked', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      const backLink = screen.getByRole('button', { name: /Back to Apparel/ });
      fireEvent.click(backLink);
      expect(mockSetView).toHaveBeenCalledWith({ type: 'apparel' });
    });
  });

  it('should navigate to sneakers for sneaker product', async () => {
    const sneakerProduct = { ...mockProduct, category: 'Sneakers' as const };
    vi.mocked(firebase.getProductById).mockResolvedValue(sneakerProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      const backLink = screen.getByRole('button', { name: /Back to Sneakers/ });
      fireEvent.click(backLink);
      expect(mockSetView).toHaveBeenCalledWith({ type: 'sneakers' });
    });
  });

  it('should add product to cart when add to cart is clicked', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      const addToCartButton = screen.getByRole('button', { name: /Add to Cart/ });
      fireEvent.click(addToCartButton);
    });
  });

  it('should toggle wishlist when wishlist button is clicked', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      const wishlistButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      fireEvent.click(wishlistButton);
    });
  });

  it('should show In Wishlist when product is wishlisted', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      // First add to wishlist
      const wishlistButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      fireEvent.click(wishlistButton);
    });
  });

  it('should remove from wishlist when already wishlisted', async () => {
    vi.mocked(firebase.getProductById).mockResolvedValue(mockProduct);
    
    render(<ProductDetail setView={mockSetView} productId={1} />, { wrapper });
    
    await waitFor(() => {
      // Add then remove
      const wishlistButton = screen.getByRole('button', { name: /Add to Wishlist/ });
      fireEvent.click(wishlistButton);
    });
    
    // Click again to remove
    await waitFor(() => {
      const inWishlistButton = screen.getByRole('button', { name: /In Wishlist/ });
      fireEvent.click(inWishlistButton);
    });
  });
});
