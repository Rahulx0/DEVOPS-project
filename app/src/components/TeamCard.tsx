import React from 'react';
import { useCart } from '../hooks/useCart';

const CheckoutSummary: React.FC = () => {
  const { cartItems, totalPrice } = useCart();
  
  return (
    <div>
      <h3 className="text-2xl font-heading font-bold mb-4 border-b border-gray-200 pb-4 text-primary">Order Summary</h3>
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="truncate pr-2 text-text-dark">{item.name} x{item.quantity}</span>
            <span className="flex-shrink-0 text-text-light">₹{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-primary">
        <span>Total</span>
        <span>₹{totalPrice.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default CheckoutSummary;