import React from 'react';
import { Product, AppView } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/useToast';
import { HeartIcon, ShoppingCartIcon } from '@/constants';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  setView: (view: AppView) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, setView }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    showToast('Added to cart');
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
    showToast(isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="group relative border rounded-lg overflow-hidden">
      <div className="w-full h-64 bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <a href="#" onClick={() => setView({ name: 'productDetail', data: product })}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </a>
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.category.name}</p>
        <p className="mt-2 text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={handleAddToCart} className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Add to Cart</span>
          </Button>
          <Button onClick={handleAddToWishlist} variant="ghost">
            <HeartIcon className={`h-6 w-6 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
