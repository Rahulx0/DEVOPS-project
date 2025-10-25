import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, AppView } from '../lib/types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import { HeartIcon, ShoppingCartIcon } from '../constants';
import { Button } from './ui/Button';

interface ProductDetailProps {
  setView: (view: AppView) => void;
  productId: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, setView }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const showToast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Error fetching product:', fetchError);
        setError('Failed to load product details. Please try again later.');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-heading font-bold text-red-500 mb-4">Error</h2>
        <p className="text-xl mb-4">{error}</p>
        <Button onClick={() => setView({type: 'home'})} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-heading font-bold">Product not found</h2>
        <Button onClick={() => setView({type: 'home'})} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }
  
  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast(`${product.name} added to wishlist`);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <img src={product.image || product.image_url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
          </div>
          <div>
            <Button variant="link" onClick={() => setView({ type: 'products', category: product.category || 'Apparel' })} className="text-sm p-0 h-auto mb-2">
              &larr; Back to {product.category || 'Products'}
            </Button>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">{product.name}</h1>
            <p className="text-3xl font-semibold text-text-light mb-6">₹{product.price.toLocaleString()}</p>
            <p className="text-text-light leading-relaxed mb-8">{product.description}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                Add to Cart
              </Button>
              <Button
                onClick={handleWishlistToggle}
                size="lg"
                variant={inWishlist ? 'destructive' : 'outline'}
                className="flex-1"
              >
                <HeartIcon className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;