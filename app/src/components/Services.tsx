import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, AppView } from '../lib/types';
import ProductCard from './ServiceCard';
import { SearchIcon } from '../constants';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

interface ProductsPageProps {
  setView: (view: AppView) => void;
  setSelectedProductId: (id: number) => void;
  category: 'Apparel' | 'Sneakers';
}

const ProductsPage: React.FC<ProductsPageProps> = ({ category, setView, setSelectedProductId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      // Query the categories table to get the ID for the given category name
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (categoryError || !categoryData) {
        setError(categoryError?.message || 'Category not found.');
        console.error("Error fetching category:", categoryError);
        setLoading(false);
        return;
      }

      const { data, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id);

      if (productsError) {
        setError(productsError.message);
        console.error("Error fetching products:", productsError);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
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

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error fetching products. Please check the console for details.</div>;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center text-primary">{category}</h2>
        
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
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} setView={setView} setSelectedProductId={setSelectedProductId} />
            ))}
          </div>
        ) : (
            <p className="text-center text-text-light text-xl">No products found for this category.</p>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;