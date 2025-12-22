// Header component for navigation and theme controls
import React, { useState } from 'react';
import { ShoppingCartIcon, HeartIcon, MenuIcon } from '../constants';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useTheme } from '../context/ThemeContext';
import { AppView } from '../lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/Sheet';
import { Button } from './ui/Button';

// Sun icon for light mode toggle
const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

// Moon icon for dark mode toggle
const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

// Props for Header component
interface HeaderProps {
  setView: (view: AppView) => void;
}

// Header component manages navigation, theme, and menu state
const Header: React.FC<HeaderProps> = ({ setView }) => {
  // Get cart and wishlist counts
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  // Get current theme and toggle function
  const { theme, toggleTheme } = useTheme();
  // State for mobile menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle navigation click and close menu
  const handleNavClick = (view: AppView) => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo button navigates to home */}
        <div className="flex-1 flex justify-start">
          {/* Home navigation button */}
          <button onClick={() => handleNavClick({ type: 'home' })} className="text-2xl font-heading font-bold tracking-tight text-primary dark:text-secondary">
          UrbanGear
          </button>
        </div>
        
        {/* Desktop navigation links */}
        <ul className="hidden md:flex flex-1 justify-center items-center space-x-8 font-semibold">
          <li><Button variant="ghost" onClick={() => handleNavClick({ type: 'sneakers' })}>Sneakers</Button></li>
          <li><Button variant="ghost" onClick={() => handleNavClick({ type: 'apparel' })}>Apparel</Button></li>
        </ul>

        {/* Desktop icons for theme, wishlist, and cart */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-2">
          {/* Theme toggle button */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </Button>
          {/* Wishlist button with count */}
          <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'wishlist' })} className="relative">
            <HeartIcon className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Button>
          {/* Cart button with count */}
          <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'cart' })} className="relative">
            <ShoppingCartIcon className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile menu and cart button */}
        <div className="md:hidden flex-1 flex justify-end items-center">
             {/* Cart button for mobile */}
             <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'cart' })} className="relative mr-2">
                <ShoppingCartIcon className="w-6 h-6"/>
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Button>
            {/* Mobile menu sheet for navigation */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="w-6 h-6"/>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                   {/* Home navigation in mobile menu */}
                   <button onClick={() => handleNavClick({ type: 'home' })} className="text-2xl font-heading font-bold tracking-tight text-primary dark:text-secondary text-left">
                      UrbanGear
                    </button>
                </SheetHeader>
                {/* Mobile navigation links */}
                <ul className="flex flex-col items-start space-y-4 mt-8">
                  <li><Button variant="link" className="text-2xl" onClick={() => handleNavClick({ type: 'sneakers' })}>Sneakers</Button></li>
                  <li><Button variant="link" className="text-2xl" onClick={() => handleNavClick({ type: 'apparel' })}>Apparel</Button></li>
                  <li className="border-t border-gray-200 w-full pt-4 mt-4">
                    <Button variant="link" className="text-2xl" onClick={() => handleNavClick({ type: 'wishlist' })}>
                      Wishlist ({wishlistCount})
                    </Button>
                  </li>
                </ul>
              </SheetContent>
            </Sheet>
        </div>
      </nav>
    </header>
  );
};

// Export Header component as default
export default Header;
// CI: pipeline test 2025-11-20