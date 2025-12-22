import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  variant: {
    default: 'bg-primary text-white hover:bg-primary/90',
    destructive: 'bg-red-500 text-white hover:bg-red-500/90',
    outline: 'border border-primary bg-transparent hover:bg-primary/10',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    ghost: 'hover:bg-primary/10',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-10 py-2 px-4 gap-2',
    sm: 'h-9 px-3 rounded-md gap-1',
    lg: 'h-12 px-8 rounded-md gap-3',
    icon: 'h-10 w-10',
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants.base,
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };