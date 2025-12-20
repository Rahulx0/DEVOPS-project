import { describe, it, expect } from 'vitest';
import type { Product, CartItem, AppView } from './types';

describe('Types', () => {
  it('should create a valid Product', () => {
    const product: Product = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category: 'Apparel',
      description: 'A test product',
    };

    expect(product.id).toBe(1);
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(99.99);
    expect(product.category).toBe('Apparel');
  });

  it('should create a valid CartItem', () => {
    const cartItem: CartItem = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category: 'Sneakers',
      description: 'A test product',
      quantity: 2,
    };

    expect(cartItem.quantity).toBe(2);
    expect(cartItem.category).toBe('Sneakers');
  });

  it('should create valid AppView types', () => {
    const homeView: AppView = { type: 'home' };
    const productView: AppView = { type: 'product', id: 1 };
    const cartView: AppView = { type: 'cart' };

    expect(homeView.type).toBe('home');
    expect(productView.type).toBe('product');
    if (productView.type === 'product') {
      expect(productView.id).toBe(1);
    }
    expect(cartView.type).toBe('cart');
  });
});
