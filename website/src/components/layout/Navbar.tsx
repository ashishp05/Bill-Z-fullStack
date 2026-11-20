import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Plus, Store, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName =
    role === 'vendor'
      ? (user as any)?.businessName || `${(user as any)?.firstName || 'Vendor'}`
      : (user as any)?.name || 'Customer';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-surface-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          onClick={() => navigate(isAuthenticated ? (role === 'vendor' ? '/vendor' : '/customer') : '/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/favicon.svg" alt="Bill-Z" className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-navy tracking-tight">Bill-Z</span>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-50 text-primary border border-primary-100">
                PWA
              </span>
            </div>
            <span className="text-[11px] text-appText-secondary font-medium hidden sm:block">
              Smart Billing. Stronger Business.
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {role === 'vendor' ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/vendor')}
                  className={`transition-colors ${
                    location.pathname === '/vendor'
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/products')}
                  className={`transition-colors ${
                    location.pathname.startsWith('/vendor/products')
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/invoices')}
                  className={`transition-colors ${
                    location.pathname.startsWith('/vendor/invoices')
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  Invoices
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/customers')}
                  className={`transition-colors ${
                    location.pathname.startsWith('/vendor/customers')
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  Customers
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/vendor/create-invoice')}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-700 text-white px-3.5 py-1.5 rounded-xl font-semibold shadow-sm transition-all"
                >
                  <Plus size={16} />
                  <span>Create Bill</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/customer')}
                  className={`transition-colors ${
                    location.pathname === '/customer'
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer/bills')}
                  className={`transition-colors ${
                    location.pathname.startsWith('/customer/bills')
                      ? 'text-primary font-bold border-b-2 border-primary pb-1'
                      : 'text-appText-secondary hover:text-appText-primary'
                  }`}
                >
                  My Bills
                </button>
              </>
            )}
          </nav>
        )}

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <button
                type="button"
                className="p-2 text-appText-secondary hover:text-appText-primary hover:bg-gray-100 rounded-xl transition-colors relative"
                aria-label="Notifications"
                onClick={() => alert('No new notifications')}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-action-orange rounded-full" />
              </button>

              <Badge variant={role === 'vendor' ? 'primary' : 'success'} size="sm" dot>
                {role === 'vendor' ? 'Vendor' : 'Customer'}
              </Badge>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-surface-border">
                <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-xs uppercase">
                  {role === 'vendor' ? <Store size={14} /> : <User size={14} />}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-appText-primary truncate max-w-[120px]">{displayName}</p>
                  <p className="text-[11px] text-appText-secondary truncate max-w-[120px]">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-appText-muted hover:text-error hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
