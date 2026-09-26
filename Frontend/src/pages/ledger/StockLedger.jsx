import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  History,
  Filter,
  RefreshCw,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ledgerApi, productApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

export default function StockLedger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';

  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productApi.list({ size: 100 });
        setProducts(res.data.content);
      } catch (e) {
        console.error('Failed to load products for filter', e);
      }
    };
    loadProducts();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ledgerApi.list({
        productId: selectedProductId || undefined,
        operationType: selectedOperation || undefined,
        page,
        size: 20,
      });
      setLedgerEntries(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      setError('Failed to fetch stock ledger entries from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [page, selectedProductId, selectedOperation]);

  const handleProductChange = (val) => {
    setSelectedProductId(val);
    setPage(0);
    if (val) {
      setSearchParams({ productId: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Audit Ledger"
        subtitle="Immutable transaction journal tracing every physical stock debit, credit and transfer"
        breadcrumbs={[
          { label: 'Stock', to: '/dashboard' },
          { label: 'Stock Ledger' },
        ]}
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchLedger}
            loading={loading}
          >
            Refresh Journal
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Filter Product:</span>
          </div>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Operation Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-0 md:ml-3">
            <span className="font-semibold text-slate-700">Operation:</span>
          </div>
          <select
            value={selectedOperation}
            onChange={(e) => {
              setSelectedOperation(e.target.value);
              setPage(0);
            }}
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Operations</option>
            <option value="RECEIPT">RECEIPT (Inbound)</option>
            <option value="DELIVERY">DELIVERY (Outbound)</option>
            <option value="TRANSFER_IN">TRANSFER_IN</option>
            <option value="TRANSFER_OUT">TRANSFER_OUT</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Count)</option>
          </select>
        </div>

        {(selectedProductId || selectedOperation) && (
          <button
            onClick={() => {
              setSelectedProductId('');
              setSelectedOperation('');
              setSearchParams({});
              setPage(0);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Querying immutable stock journal..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLedger} />
      ) : ledgerEntries.length === 0 ? (
        <EmptyState
          icon={History}
          title="No ledger entries found"
          description="Validate a receipt, delivery, transfer, or adjustment to register stock movements."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Operation</th>
                  <th className="py-3 px-4">Movement Route</th>
                  <th className="py-3 px-4 text-right">Delta</th>
                  <th className="py-3 px-4 text-right">Resulting Balance</th>
                  <th className="py-3 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((e) => {
                  const isPositive = e.quantityChange > 0;
                  const isNegative = e.quantityChange < 0;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <Link to={`/products/${e.productId}`} className="hover:text-indigo-600">
                          {e.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                        {e.sku}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge label={e.operationType} variant={e.operationType} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {e.sourceLocationName ? (
                          <span className="font-medium text-slate-800">{e.sourceLocationName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Vendor / External</span>
                        )}
                        <span className="mx-1.5 text-slate-400">&rarr;</span>
                        {e.destLocationName ? (
                          <span className="font-medium text-slate-800">{e.destLocationName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Customer / Consumption</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded ${
                            isPositive
                              ? 'text-emerald-700 bg-emerald-50'
                              : isNegative
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-slate-600 bg-slate-100'
                          }`}
                        >
                          {isPositive ? `+${e.quantityChange}` : e.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {e.resultingQuantity}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {e.performedByName || 'System'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{ledgerEntries.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> journal entries
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
