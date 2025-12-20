import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from './Header';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  </ThemeProvider>
);

describe('Header Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
  });

  it('should render header with logo', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    expect(screen.getByText('UrbanGear')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Sneakers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apparel' })).toBeInTheDocument();
  });

  it('should navigate to home when logo is clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const logo = screen.getByText('UrbanGear');
    fireEvent.click(logo);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });

  it('should navigate to sneakers when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const sneakersButton = screen.getByRole('button', { name: 'Sneakers' });
    fireEvent.click(sneakersButton);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'sneakers' });
  });

  it('should navigate to apparel when clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const apparelButton = screen.getByRole('button', { name: 'Apparel' });
    fireEvent.click(apparelButton);

    expect(mockSetView).toHaveBeenCalledWith({ type: 'apparel' });
  });

  it('should have theme toggle button', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const themeButtons = screen.getAllByRole('button');
    const themeButton = themeButtons.find(btn => 
      btn.getAttribute('title')?.includes('mode')
    );
    expect(themeButton).toBeInTheDocument();
  });

  it('should toggle theme when theme button is clicked', () => {
    render(<Header setView={mockSetView} />, { wrapper });

    const themeButton = screen.getByTitle(/Switch to dark mode/i);
    fireEvent.click(themeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
