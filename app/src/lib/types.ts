export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: {
    name: 'Apparel' | 'Sneakers';
  };
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ViewType = 'home' | 'apparel' | 'sneakers' | 'cart' | 'checkout' | 'success' | 'wishlist' | 'product';

export type AppView =
  | { name: 'home' }
  | { name: 'apparel' }
  | { name: 'sneakers' }
  | { name: 'productDetail'; data: any }
  | { name: 'cart' }
  | { name: 'wishlist' }
  | { name: 'checkout' }
  | { name: 'success' }
  | { name: 'login' }
  | { name: 'signup' };