import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDashboard();
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard metrics from backend. Ensure PostgreSQL and Spring Boot are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return <LoadingState message="Loading live warehouse intelligence..." />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const kpis = [
    {
      label: 'Total Products',
      value: data?.totalProducts ?? 0,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      to: '/products',
    },
    {
      label: 'Total Stock Units',
      value: (data?.totalStockUnits ?? 0).toLocaleString(),
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      to: '/products',
    },
    {
      label: 'Low Stock Alerts',
      value: data?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      highlight: data?.lowStockCount > 0,
      to: '/products',
    },
    {
      label: 'Out of Stock',
      value: data?.outOfStockCount ?? 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      highlight: data?.outOfStockCount > 0,
      to: '/products',
    },
  ];

  const pendingOps = [
    {
      label: 'Pending Receipts',
      count: data?.pendingReceipts ?? 0,
      to: '/receipts',
      icon: ArrowDownLeft,
      color: 'text-blue-600',
    },
    {
      label: 'Pending Deliveries',
      count: data?.pendingDeliveries ?? 0,
      to: '/deliveries',
      icon: ArrowUpRight,
      color: 'text-purple-600',
    },
    {
      label: 'Pending Transfers',
      count: data?.pendingTransfers ?? 0,
      to: '/transfers',
      icon: ArrowLeftRight,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Overview"
        subtitle="Real-time multi-location warehouse analytics and pending operations"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDashboard}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/products/new">
              <Button variant="primary" size="sm" icon={Plus}>
                Add Product
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            to={kpi.to}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
              {kpi.highlight && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Attention Required
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Operations Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
          Operations Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingOps.map((op, idx) => (
            <Link
              key={idx}
              to={op.to}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <op.icon className={`w-4 h-4 ${op.color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{op.label}</div>
                  <div className="text-xs text-slate-500">Drafts awaiting validation</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{op.count}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Low Stock Alert & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items List (1 column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Warnings
            </h2>
            <Badge label={`${data?.lowStockItems?.length || 0} items`} variant="LOW_STOCK" />
          </div>

          {data?.lowStockItems?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              All items are currently above minimum safety thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.lowStockItems?.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.productName}</p>
                    <p className="text-[11px] font-mono text-slate-500">{item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-rose-600">{item.totalStock}</span>
                    <span className="text-[11px] text-slate-500"> / min {item.reorderPoint}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link to="/receipts/new">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Create Restock Receipt
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Ledger Movements (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Stock Movements
            </h2>
            <Link to="/ledger" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View Complete Ledger &rarr;
            </Link>
          </div>

          {(!data?.recentMovements || data.recentMovements.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent movements recorded. Validate a receipt or delivery to generate audit entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Operation</th>
                    <th className="py-2.5 px-3 text-right">Change</th>
                    <th className="py-2.5 px-3 text-right">Resulting</th>
                    <th className="py-2.5 px-3">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentMovements.slice(0, 7).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {m.productName}
                        <span className="block text-[11px] font-mono text-slate-400">{m.sku}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge label={m.operationType} variant={m.operationType} size="xs" />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        <span className={m.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                        {m.resultingQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{m.performedByName || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
