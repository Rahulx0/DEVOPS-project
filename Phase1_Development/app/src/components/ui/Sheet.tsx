import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { XIcon } from '../../constants';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface SheetContextProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined);

const useSheetContext = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheetContext must be used within a Sheet');
  }
  return context;
};

const Sheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger: React.FC<{ children: React.ReactElement; asChild?: boolean }> = ({ children, asChild }) => {
  const { onOpenChange } = useSheetContext();
  const child = React.Children.only(children);
  
  // FIX: Cast child to React.ReactElement<any> to allow adding props like onClick
  // via React.cloneElement without TypeScript errors about unknown props.
  // This also allows accessing child.props.onClick safely.
  return React.cloneElement(child as React.ReactElement<any>, {
    onClick: (e: React.MouseEvent) => {
      if (child.props.onClick) {
        child.props.onClick(e);
      }
      onOpenChange(true);
    },
  });
};


const SheetContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  const { open, onOpenChange } = useSheetContext();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerId = React.useId();

  useEffect(() => {
    if (!open && contentRef.current) {
        setIsAnimatingOut(true);
        const timer = setTimeout(() => {
            setIsAnimatingOut(false);
        }, 300); // Match animation duration
        return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onOpenChange]);

  if (!open && !isAnimatingOut) return null;
  
  const animationClass = open ? 'animate-slide-in-from-right' : 'animate-slide-out-to-right';

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={() => onOpenChange(false)}
        className={cn(
            'fixed inset-0 z-50 bg-black/30',
            open ? 'animate-fade-in' : 'animate-fade-out'
        )}
      />
      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headerId}
        className={cn(
          'fixed z-50 top-0 right-0 h-full w-full sm:w-80 bg-white p-6 shadow-lg',
          animationClass,
          className
        )}
      >
        <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4"
        >
          <XIcon className="w-6 h-6 text-text-light" />
        </Button>
        {React.Children.map(children, child => {
            if (React.isValidElement(child) && (child.type as any).displayName === 'SheetHeader') {
                return React.cloneElement(child, { id: headerId } as any);
            }
            return child;
        })}
      </div>
    </>
  );
};

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn("text-lg font-semibold text-text-dark", className)} {...props}>
    {children}
  </div>
));
SheetHeader.displayName = 'SheetHeader';


export { Sheet, SheetTrigger, SheetContent, SheetHeader };