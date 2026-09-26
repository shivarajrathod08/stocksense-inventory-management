import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  Plus,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  Building2
} from 'lucide-react';
import { receiptApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

export default function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await receiptApi.list({
        status: statusFilter || undefined,
        page,
        size: 15,
      });
      setReceipts(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      setError('Failed to load receipts from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Receipts"
        subtitle="Manage inbound purchase receipts from suppliers and stock putaways"
        breadcrumbs={[
          { label: 'Operations', to: '/dashboard' },
          { label: 'Receipts' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchReceipts}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/receipts/new">
              <Button variant="primary" size="sm" icon={Plus}>
                New Receipt
              </Button>
            </Link>
          </div>
        }
      />

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
            <option value="DRAFT">DRAFT (Pending)</option>
            <option value="VALIDATED">VALIDATED (Received)</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching receipts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReceipts} />
      ) : receipts.length === 0 ? (
        <EmptyState
          icon={ArrowDownLeft}
          title="No receipts found"
          description={statusFilter ? `No receipts with status "${statusFilter}"` : 'No incoming receipts created yet.'}
          action={
            <Link to="/receipts/new">
              <Button variant="primary" size="sm" icon={Plus}>
                Create Inbound Receipt
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
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Destination Location</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-xs text-indigo-600">
                      <Link to={`/receipts/${r.id}`} className="hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium text-xs">
                      {r.supplierName || 'Internal / Standard Vendor'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">{r.destinationName}</span>
                      {r.warehouseName && (
                        <span className="block text-[11px] text-slate-400">{r.warehouseName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                        {r.items?.length || 0} lines
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge label={r.status} variant={r.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/receipts/${r.id}`}>
                        <Button variant="outline" size="sm" icon={Eye}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{receipts.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> receipts
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
    </div>
  );
}
