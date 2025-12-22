import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useToast } from './useToast';
import { ToastProvider } from '../context/ToastContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(ToastProvider, null, children)
);

describe('useToast hook', () => {
  it('should return toast function when used within ToastProvider', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('function');
  });

  it('should throw error when used outside ToastProvider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');
  });
});
