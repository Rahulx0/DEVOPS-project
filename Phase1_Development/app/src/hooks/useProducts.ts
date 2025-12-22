import { useState, useEffect } from 'react';
import { Product } from '../lib/types';
import { getProducts } from '../lib/firebase';

// Custom hook to fetch and manage products data
export function useProducts() {
  // State for products list, loading status, and error message
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    // Async function to fetch products from Firebase
    async function fetchProducts() {
      // Set loading to true and fetch data
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch {
        // Handle fetch errors
        setError('Failed to load products');
      } finally {
        // Set loading to false
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Return products data and states
  return { products, loading, error };
}


