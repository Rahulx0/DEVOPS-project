import React from 'react';
import { useCart } from '../hooks/useCart';
import { AppView } from '../lib/types';
import CartItemRow from './PortfolioCard'; // Repurposed as CartItemRow
import { Button } from './ui/Button';

interface CartViewProps {
  setView: (view: AppView) => void;
}

const CartView: React.FC<CartViewProps> = ({ setView }) => {
  const { cartItems, totalPrice, itemCount } = useCart();

  return (
    <section className="py-16 bg-background min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center text-primary">Your Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-center text-text-light">
            <p className="text-2xl mb-4">Your cart is empty.</p>
            <Button size="lg" onClick={() => setView({type: 'home'})}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 space-y-4">
              {cartItems.map(item => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 self-start">
              <h3 className="text-2xl font-heading font-bold mb-4 border-b border-gray-200 pb-4 text-primary">Order Summary</h3>
              <div className="space-y-2 mb-4 text-text-dark">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-light">
                  <span>Shipping</span>
                  <span className="text-secondary font-semibold">FREE</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-primary">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <Button
                onClick={() => setView({type: 'checkout'})}
                className="w-full mt-6"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartView;
// CI: pipeline test 2025-11-20