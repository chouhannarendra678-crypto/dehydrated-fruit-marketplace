import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  DollarSign,
  CreditCard,
  Star,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { logout, selectCurrentUser } from '../redux/slices/authSlice';

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/seller/products', icon: Package },
    { name: 'Orders', path: '/seller/orders', icon: ShoppingBag },
    { name: 'Inventory', path: '/seller/inventory', icon: Boxes },
    { name: 'Earnings', path: '/seller/earnings', icon: DollarSign },
    { name: 'Payouts', path: '/seller/payouts', icon: CreditCard },
    { name: 'Reviews', path: '/seller/reviews', icon: Star },
    { name: 'Store Profile', path: '/seller/store-profile', icon: Store },
    { name: 'Settings', path: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-oat overflow-hidden font-sans text-ink">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-dark/50 backdrop-blur-xs tablet:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed tablet:static inset-y-0 left-0 z-50 w-64 bg-oat-card border-r border-forest/15 flex flex-col transition-transform duration-200 ease-in-out tablet:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-forest/15">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-base shadow-2xs font-display">
              <span className="text-tomato">D</span>F
            </div>
            <div>
              <span className="font-bold text-sm font-display text-forest">Seller Portal</span>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider">Orchard Hub</p>
            </div>
          </Link>
          <button
            type="button"
            className="tablet:hidden text-forest/60 hover:text-forest"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vendor info badge */}
        <div className="px-6 py-4 border-b border-forest/15 bg-oat/50">
          <p className="text-xs font-bold text-forest truncate font-display">
            {user?.name || 'Verified Vendor'}
          </p>
          <span className="inline-flex items-center text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20 mt-1">
            Active Seller
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'bg-forest text-white shadow-2xs font-bold'
                      : 'text-forest/80 hover:bg-forest/10 hover:text-forest'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-forest/15 space-y-1">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-forest hover:bg-forest/10 rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              View Marketplace
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-tomato hover:bg-tomato/10 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="tablet:hidden h-14 bg-oat border-b border-forest/15 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-forest hover:text-forest-dark"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm font-display text-forest">Seller Portal</span>
          <div className="w-6" />
        </div>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-4 tablet:p-8 bg-oat">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
