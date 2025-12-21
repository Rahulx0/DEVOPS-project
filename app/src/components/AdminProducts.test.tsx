import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import AdminProducts from './AdminProducts';
import * as useProductsModule from '../hooks/useProducts';
import * as firebase from '../lib/firebase';

vi.mock('../hooks/useProducts');
vi.mock('../lib/firebase');
vi.mock('../scripts/seedProducts', () => ({
  sampleProducts: [
    { name: 'Sample 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
  ]
}));

// Mock window.confirm
const mockConfirm = vi.fn(() => true);
globalThis.confirm = mockConfirm;

// Store original location
const originalLocation = window.location;

describe('AdminProducts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalLocation, reload: vi.fn() } as any;
  });

  afterEach(() => {
    // Restore original location
    window.location = originalLocation;
  });

  it('should render admin title', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('🛠️ Admin - Manage Products')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: true,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: 'Failed to load'
    });

    render(<AdminProducts />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should render empty products message', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('No products yet. Add your first product above!')).toBeInTheDocument();
  });

  it('should render add product form', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Product Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Image URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
  });

  it('should render bulk import section', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('📦 Bulk Import')).toBeInTheDocument();
  });

  it('should render products list', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('$100 • Apparel')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    const nameInput = screen.getByPlaceholderText('Product Name');
    fireEvent.change(nameInput, { target: { value: 'New Product' } });
    expect(nameInput).toHaveValue('New Product');

    const priceInput = screen.getByPlaceholderText('Price');
    fireEvent.change(priceInput, { target: { value: '150' } });
    expect(priceInput).toHaveValue(150);
  });

  it('should handle category change', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'Sneakers' } });
    expect(categorySelect).toHaveValue('Sneakers');
  });

  it('should submit form and add product', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });
    vi.mocked(firebase.addProduct).mockResolvedValue(1);

    render(<AdminProducts />);
    
    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Image URL'), { target: { value: 'img.jpg' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Desc' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    
    await waitFor(() => {
      expect(firebase.addProduct).toHaveBeenCalled();
    });
  });

  it('should handle form submission error', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });
    vi.mocked(firebase.addProduct).mockRejectedValue(new Error('Failed'));

    render(<AdminProducts />);
    
    fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Image URL'), { target: { value: 'img.jpg' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Desc' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should toggle product selection', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should select all products', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' },
        { id: 2, name: 'Product 2', price: 200, image: 'img2.jpg', category: 'Sneakers', description: 'Desc' }
      ],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByText('Select All'));
    
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(cb => expect(cb).toBeChecked());
  });

  it('should deselect all products', () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    // Select all first
    fireEvent.click(screen.getByText('Select All'));
    // Then deselect
    fireEvent.click(screen.getByText('Deselect All'));
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should delete selected products', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });
    vi.mocked(firebase.deleteProduct).mockResolvedValue(undefined);

    render(<AdminProducts />);
    
    // Select product
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Click delete
    fireEvent.click(screen.getByText(/Delete Selected/));
    
    await waitFor(() => {
      expect(firebase.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete when confirm is cancelled', async () => {
    mockConfirm.mockReturnValue(false);
    
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Delete Selected/));
    
    expect(firebase.deleteProduct).not.toHaveBeenCalled();
  });

  it('should handle bulk import', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });
    vi.mocked(firebase.addProduct).mockResolvedValue(1);

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByText(/Import 1 Products/));
    
    await waitFor(() => {
      expect(firebase.addProduct).toHaveBeenCalled();
    });
  });

  it('should not import when confirm is cancelled', () => {
    mockConfirm.mockReturnValue(false);
    
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByText(/Import 1 Products/));
    
    expect(firebase.addProduct).not.toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [
        { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel', description: 'Desc' }
      ],
      loading: false,
      error: null
    });
    vi.mocked(firebase.deleteProduct).mockRejectedValue(new Error('Delete failed'));

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Delete Selected/));
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should handle bulk import error', async () => {
    vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
      products: [],
      loading: false,
      error: null
    });
    vi.mocked(firebase.addProduct).mockRejectedValue(new Error('Import failed'));

    render(<AdminProducts />);
    
    fireEvent.click(screen.getByText(/Import 1 Products/));
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
