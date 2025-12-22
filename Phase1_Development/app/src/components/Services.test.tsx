import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductsPage from './Services';
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

describe('ProductsPage Component', () => {
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

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: 'Failed to load'
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should render category title', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    expect(screen.getByText('Apparel')).toBeInTheDocument();
  });

  it('should render products for category', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Shirt', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Nice shirt' },
        { id: 2, name: 'Sneaker', price: 200, image: 'img2.jpg', category: 'Sneakers', description: 'Nice sneaker' }
      ],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    expect(screen.getByText('Shirt')).toBeInTheDocument();
    expect(screen.queryByText('Sneaker')).not.toBeInTheDocument();
  });

  it('should filter products by search term', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Blue Shirt', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Nice' },
        { id: 2, name: 'Red Pants', price: 150, image: 'img2.jpg', category: 'Apparel', description: 'Nice' }
      ],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    
    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Blue' } });
    
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument();
    expect(screen.queryByText('Red Pants')).not.toBeInTheDocument();
  });

  it('should show no products message when empty', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('should sort products by price ascending', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Expensive', price: 500, image: 'img.jpg', category: 'Apparel', description: 'Nice' },
        { id: 2, name: 'Cheap', price: 100, image: 'img2.jpg', category: 'Apparel', description: 'Nice' }
      ],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    
    // Open sort dropdown
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Price: Low to High'));
    
    const products = screen.getAllByText(/₹/);
    expect(products[0]).toHaveTextContent('₹100');
  });

  it('should sort products by price descending', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Cheap', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Nice' },
        { id: 2, name: 'Expensive', price: 500, image: 'img2.jpg', category: 'Apparel', description: 'Nice' }
      ],
      loading: false,
      error: null
    });

    render(<ProductsPage setView={mockSetView} category="Apparel" />, { wrapper });
    
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Price: High to Low'));
    
    const products = screen.getAllByText(/₹/);
    expect(products[0]).toHaveTextContent('₹500');
  });
});
