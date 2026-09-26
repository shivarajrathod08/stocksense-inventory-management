import React from 'react';

const BADGE_STYLES = {
  // Statuses
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  VALIDATED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPLIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Operations
  RECEIPT: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200',
  TRANSFER_IN: 'bg-teal-50 text-teal-700 border-teal-200',
  TRANSFER_OUT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TRANSFER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ADJUSTMENT: 'bg-orange-50 text-orange-700 border-orange-200',

  // Stock levels
  LOW_STOCK: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
  OUT_OF_STOCK: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
  IN_STOCK: 'bg-slate-100 text-slate-700 border-slate-200',
  
  DEFAULT: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function Badge({ label, variant, size = 'sm' }) {
  const normalizedKey = (variant || label || '').toString().toUpperCase();
  const style = BADGE_STYLES[normalizedKey] || BADGE_STYLES.DEFAULT;
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${style}`}>
      {label || variant}
    </span>
  );
}
