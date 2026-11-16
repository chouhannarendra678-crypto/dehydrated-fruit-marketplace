import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, ShoppingBag, Heart, Settings, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../redux/slices/authSlice';
import { ROLES } from '../../constants/roles';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          to="/login"
          className="text-xs font-semibold text-forest hover:text-forest-dark px-2.5 py-1.5 transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="text-xs font-semibold bg-forest hover:bg-forest-dark text-white px-3 py-1.5 rounded-md shadow-2xs transition-colors"
        >
          Register
        </Link>
      </div>
    );
  }

  const role = user?.role || ROLES.CUSTOMER;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-md hover:bg-oat-dark/40 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-forest text-oat flex items-center justify-center font-bold text-xs shadow-2xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
        </div>
        <span className="hidden tablet:inline text-xs font-semibold text-forest max-w-[100px] truncate">
          {user?.name || 'Account'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-oat-light shadow-elevated border border-forest/15 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 border-b border-forest/10">
            <p className="text-xs font-bold text-forest truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-ink-muted truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-forest/10 text-forest border border-forest/15">
              {role}
            </span>
          </div>

          <div className="py-1">
            {role === ROLES.ADMIN && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-oat"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-forest" />
                Admin Dashboard
              </Link>
            )}

            {role === ROLES.SELLER && (
              <Link
                to="/seller/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-oat"
              >
                <Store className="w-3.5 h-3.5 text-forest" />
                Seller Dashboard
              </Link>
            )}

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-oat"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-forest/70" />
              My Orders
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-oat"
            >
              <Heart className="w-3.5 h-3.5 text-forest/70" />
              Wishlist
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-oat"
            >
              <Settings className="w-3.5 h-3.5 text-forest/70" />
              Profile Settings
            </Link>
          </div>

          <div className="border-t border-forest/10 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-tomato hover:bg-tomato/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

