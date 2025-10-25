import React from 'react';
import { AppView, Product } from '../lib/types';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { HeartIcon } from '../constants';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  setView: (view: AppView) => void;
  setSelectedProductId?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, setView, setSelectedProductId }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isWishlisted, removeFromWishlist } = useWishlist();
  const showToast = useToast();
  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.name} added to cart`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast(`${product.name} added to wishlist`);
    }
  };

  const handleProductClick = () => {
    if (setSelectedProductId) {
      setSelectedProductId(product.id);
    }
    setView({ type: 'product', id: product.id });
  };

  return (
    <Card 
      className="flex flex-col group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      onClick={handleProductClick}
    >
      <CardHeader className="p-0">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src={product.image || product.image_url || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <Button 
            variant="secondary"
            size="icon"
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 bg-white/80 text-text-light hover:text-red-500 rounded-full"
          >
            <HeartIcon className={`w-6 h-6 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-heading font-bold mb-2 flex-grow text-text-dark">{product.name}</h3>
        <p className="text-xl font-semibold text-text-light mb-4">₹{product.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
         <Button onClick={handleAddToCart} className="w-full">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;