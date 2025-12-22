import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  SparklesIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  CheckIcon, 
  MenuIcon, 
  XIcon, 
  SearchIcon 
} from './constants';

describe('Icon Components', () => {
  it('should render ShoppingCartIcon', () => {
    const { container } = render(<ShoppingCartIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render HeartIcon', () => {
    const { container } = render(<HeartIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render SparklesIcon', () => {
    const { container } = render(<SparklesIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render ArrowRightIcon', () => {
    const { container } = render(<ArrowRightIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render ChevronLeftIcon', () => {
    const { container } = render(<ChevronLeftIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render TrashIcon', () => {
    const { container } = render(<TrashIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render PlusIcon', () => {
    const { container } = render(<PlusIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render MinusIcon', () => {
    const { container } = render(<MinusIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render CreditCardIcon', () => {
    const { container } = render(<CreditCardIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render CheckCircleIcon', () => {
    const { container } = render(<CheckCircleIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render CheckIcon', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render MenuIcon', () => {
    const { container } = render(<MenuIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render XIcon', () => {
    const { container } = render(<XIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render SearchIcon', () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should accept custom props', () => {
    const { container } = render(<SparklesIcon className="custom-class" data-testid="sparkles" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
    expect(svg).toHaveAttribute('data-testid', 'sparkles');
  });
});