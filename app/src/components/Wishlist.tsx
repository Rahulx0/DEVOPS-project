import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { AppView, Product } from '../lib/types';
import { TrashIcon, ShoppingCartIcon } from '../constants';
import { useToast } from '../hooks/useToast';
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface WishlistViewProps {
  setView: (view: AppView) => void;
}

const WishlistView: React.FC<WishlistViewProps> = ({ setView }) => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const showToast = useToast();

  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
    showToast(`${product.name} moved to cart`);
  };
  
  const handleRemove = (product: Product) => {
    removeFromWishlist(product.id);
    showToast(`${product.name} removed from wishlist`);
  }

  return (
    <section className="py-16 bg-background min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center text-primary">Your Wishlist</h2>
        {wishlistItems.length === 0 ? (
          <div className="text-center text-text-light">
            <p className="text-2xl mb-4">Your wishlist is empty.</p>
            <Button size="lg" onClick={() => setView({type: 'home'})}>
              Discover Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map(item => (
              <Card key={item.id} className="flex flex-col group overflow-hidden">
                <CardHeader 
                    className="p-0 relative h-64 sm:h-80 overflow-hidden cursor-pointer"
                    onClick={() => setView({type: 'product', id: item.id})}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </CardHeader>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-heading font-bold mb-2 flex-grow text-text-dark">{item.name}</h3>
                  <p className="text-xl font-semibold text-text-light">₹{item.price.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex gap-2">
                    <Button 
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1">
                        <ShoppingCartIcon className="w-5 h-5 mr-2"/>
                        Move to Cart
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemove(item)}
                      >
                      <TrashIcon className="w-5 h-5"/>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistView;