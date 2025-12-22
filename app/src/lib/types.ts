// Product interface
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'Apparel' | 'Sneakers';
  description: string;
}

// CartItem interface extending Product with quantity
export interface CartItem extends Product {
  quantity: number;
}

// ViewType for simple view types
export type ViewType = 'home' | 'apparel' | 'sneakers' | 'cart' | 'checkout' | 'success' | 'wishlist' | 'product';

// AppView union type for app view states
export type AppView = 
  | { type: 'home' }
  | { type: 'apparel' }
  | { type: 'sneakers' }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'success' }
  | { type: 'wishlist' }
  | { type: 'product', id: number }
  | { type: 'admin' };
