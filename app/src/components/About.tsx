import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, AppView } from '../lib/types';
import ProductCard from './ServiceCard'; // Repurposed as ProductCard
import Hero from './Hero';

interface HomeProps {
  setView: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .limit(4);

      if (fetchError) {
        console.error('Error fetching featured products:', fetchError);
        setError('Failed to load featured products. Please try again later.');
      } else {
        setFeaturedProducts(data || []);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <Hero setView={setView} />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <h3 className="text-secondary font-semibold tracking-widest uppercase mb-2">DON'T MISS OUT</h3>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-12">Featured Products</h2>
          {loading ? (
            <div className="text-center py-10">Loading featured products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${400 + index * 100}ms`, opacity: 0 }}>
                  <ProductCard product={product} setView={setView} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light">No featured products available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;