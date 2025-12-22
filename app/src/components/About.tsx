// Home/About page component
import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { AppView } from '../lib/types';
import ProductCard from './ServiceCard';
import Hero from './Hero';

// Props for Home component
interface HomeProps {
  setView: (view: AppView) => void;
}

// Home component displays hero and featured products
const Home: React.FC<HomeProps> = ({ setView }) => {
  // Fetch products and loading state
  const { products, loading } = useProducts();
  // Select first 4 products as featured
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      {/* Hero section at top */}
      <Hero setView={setView} />
      {/* Featured products section */}
      <section className="py-20 bg-background dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <h3 className="text-secondary font-semibold tracking-widest uppercase mb-2">DON'T MISS OUT</h3>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary dark:text-white mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Show loading message while products are loading
              <p className="col-span-4 text-text-light dark:text-gray-400">Loading products...</p>
            ) : featuredProducts.map((product, index) => (
              // Render each featured product card
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${400 + index * 100}ms`, opacity: 0 }}>
                <ProductCard product={product} setView={setView} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Export Home component as default
export default Home;
// CI: pipeline test 2025-11-20