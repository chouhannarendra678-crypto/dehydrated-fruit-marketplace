import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldAlert,
  Users,
  Package,
  ShoppingBag,
  UserCheck,
  CreditCard,
  Percent,
  Star,
  FolderTree,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { logout, selectCurrentUser } from '../redux/slices/authSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ShieldAlert },
    { name: 'Sellers', path: '/admin/sellers', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: UserCheck },
    { name: 'Payouts', path: '/admin/payouts', icon: CreditCard },
    { name: 'Commissions', path: '/admin/commissions', icon: Percent },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-oat overflow-hidden font-sans text-ink">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-deep/60 backdrop-blur-xs tablet:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed tablet:static inset-y-0 left-0 z-50 w-64 bg-forest-dark text-oat flex flex-col border-r border-forest-deep transition-transform duration-200 ease-in-out tablet:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-forest-deep">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-forest text-oat flex items-center justify-center font-bold text-sm font-display border border-forest-soft">
              AD
            </div>
            <div>
              <span className="font-bold text-sm font-display text-white">Admin Control</span>
              <p className="text-[10px] text-oat-dark uppercase tracking-wider">Marketplace Master</p>
            </div>
          </Link>
          <button
            type="button"
            className="tablet:hidden text-oat/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin info badge */}
        <div className="px-6 py-4 border-b border-forest-deep bg-forest-deep/40">
          <p className="text-xs font-bold text-white truncate font-display">
            {user?.name || 'Administrator'}
          </p>
          <span className="inline-flex items-center text-[10px] font-bold text-tomato-light bg-tomato/20 px-2 py-0.5 rounded-md mt-1 border border-tomato/30">
            SUPER ADMIN
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
                      : 'text-oat/70 hover:bg-forest/40 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-oat" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-forest-deep space-y-1">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-oat/70 hover:text-white rounded-md hover:bg-forest/40 transition-colors"
          >
            <span>Live Marketplace</span>
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
        <div className="tablet:hidden h-14 bg-forest-dark border-b border-forest-deep text-oat flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-oat hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm font-display text-white">Admin Console</span>
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

export default AdminLayout;
