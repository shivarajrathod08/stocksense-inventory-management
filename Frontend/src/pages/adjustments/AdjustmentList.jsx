import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adjustmentApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

export default function AdjustmentList() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Selected adjustment to apply
  const [selectedAdj, setSelectedAdj] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');

  const fetchAdjustments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adjustmentApi.list({
        status: statusFilter || undefined,
        page,
        size: 15,
      });
      setAdjustments(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      setError('Failed to load stock adjustments from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, [page, statusFilter]);

  const handleApplyConfirm = async () => {
    if (!selectedAdj) return;
    setApplying(true);
    setError(null);
    try {
      await adjustmentApi.apply(selectedAdj.id);
      setApplySuccess(`Adjustment ${selectedAdj.reference} successfully applied to inventory!`);
      setSelectedAdj(null);
      fetchAdjustments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply stock adjustment.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        subtitle="Reconcile physical inventory counts with digital ledger discrepancies"
        breadcrumbs={[
          { label: 'Operations', to: '/dashboard' },
          { label: 'Adjustments' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchAdjustments}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/adjustments/new">
              <Button variant="primary" size="sm" icon={Plus}>
                New Count Adjustment
              </Button>
            </Link>
          </div>
        }
      />

      {applySuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm text-emerald-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applySuccess}</span>
          </div>
          <Link to="/ledger" className="text-xs font-semibold text-emerald-700 underline">
            View Ledger
          </Link>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT (Pending Reconciliation)</option>
            <option value="APPLIED">APPLIED (Reconciled)</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching adjustments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdjustments} />
      ) : adjustments.length === 0 ? (
        <EmptyState
          icon={Sliders}
          title="No adjustments recorded"
          description={statusFilter ? `No adjustments with status "${statusFilter}"` : 'No physical count discrepancies logged.'}
          action={
            <Link to="/adjustments/new">
              <Button variant="primary" size="sm" icon={Plus}>
                Record Inventory Count
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">System Recorded</th>
                  <th className="py-3 px-4 text-right">Physical Count</th>
                  <th className="py-3 px-4 text-right">Difference</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-800">
                      {a.reference}
                      {a.reason && (
                        <span className="block text-[11px] text-slate-400 font-sans truncate max-w-xs">{a.reason}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-semibold text-slate-900 block">{a.productName}</span>
                      <span className="font-mono text-slate-500">{a.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <span className="font-medium text-slate-900">{a.locationName}</span>
                      {a.warehouseName && (
                        <span className="block text-[11px] text-slate-400">{a.warehouseName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 text-xs">
                      {a.recordedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {a.countedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                      <span className={a.difference > 0 ? 'text-emerald-600' : a.difference < 0 ? 'text-rose-600' : 'text-slate-500'}>
                        {a.difference > 0 ? `+${a.difference}` : a.difference}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge label={a.status} variant={a.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {a.status === 'DRAFT' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedAdj(a)}
                        >
                          Apply Count
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{adjustments.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> adjustments
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Applying Adjustment */}
      {selectedAdj && (
        <ConfirmDialog
          isOpen={!!selectedAdj}
          onClose={() => setSelectedAdj(null)}
          onConfirm={handleApplyConfirm}
          loading={applying}
          title="Apply Inventory Adjustment"
          message={`Are you sure you want to reconcile ${selectedAdj.productName} (${selectedAdj.sku}) at location "${selectedAdj.locationName}"? Current stock (${selectedAdj.recordedQuantity}) will be adjusted by ${selectedAdj.difference > 0 ? `+${selectedAdj.difference}` : selectedAdj.difference} units to match physical count (${selectedAdj.countedQuantity}).`}
          confirmText="Confirm & Reconcile"
          variant="primary"
        />
      )}
    </div>
  );
}
