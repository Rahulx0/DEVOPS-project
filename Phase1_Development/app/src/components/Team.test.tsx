import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CheckoutView from './Team';
import { CartProvider, CartContext } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';

// Mock Razorpay as a constructor function
const mockRazorpayOpen = vi.fn();
let lastRazorpayOptions: Record<string, unknown> | null = null;

class MockRazorpay {
  options: Record<string, unknown>;
  constructor(options: Record<string, unknown>) {
    this.options = options;
    lastRazorpayOptions = options;
  }
  open() {
    mockRazorpayOpen();
  }
}

vi.stubGlobal('Razorpay', MockRazorpay);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <CartProvider>{children}</CartProvider>
  </ToastProvider>
);

// Wrapper with items in cart
const WrapperWithCartItems: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    <CartContext.Provider value={{
      cartItems: [{ id: 1, name: 'Test Product', price: 100, image: '', category: 'Apparel', description: '', quantity: 2 }],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateItemQuantity: vi.fn(),
      clearCart: vi.fn(),
      itemCount: 2,
      totalPrice: 200
    }}>
      {children}
    </CartContext.Provider>
  </ToastProvider>
);

describe('CheckoutView Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    mockRazorpayOpen.mockClear();
    lastRazorpayOptions = null;
  });

  it('should render checkout page', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pincode (6 digits)')).toBeInTheDocument();
  });

  it('should have default values in form', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const nameInput = screen.getByPlaceholderText('Full Name');
    const emailInput = screen.getByPlaceholderText('Email Address');

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test.user@example.com');
  });

  it('should render order summary', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('should render pay button', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const payButton = screen.getByRole('button', { name: /Pay/i });
    expect(payButton).toBeInTheDocument();
  });

  it('should disable pay button when cart is empty', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const payButton = screen.getByRole('button', { name: /Pay/i });
    expect(payButton).toBeDisabled();
  });

  it('should show alert when submitting with empty cart', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const form = screen.getByRole('button', { name: /Pay/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(alertMock).toHaveBeenCalledWith('Your cart is empty.');
    alertMock.mockRestore();
  });

  it('should allow input in form fields', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const addressInput = screen.getByPlaceholderText('Address');
    fireEvent.change(addressInput, { target: { value: '123 Test Street' } });

    expect(addressInput).toHaveValue('123 Test Street');
  });

  it('should allow input in city field', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const cityInput = screen.getByPlaceholderText('City');
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });

    expect(cityInput).toHaveValue('Mumbai');
  });

  it('should allow input in pincode field', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper });

    const pincodeInput = screen.getByPlaceholderText('Pincode (6 digits)');
    fireEvent.change(pincodeInput, { target: { value: '400001' } });

    expect(pincodeInput).toHaveValue('400001');
  });

  it('should enable pay button when cart has items', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper: WrapperWithCartItems });

    const payButton = screen.getByRole('button', { name: /Pay/i });
    expect(payButton).not.toBeDisabled();
  });

  it('should show correct total price', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper: WrapperWithCartItems });

    expect(screen.getByText(/Pay ₹200/)).toBeInTheDocument();
  });

  it('should open Razorpay when form is submitted with items in cart', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper: WrapperWithCartItems });

    const addressInput = screen.getByPlaceholderText('Address');
    const cityInput = screen.getByPlaceholderText('City');
    const pincodeInput = screen.getByPlaceholderText('Pincode (6 digits)');

    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    fireEvent.change(pincodeInput, { target: { value: '400001' } });

    const form = screen.getByRole('button', { name: /Pay/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockRazorpayOpen).toHaveBeenCalled();
  });

  it('should call Razorpay with correct options', () => {
    render(<CheckoutView setView={mockSetView} />, { wrapper: WrapperWithCartItems });

    const addressInput = screen.getByPlaceholderText('Address');
    const cityInput = screen.getByPlaceholderText('City');
    const pincodeInput = screen.getByPlaceholderText('Pincode (6 digits)');

    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    fireEvent.change(pincodeInput, { target: { value: '400001' } });

    const form = screen.getByRole('button', { name: /Pay/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(lastRazorpayOptions).toMatchObject({
      key: 'rzp_test_1DPvlsxVqlfD9I',
      amount: 20000, // 200 * 100
      currency: 'INR',
      name: 'UrbanGear',
    });
  });

  it('should call setView with success after payment handler is called', () => {
    const mockClearCart = vi.fn();
    const WrapperWithMockClear: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ToastProvider>
        <CartContext.Provider value={{
          cartItems: [{ id: 1, name: 'Test', price: 100, image: '', category: 'Apparel', description: '', quantity: 1 }],
          addToCart: vi.fn(),
          removeFromCart: vi.fn(),
          updateItemQuantity: vi.fn(),
          clearCart: mockClearCart,
          itemCount: 1,
          totalPrice: 100
        }}>
          {children}
        </CartContext.Provider>
      </ToastProvider>
    );

    render(<CheckoutView setView={mockSetView} />, { wrapper: WrapperWithMockClear });

    const addressInput = screen.getByPlaceholderText('Address');
    const cityInput = screen.getByPlaceholderText('City');
    const pincodeInput = screen.getByPlaceholderText('Pincode (6 digits)');

    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    fireEvent.change(cityInput, { target: { value: 'Mumbai' } });
    fireEvent.change(pincodeInput, { target: { value: '400001' } });

    const form = screen.getByRole('button', { name: /Pay/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Simulate Razorpay success callback
    if (lastRazorpayOptions?.handler) {
      (lastRazorpayOptions.handler as (response: { razorpay_payment_id: string }) => void)({ razorpay_payment_id: 'test_payment_123' });
    }

    expect(mockClearCart).toHaveBeenCalled();
    expect(mockSetView).toHaveBeenCalledWith({ type: 'success' });
  });
});
