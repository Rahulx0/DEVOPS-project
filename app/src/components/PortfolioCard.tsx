import React from 'react';
import { CartItem } from '../lib/types';
import { useCart } from '../hooks/useCart';
import { TrashIcon, PlusIcon, MinusIcon } from '../constants';
import { Button } from './ui/Button';

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateItemQuantity, removeFromCart } = useCart();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0">
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-bold text-lg text-text-dark">{item.name}</h3>
        <p className="text-text-light">₹{item.price.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="w-8 h-8"><MinusIcon className="w-4 h-4" /></Button>
        <span className="w-10 text-center font-bold">{item.quantity}</span>
        <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="w-8 h-8"><PlusIcon className="w-4 h-4" /></Button>
      </div>
      <p className="font-bold w-24 text-center sm:text-right text-text-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-text-light hover:text-red-500">
        <TrashIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default CartItemRow;
// CI: pipeline test 2025-11-20