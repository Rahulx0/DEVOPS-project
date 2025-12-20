import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from './Footer';

describe('Footer Component', () => {
  it('should render footer', () => {
    render(<Footer />);

    expect(screen.getByText('UrbanGear')).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(<Footer />);

    expect(screen.getByText('Elevate Your Street Style.')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<Footer />);

    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FAQ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Returns' })).toBeInTheDocument();
  });

  it('should render copyright with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
  });
});
