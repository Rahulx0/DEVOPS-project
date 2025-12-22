import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader } from './Sheet';

// Test component that uses SheetTrigger outside of Sheet context
const SheetTriggerWithoutContext = () => {
  return (
    <SheetTrigger asChild>
      <button>Orphan Trigger</button>
    </SheetTrigger>
  );
};

describe('Sheet Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render trigger button', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });

  it('should open sheet when trigger is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    fireEvent.click(screen.getByText('Open Sheet'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should render content when open', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render content when closed', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
  });

  it('should close when overlay is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Click the overlay (first fixed element with bg-black)
    const overlay = document.querySelector('.bg-black\\/30');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Find the close button (button inside the dialog)
    const dialog = screen.getByRole('dialog');
    const closeButton = dialog.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close when Escape key is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render SheetHeader', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>Header Title</SheetHeader>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('should apply custom className to content', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent className="custom-class">
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-class');
  });

  it('should apply custom className to header', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="custom-header-class">Header</SheetHeader>
        </SheetContent>
      </Sheet>
    );

    const header = screen.getByText('Header');
    expect(header.className).toContain('custom-header-class');
  });

  it('should handle animation when closing', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Sheet Content')).toBeInTheDocument();

    // Close the sheet - the animation state should trigger
    rerender(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Fast-forward timers to complete animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // After animation, content should be gone
    expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
  });

  it('should call child onClick handler when trigger is clicked', () => {
    const onOpenChange = vi.fn();
    const childOnClick = vi.fn();
    
    render(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button onClick={childOnClick}>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    fireEvent.click(screen.getByText('Open Sheet'));
    
    expect(childOnClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should have aria-modal attribute', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should not close on non-Escape key press', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should throw error when useSheetContext is used outside Sheet', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<SheetTriggerWithoutContext />);
    }).toThrow('useSheetContext must be used within a Sheet');
    
    consoleSpy.mockRestore();
  });

  it('should handle animation state during close', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByText('Sheet Content')).toBeInTheDocument();

    // Close the sheet
    rerender(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Complete the animation timer
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // After animation completes, content should be gone
    expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
  });

  it('should cleanup timer on unmount during animation', async () => {
    const onOpenChange = vi.fn();
    const { rerender, unmount } = render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Close the sheet to start animation
    rerender(
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button>Open Sheet</button>
        </SheetTrigger>
        <SheetContent>
          <div>Sheet Content</div>
        </SheetContent>
      </Sheet>
    );

    // Unmount during animation - this should cleanup the timer
    unmount();

    // Advance timers - should not cause any errors
    act(() => {
      vi.advanceTimersByTime(500);
    });
  });
});
