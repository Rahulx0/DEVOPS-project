export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  category?: 'Apparel' | 'Sneakers';
  category_id?: number;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewType = 'home' | 'apparel' | 'sneakers' | 'cart' | 'checkout' | 'success' | 'wishlist' | 'product';

export type AppView = 
  | { type: 'home' }
  | { type: 'products', category?: 'Apparel' | 'Sneakers' }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'success' }
  | { type: 'wishlist' }
  | { type: 'product', id: number };