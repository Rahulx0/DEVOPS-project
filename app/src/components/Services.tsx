import React, { useState, useMemo } from 'react';
import { products } from '../lib/data';
import { AppView } from '../lib/types';
import ProductCard from './ServiceCard';
import { SearchIcon } from '../constants';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';


interface ProductsPageProps {
  setView: (view: AppView) => void;
  category: 'Apparel' | 'Sneakers';
}

const ProductsPage: React.FC<ProductsPageProps> = ({ category, setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  const filteredAndSortedProducts = useMemo(() => {
    let categoryProducts = products.filter(p => p.category === category);

    if (searchTerm) {
      categoryProducts = categoryProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOrder === 'price-asc') {
      categoryProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      categoryProducts.sort((a, b) => b.price - a.price);
    }

    return categoryProducts;
  }, [category, searchTerm, sortOrder]);

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