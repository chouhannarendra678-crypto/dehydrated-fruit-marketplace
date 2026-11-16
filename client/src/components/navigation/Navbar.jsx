import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Sparkles, Store } from 'lucide-react';
import { useSelector } from 'react-redux';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';
import UserMenu from './UserMenu';
import { selectWishlistCount } from '../../redux/slices/wishlistSlice';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wishlistCount = useSelector(selectWishlistCount);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');

  const navLinks = [
    {
      name: 'Home',
      path: '/',
      isActive: location.pathname === '/',
    },
    {
      name: 'Explore Fruits',
      path: '/explore',
      isActive:
        (location.pathname === '/explore' && tab !== 'brands' && tab !== 'sellers') ||
        location.pathname.startsWith('/categories/'),
    },
    {
      name: 'Brands',
      path: '/brands',
      isActive:
        location.pathname === '/brands' ||
        location.pathname === '/sellers' ||
        (location.pathname === '/explore' && (tab === 'brands' || tab === 'sellers')),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-oat/95 backdrop-blur-xs border-b border-forest/15 transition-shadow">
      {/* Top Banner */}
      <div className="bg-forest text-oat text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-forest-dark">
        <Sparkles className="w-3.5 h-3.5 text-tomato" />
        <span>100% Sun-Dried & Dehydrated Fruits Directly From Certified Regional Orchards</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8">
        <div className="flex items-center justify-between h-16 tablet:h-18 gap-3 tablet:gap-6">

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="tablet:hidden p-2 rounded-md text-forest hover:bg-oat-dark/50 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-base shadow-2xs font-display">
              <span className="text-tomato">D</span>F
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tablet:text-lg tracking-tight text-forest leading-tight font-display">
                Dehydrated<span className="text-forest-muted font-normal">Fruits</span>
              </span>
              <span className="text-[8px] uppercase tracking-widest text-ink-muted hidden sm:inline">
                Multi-Vendor Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden tablet:flex items-center gap-6 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors hover:text-forest ${
                  link.isActive
                    ? 'text-forest font-bold border-b-2 border-forest pb-0.5'
                    : 'text-forest/70 font-medium'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/sell-with-us"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-forest/30 text-forest bg-oat-light/60 hover:bg-forest hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Sell With Us
            </Link>
          </nav>

          {/* Search Bar (tablet & desktop) */}
          <div className="hidden tablet:block flex-1 max-w-sm mx-2">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 tablet:gap-3 shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-md text-forest hover:bg-oat-dark/40 transition-colors hidden sm:flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-forest" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tomato text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <CartIcon />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Search Bar below navbar on small screens (390px) */}
        <div className="tablet:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="tablet:hidden fixed inset-x-0 top-[110px] bg-oat-light border-b border-forest/15 shadow-elevated z-50 p-6 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold tracking-wide transition-colors ${
                  link.isActive
                    ? 'text-forest font-bold'
                    : 'text-forest/75 hover:text-forest'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/sell-with-us"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-forest p-2.5 rounded-md bg-oat border border-forest/20"
            >
              <Store className="w-4 h-4" />
              Sell With Us
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-forest pt-2 border-t border-forest/10"
            >
              <Heart className="w-4 h-4 text-forest/70" />
              Wishlist ({wishlistCount})
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

