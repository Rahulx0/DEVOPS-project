import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckIcon } from '../../constants'; // Assuming check icon is in constants

interface SelectContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  onValueChange: (value: string) => void;
  setTriggerLabel: (label: string) => void;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('useSelectContext must be used within a Select provider');
  return context;
};

const Select: React.FC<{
  value?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [triggerLabel, setTriggerLabel] = useState('');

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange, setTriggerLabel }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useSelectContext();
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  return (
    <button
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
    const { value } = useSelectContext();
    const contentRef = useContext(SelectContentContext);
    const [displayValue, setDisplayValue] = useState(placeholder);

    useEffect(() => {
        if(value && contentRef?.current) {
            const selectedItem = Array.from(contentRef.current.children).find(
                (child) => (child as HTMLElement).dataset.value === value
            );
            if (selectedItem) {
                setDisplayValue(selectedItem.textContent || placeholder);
            }
        } else {
            setDisplayValue(placeholder);
        }

    }, [value, placeholder, contentRef]);

    return <span>{displayValue}</span>;
}


const SelectContentContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useSelectContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.parentElement?.contains(event.target as Node)) {
            setOpen(false);
        }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <SelectContentContext.Provider value={contentRef}>
        <div
            ref={contentRef}
            role="listbox"
            className={cn(
                'absolute z-50 mt-1 w-full rounded-md border bg-white p-1 text-text-dark shadow-md animate-fade-in-up',
                'origin-top-right',
                className
            )}
            style={{animationDuration: '0.2s'}}
        >
            {children}
        </div>
    </SelectContentContext.Provider>
  );
};

const SelectItem: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;
  
  const handleSelect = () => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <div
      data-value={value}
      onClick={handleSelect}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-primary/10 focus:bg-primary/10',
        isSelected && 'font-semibold',
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <CheckIcon className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };