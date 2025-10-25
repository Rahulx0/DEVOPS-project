import React, { useState, useContext } from 'react';
import { ShoppingCartIcon, HeartIcon, MenuIcon, UserIcon, LogoutIcon } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { AppView } from '@/lib/types';
import { Logo } from '@/lib/Logo';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from './ui/Sheet';
import { Button } from './ui/Button';
import { AuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';

interface HeaderProps {
  setView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, session } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleNavClick = (view: AppView) => {
    setView(view);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('Logged out successfully', { type: 'success' });
    setView({ name: 'home' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-1 flex justify-start items-center gap-2">
            <button onClick={() => handleNavClick({ name: 'home' })} className="flex items-center gap-2">
                <Logo className="w-8 h-8 text-primary" />
                <span className="text-2xl font-heading font-bold tracking-tight text-primary">
                    UrbanGear
                </span>
            </button>
        </div>
        
        {/* Desktop Nav */}
        <ul className="hidden md:flex flex-1 justify-center items-center space-x-8 font-semibold">
          <li><Button variant="ghost" onClick={() => handleNavClick({ name: 'sneakers' })}>Sneakers</Button></li>
          <li><Button variant="ghost" onClick={() => handleNavClick({ name: 'apparel' })}>Apparel</Button></li>
        </ul>

        {/* Icons */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleNavClick({ name: 'wishlist' })} className="relative">
                <HeartIcon className="w-6 h-6" />
                {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                    </span>
                )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleNavClick({ name: 'cart' })} className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </Button>
            {session ? (
              <>
                <span className="text-sm font-medium">Hi, {user?.email?.split('@')[0]}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogoutIcon className="w-6 h-6" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => handleNavClick({ name: 'login' })}>
                <UserIcon className="w-6 h-6" />
              </Button>
            )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <span className="text-lg font-bold">Menu</span>
              </SheetHeader>
              <div className="mt-8">
                <ul className="space-y-4">
                  <li><Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick({ name: 'sneakers' })}>Sneakers</Button></li>
                  <li><Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick({ name: 'apparel' })}>Apparel</Button></li>
                  <hr/>
                  {session ? (
                    <>
                      <li className="px-4 text-sm font-medium">Hi, {user?.email?.split('@')[0]}</li>
                      <li>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                          <LogoutIcon className="w-5 h-5 mr-2" />
                          Logout
                        </Button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavClick({ name: 'login' })}>
                        <UserIcon className="w-5 h-5 mr-2" />
                        Login / Sign Up
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;