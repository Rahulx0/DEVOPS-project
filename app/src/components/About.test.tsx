import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Home from './About';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import * as useProductsModule from '../hooks/useProducts';

vi.mock('../hooks/useProducts');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </ThemeProvider>
);

describe('Home Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
  });

  it('should render loading state', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: true,
      error: null
    });

    render(<Home setView={mockSetView} />, { wrapper });
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should render featured products section', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img1.jpg', category: 'Apparel', description: 'Desc 1' },
        { id: 2, name: 'Product 2', price: 200, image: 'img2.jpg', category: 'Sneakers', description: 'Desc 2' }
      ],
      loading: false,
      error: null
    });

    render(<Home setView={mockSetView} />, { wrapper });
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should render hero section', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<Home setView={mockSetView} />, { wrapper });
    expect(screen.getByText("DON'T MISS OUT")).toBeInTheDocument();
  });
});
