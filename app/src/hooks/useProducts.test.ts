import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';
import * as firebase from '../lib/firebase';

vi.mock('../lib/firebase');

describe('useProducts hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading state', () => {
    vi.mocked(firebase.getProducts).mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useProducts());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should return products on success', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100, image: 'img.jpg', category: 'Apparel' as const, description: 'Desc' }
    ];
    
    vi.mocked(firebase.getProducts).mockResolvedValue(mockProducts);
    
    const { result } = renderHook(() => useProducts());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('should return error on failure', async () => {
    vi.mocked(firebase.getProducts).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useProducts());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Failed to load products');
    expect(result.current.products).toEqual([]);
  });
});
