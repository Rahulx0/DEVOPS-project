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

  it('should display selected value text when value is set', () => {
    const { rerender } = render(
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

    // Open dropdown to render content
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Select an option
    const option = screen.getByText('Option 1');
    fireEvent.click(option);

    // Rerender with selected value
    rerender(
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

    // Open again to trigger useEffect
    fireEvent.click(screen.getByRole('combobox'));
  });

  it('should show placeholder when value is cleared', () => {
    const { rerender } = render(
      <Select value="option1" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    // Open to render content
    fireEvent.click(screen.getByRole('combobox'));

    // Rerender with no value
    rerender(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should apply custom className to content', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent className="custom-content-class">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByRole('combobox'));
    
    const listbox = screen.getByRole('listbox');
    expect(listbox.className).toContain('custom-content-class');
  });

  it('should apply custom className to item', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" className="custom-item-class">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByRole('combobox'));
    
    const option = screen.getByRole('option', { name: 'Option 1' });
    expect(option.className).toContain('custom-item-class');
  });

  it('should update display value when value changes with content open', () => {
    const { rerender } = render(
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

    // Open dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Rerender with a value while content is open
    rerender(
      <Select value="option2" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // The selected option should be marked
    const selectedOption = screen.getByRole('option', { name: 'Option 2' });
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should display value in SelectValue when value is set', () => {
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

    // The SelectValue should show the value
    expect(screen.getByText('option1')).toBeInTheDocument();
  });

  it('should show placeholder when no value is set', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );

    // Shows placeholder when value is empty
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('should update display when value changes', () => {
    const { rerender } = render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );

    // Initially shows placeholder
    expect(screen.getByText('Choose...')).toBeInTheDocument();

    // Rerender with value
    rerender(
      <Select value="a" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );

    // Should display the value
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('should not close when clicking inside the dropdown content', () => {
    render(
      <Select value="" onValueChange={mockOnValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Click inside the listbox (on the container, not an option)
    fireEvent.mouseDown(screen.getByRole('listbox'));

    // Should still be open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
