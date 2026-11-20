import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, MoreHorizontal, Package, Plus, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const BottomNav: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const vendorNavItems: NavItem[] = [
    { label: 'Home', path: '/vendor', icon: <LayoutDashboard size={20} /> },
    { label: 'Products', path: '/vendor/products', icon: <Package size={20} /> },
    { label: 'Bills', path: '/vendor/invoices', icon: <FileText size={20} /> },
    { label: 'More', path: '/vendor/more', icon: <MoreHorizontal size={20} /> },
  ];

  const customerNavItems: NavItem[] = [
    { label: 'Home', path: '/customer', icon: <LayoutDashboard size={20} /> },
    { label: 'My Bills', path: '/customer/bills', icon: <FileText size={20} /> },
    { label: 'Profile', path: '/customer/profile', icon: <User size={20} /> },
  ];

  const items = role === 'vendor' ? vendorNavItems : customerNavItems;
  const isInvoiceCreatePage = location.pathname.includes('/create-invoice');

  return (
    <>
      {/* Floating "+ New invoice" button on vendor mobile screens when not already creating one */}
      {role === 'vendor' && !isInvoiceCreatePage && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <button
            type="button"
            onClick={() => navigate('/vendor/create-invoice')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-700 active:scale-95 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg shadow-primary/30 transition-all border border-blue-400"
          >
            <Plus size={18} className="stroke-[2.5]" />
            <span>New invoice</span>
          </button>
        </div>
      )}

      {/* Clean White Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border px-3 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {items.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/vendor' && item.path !== '/customer' && location.pathname.startsWith(item.path));

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-appText-secondary hover:text-appText-primary'
                }`}
              >
                <div className="transition-transform active:scale-90">{item.icon}</div>
                <span className="text-[11px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
