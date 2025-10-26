import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AppView, Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { SearchIcon } from '@/constants';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { useToast } from '@/hooks/useToast';

interface ProductsPageProps {
  setView: (view: AppView) => void;
  category?: 'Apparel' | 'Sneakers';
}

const ProductsPage: React.FC<ProductsPageProps> = ({ category, setView }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(name)');

        if (error) {
          setError(error.message);
          showToast(`Error fetching products: ${error.message}`, { type: 'error' });
        } else {
          let items = (data as any[]) || [];
          if (category) {
            items = items.filter((p) => p.category?.name === category);
          }
          setProducts(items as Product[]);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, searchTerm, sortOrder]);

  if (loading) return <p className="text-center py-16">Loading products...</p>;
  if (error) return <p className="text-center py-16 text-red-500">Error: {error}</p>;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center text-primary">{category || 'All Products'}</h2>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="w-full md:w-auto">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Sort by</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} setView={setView} />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-light text-xl">No products found.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
