import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import Hero from './Hero';

describe('Hero Component', () => {
  const mockSetView = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockSetView.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render hero section', () => {
    render(<Hero setView={mockSetView} />);

    expect(screen.getByText('ELEVATE')).toBeInTheDocument();
    expect(screen.getByText('YOUR')).toBeInTheDocument();
    expect(screen.getByText('STREET STYLE')).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<Hero setView={mockSetView} />);

    expect(screen.getByText(/Premium streetwear/i)).toBeInTheDocument();
  });

  it('should render shop button', () => {
    render(<Hero setView={mockSetView} />);

    expect(screen.getByRole('button', { name: /Shop latest Collection/i })).toBeInTheDocument();
  });

  it('should render hero image', () => {
    render(<Hero setView={mockSetView} />);

    const image = screen.getByAltText('Stylish man in streetwear');
    expect(image).toBeInTheDocument();
  });

  it('should call setView when shop button is clicked', async () => {
    render(<Hero setView={mockSetView} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const shopButton = screen.getByRole('button', { name: /Shop latest Collection/i });
    shopButton.click();

    expect(mockSetView).toHaveBeenCalledWith({ type: 'apparel' });
  });

  it('should animate elements after mount', () => {
    render(<Hero setView={mockSetView} />);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const elevateText = screen.getByText('ELEVATE');
    expect(elevateText).toBeInTheDocument();
  });
});
