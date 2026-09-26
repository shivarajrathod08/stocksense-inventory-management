import React from 'react';
import { Menu, Database, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onOpenSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-slate-700">PostgreSQL Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-indigo-900">
            {user?.roles?.[0] ? user.roles[0].replace('ROLE_', '') : 'STAFF'}
          </span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden md:inline-block">
            {user?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
}
