import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CheckoutView from './Team';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';

// Mock Razorpay
const mockRazorpayOpen = vi.fn();
const mockRazorpay = vi.fn().mockImplementation(() => ({
  open: mockRazorpayOpen,
}));

vi.stubGlobal('Razorpay', mockRazorpay);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <CartProvider>{children}</CartProvider>
  </ToastProvider>
);

describe('CheckoutView Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    mockRazorpay.mockClear();
    mockRazorpayOpen.mockClear();
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
    expect(screen.getByPlaceholderText('Pincode')).toBeInTheDocument();
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

    const pincodeInput = screen.getByPlaceholderText('Pincode');
    fireEvent.change(pincodeInput, { target: { value: '400001' } });

    expect(pincodeInput).toHaveValue('400001');
  });
});
