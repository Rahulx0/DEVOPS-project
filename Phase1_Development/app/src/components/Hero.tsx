import React, { useState, useEffect } from 'react';
import { SparklesIcon, ArrowRightIcon } from '../constants';
import { AppView } from '../lib/types';
import { Button } from './ui/Button';

const Hero: React.FC<{ setView: (view: AppView) => void }> = ({ setView }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getStyle = (delay: number) => ({
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
  });

  return (
    <section id="home" className="bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tighter leading-tight text-text-dark dark:text-white">
              <span className="block" style={getStyle(100)}>ELEVATE</span>
              <span className="block text-primary" style={getStyle(200)}>YOUR</span>
              <span className="block text-primary" style={getStyle(300)}>STREET STYLE</span>
            </h1>
            <p style={getStyle(400)} className="mt-6 text-base sm:text-lg text-text-light dark:text-gray-300 max-w-md mx-auto md:mx-0">
              Premium streetwear and exclusive sneakers. Curated collections for those
              who value quality, comfort, and authentic style.
            </p>
            <div className="mt-8" style={getStyle(500)}>
              <Button 
                size="lg"
                onClick={() => setView({ type: 'apparel' })} >
                <SparklesIcon className="w-5 h-5" />
                <span>Shop latest Collection</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center" style={getStyle(300)}>
            <img 
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Stylish man in streetwear" 
              className="rounded-lg shadow-2xl w-full max-w-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
// CI: pipeline test 2025-11-20