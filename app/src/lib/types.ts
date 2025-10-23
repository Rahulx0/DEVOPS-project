export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'Apparel' | 'Sneakers';
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewType = 'home' | 'apparel' | 'sneakers' | 'cart' | 'checkout' | 'success' | 'wishlist' | 'product';

export type AppView = 
  | { type: 'home' }
  | { type: 'apparel' }
  | { type: 'sneakers' }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'success' }
  | { type: 'wishlist' }
  | { type: 'product', id: number };