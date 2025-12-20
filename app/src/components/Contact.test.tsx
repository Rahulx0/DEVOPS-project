import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SuccessView from './Contact';

describe('SuccessView Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
  });

  it('should render success message', () => {
    render(<SuccessView setView={mockSetView} />);
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('should render thank you message', () => {
    render(<SuccessView setView={mockSetView} />);
    expect(screen.getByText(/Thank you for your purchase/)).toBeInTheDocument();
  });

  it('should render continue shopping button', () => {
    render(<SuccessView setView={mockSetView} />);
    expect(screen.getByRole('button', { name: 'Continue Shopping' })).toBeInTheDocument();
  });

  it('should navigate to home when continue shopping is clicked', () => {
    render(<SuccessView setView={mockSetView} />);
    
    const button = screen.getByRole('button', { name: 'Continue Shopping' });
    fireEvent.click(button);
    
    expect(mockSetView).toHaveBeenCalledWith({ type: 'home' });
  });
});
