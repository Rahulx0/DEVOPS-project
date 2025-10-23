import React from 'react';
import { products } from '../lib/data';
import { AppView } from '../lib/types';
import ProductCard from './ServiceCard'; // Repurposed as ProductCard
import Hero from './Hero';

interface HomeProps {
  setView: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      <Hero setView={setView} />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <h3 className="text-secondary font-semibold tracking-widest uppercase mb-2">DON'T MISS OUT</h3>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
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

export default Home;