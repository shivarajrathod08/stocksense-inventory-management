import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  History,
  Building2,
  Settings,
  User,
  LogOut,
  Boxes,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: null,
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { label: 'Products', to: '/products', icon: Package },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Receipts', to: '/receipts', icon: ArrowDownLeft },
        { label: 'Deliveries', to: '/deliveries', icon: ArrowUpRight },
        { label: 'Internal Transfers', to: '/transfers', icon: ArrowLeftRight },
        { label: 'Adjustments', to: '/adjustments', icon: Sliders },
      ],
    },
    {
      label: 'Stock',
      items: [
        { label: 'Stock Ledger', to: '/ledger', icon: History },
      ],
    },
    {
      label: 'Management',
      items: [
        { label: 'Warehouses', to: '/warehouses', icon: Building2 },
        { label: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">StockSense</span>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold">IMS Enterprise</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.label && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <div className="w-7 h-7 rounded-full bg-indigo-900/80 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-200 uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@stocksense.io'}</p>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
