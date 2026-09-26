import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  Filter,
  Eye,
  RefreshCw,
  Building2,
  ArrowRight
} from 'lucide-react';
import { transferApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

export default function TransferList() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transferApi.list({
        status: statusFilter || undefined,
        page,
        size: 15,
      });
      setTransfers(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      setError('Failed to load internal transfers from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Transfers"
        subtitle="Relocate stock between warehouses, zones, staging areas and storage racks"
        breadcrumbs={[
          { label: 'Operations', to: '/dashboard' },
          { label: 'Transfers' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchTransfers}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/transfers/new">
              <Button variant="primary" size="sm" icon={Plus}>
                New Transfer
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
            <option value="DRAFT">DRAFT (In Transit)</option>
            <option value="COMPLETED">COMPLETED (Putaway Done)</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching internal transfers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTransfers} />
      ) : transfers.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transfers found"
          description={statusFilter ? `No transfers with status "${statusFilter}"` : 'No internal transfers scheduled yet.'}
          action={
            <Link to="/transfers/new">
              <Button variant="primary" size="sm" icon={Plus}>
                Schedule Stock Transfer
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
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-2 text-center">&rarr;</th>
                  <th className="py-3 px-4">Destination Location</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-xs text-indigo-600">
                      <Link to={`/transfers/${t.id}`} className="hover:underline">
                        {t.reference}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">{t.sourceName}</span>
                      {t.sourceWarehouse && (
                        <span className="block text-[11px] text-slate-400">{t.sourceWarehouse}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-400">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">{t.destinationName}</span>
                      {t.destinationWarehouse && (
                        <span className="block text-[11px] text-slate-400">{t.destinationWarehouse}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                        {t.items?.length || 0} lines
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge label={t.status} variant={t.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/transfers/${t.id}`}>
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
              Showing <span className="font-semibold text-slate-700">{transfers.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> transfers
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
