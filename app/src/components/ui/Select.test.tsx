import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';

describe('Select Component', () => {
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('should render select trigger', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should call onValueChange when option is selected', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    expect(mockOnValueChange).toHaveBeenCalledWith('option1');
  });

  it('should close dropdown after selection', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should show selected value', () => {
    render(
      <Select value="option1" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const selectedOption = screen.getByRole('option', { name: 'Option 1' });
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle keyboard navigation with Enter', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const option = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.keyDown(option, { key: 'Enter' });

    expect(mockOnValueChange).toHaveBeenCalledWith('option1');
  });

  it('should close on outside click', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Select value="" onValueChange={mockOnValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should not select on non-Enter key', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const option = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.keyDown(option, { key: 'Tab' });

    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it('should toggle dropdown on multiple clicks', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should show check icon for selected item', () => {
    render(
      <Select value="option1" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const selectedOption = screen.getByRole('option', { name: 'Option 1' });
    expect(selectedOption.querySelector('span')).toBeInTheDocument();
  });

  it('should apply custom className to trigger', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger className="custom-class">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger.className).toContain('custom-class');
  });
});
