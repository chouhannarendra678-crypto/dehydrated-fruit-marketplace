import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-forest text-oat pt-16 pb-12 mt-20 border-t border-forest-dark">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 pb-10 border-b border-oat/15">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest-dark border border-forest-muted/50 flex items-center justify-center text-oat">
              <ShieldCheck className="w-5 h-5 text-oat" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-oat">100% Quality Tested</h5>
              <p className="text-[11px] text-oat/70">Certified dehydrated fruits</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest-dark border border-forest-muted/50 flex items-center justify-center text-oat">
              <Truck className="w-5 h-5 text-oat" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-oat">Direct Farm Dispatch</h5>
              <p className="text-[11px] text-oat/70">Fast multi-vendor shipping</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest-dark border border-forest-muted/50 flex items-center justify-center text-oat">
              <RefreshCw className="w-5 h-5 text-oat" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-oat">Freshness Guaranteed</h5>
              <p className="text-[11px] text-oat/70">Zero harmful preservatives</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest-dark border border-forest-muted/50 flex items-center justify-center text-oat">
              <Award className="w-5 h-5 text-oat" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-semibold text-oat">Verified Producers</h5>
              <p className="text-[11px] text-oat/70">FSSAI certified regional orchards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-oat text-forest flex items-center justify-center font-bold text-base font-display">
                <span className="text-tomato">D</span>F
              </div>
              <span className="font-bold text-lg tracking-tight text-oat font-display">
                Dehydrated<span className="text-oat/70 font-normal">Fruits</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-oat/75 max-w-sm leading-relaxed">
              Discover. Compare. Buy. Dehydrated. The premier dedicated marketplace connecting discerning consumers with verified orchard processors.
            </p>
            <p className="text-xs text-oat/90 font-semibold tracking-wide">
              Turn your dehydrated fruit business into an online store.
            </p>
          </div>

          {/* Customer Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-oat/90 mb-4 font-display">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-oat/75">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  All Dehydrated Fruits
                </Link>
              </li>
              <li>
                <Link to="/explore?category=mango" className="hover:text-white transition-colors">
                  Dehydrated Mango
                </Link>
              </li>
              <li>
                <Link to="/explore?category=pineapple" className="hover:text-white transition-colors">
                  Dehydrated Pineapple
                </Link>
              </li>
              <li>
                <Link to="/explore?category=berries" className="hover:text-white transition-colors">
                  Berries & Cherries
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-oat/90 mb-4 font-display">
              Vendors
            </h4>
            <ul className="space-y-2 text-xs text-oat/75">
              <li>
                <Link to="/seller/register" className="hover:text-white transition-colors">
                  Seller Onboarding
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition-colors">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-oat/90 mb-4 font-display">
              Account & Help
            </h4>
            <ul className="space-y-2 text-xs text-oat/75">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 pt-8 border-t border-oat/15 flex flex-col sm:flex-row items-center justify-between text-xs text-oat/60 gap-4">
        <p>© {new Date().getFullYear()} Dehydrated Fruit Marketplace. All rights reserved.</p>
        <p className="text-oat/60">Discover. Compare. Buy. Dehydrated.</p>
      </div>
    </footer>
  );
};

export default Footer;

