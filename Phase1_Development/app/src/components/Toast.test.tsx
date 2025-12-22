import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ToastContainer from './Toast';
import { ToastsStateContext } from '../context/ToastContext';

describe('ToastContainer Component', () => {
  it('should render nothing when no toasts', () => {
    render(
      <ToastsStateContext.Provider value={[]}>
        <ToastContainer />
      </ToastsStateContext.Provider>
    );
    
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('should render single toast', () => {
    render(
      <ToastsStateContext.Provider value={[{ id: 1, message: 'Test toast message' }]}>
        <ToastContainer />
      </ToastsStateContext.Provider>
    );
    
    expect(screen.getByText('Test toast message')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    render(
      <ToastsStateContext.Provider value={[
        { id: 1, message: 'First toast' },
        { id: 2, message: 'Second toast' }
      ]}>
        <ToastContainer />
      </ToastsStateContext.Provider>
    );
    
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  it('should have correct styling', () => {
    render(
      <ToastsStateContext.Provider value={[{ id: 1, message: 'Styled toast' }]}>
        <ToastContainer />
      </ToastsStateContext.Provider>
    );
    
    const toast = screen.getByText('Styled toast');
    expect(toast.className).toContain('bg-primary');
  });
});
