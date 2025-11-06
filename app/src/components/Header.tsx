import React, { useState } from 'react';
import { ShoppingCartIcon, HeartIcon, MenuIcon } from '../constants';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { AppView } from '../lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/Sheet';
import { Button } from './ui/Button';

interface HeaderProps {
  setView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setView(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
            <button onClick={() => handleNavClick({ type: 'home' })} className="text-2xl font-heading font-bold tracking-tight text-primary">
            UrbanGear
            </button>
        </div>
        
        {/* Desktop Nav */}
        <ul className="hidden md:flex flex-1 justify-center items-center space-x-8 font-semibold">
          <li><Button variant="ghost" onClick={() => handleNavClick({ type: 'sneakers' })}>Sneakers</Button></li>
          <li><Button variant="ghost" onClick={() => handleNavClick({ type: 'apparel' })}>Apparel</Button></li>
        </ul>

        {/* Icons */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'wishlist' })} className="relative">
                <HeartIcon className="w-6 h-6" />
                {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                    </span>
                )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'cart' })} className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex-1 flex justify-end items-center">
             <Button variant="ghost" size="icon" onClick={() => handleNavClick({ type: 'cart' })} className="relative mr-2">
                <ShoppingCartIcon className="w-6 h-6"/>
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="w-6 h-6"/>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                   <button onClick={() => handleNavClick({ type: 'home' })} className="text-2xl font-heading font-bold tracking-tight text-primary text-left">
                      UrbanGear
                    </button>
                </SheetHeader>
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

export default Header;