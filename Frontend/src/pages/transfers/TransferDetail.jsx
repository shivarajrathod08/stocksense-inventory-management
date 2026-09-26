import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  CheckCircle2,
  Building2,
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { transferApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { LoadingState, ErrorState } from '../../components/common/States';

export default function TransferDetail() {
  const { id } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transferApi.get(id);
      setTransfer(res.data);
    } catch (err) {
      setError('Failed to load transfer details from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const res = await transferApi.complete(id);
      setTransfer(res.data);
      setSuccessMsg('Transfer completed successfully! Source stock was decremented, destination credited, and corresponding TRANSFER_OUT / TRANSFER_IN audit records generated.');
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete internal transfer.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading transfer details..." />;
  if (error && !transfer) return <ErrorState message={error} onRetry={fetchTransfer} />;

  const isDraft = transfer.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Transfer ${transfer.reference}`}
        subtitle={`Internal location relocation • Status: ${transfer.status}`}
        breadcrumbs={[
          { label: 'Transfers', to: '/transfers' },
          { label: transfer.reference },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/transfers">
              <Button variant="secondary" size="sm">
                Back to List
              </Button>
            </Link>
            {isDraft && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setShowConfirm(true)}
              >
                Complete Putaway
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm text-emerald-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Link to="/ledger" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1">
            Check Ledger <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Transfer Route Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
          {/* Source Location */}
          <div className="md:col-span-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Source Location (Outbound)
            </span>
            <div className="text-slate-900 font-bold text-base">
              {transfer.sourceName}
            </div>
            {transfer.sourceWarehouse && (
              <span className="text-xs text-slate-500 block">{transfer.sourceWarehouse}</span>
            )}
          </div>

          {/* Arrow */}
          <div className="md:col-span-1 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Destination Location */}
          <div className="md:col-span-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Destination Location (Inbound)
            </span>
            <div className="text-slate-900 font-bold text-base">
              {transfer.destinationName}
            </div>
            {transfer.destinationWarehouse && (
              <span className="text-xs text-slate-500 block">{transfer.destinationWarehouse}</span>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Created:</span>{' '}
            {new Date(transfer.createdAt).toLocaleString()} by {transfer.createdByName || 'Staff'}
          </div>
          {transfer.completedAt && (
            <div>
              <span className="font-semibold text-slate-700">Completed:</span>{' '}
              {new Date(transfer.completedAt).toLocaleString()} by {transfer.completedByName || 'System'}
            </div>
          )}
          <div>
            <Badge label={transfer.status} variant={transfer.status} />
          </div>
          {transfer.notes && (
            <div className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <span className="font-semibold text-slate-700">Notes:</span> {transfer.notes}
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Transfer Line Items
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Total {transfer.items?.length || 0} line items
          </span>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase">
            <tr>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6 text-right">Transfer Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transfer.items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-medium text-slate-900">
                  <Link to={`/products/${item.productId}`} className="hover:text-indigo-600">
                    {item.productName}
                  </Link>
                </td>
                <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-700">
                  {item.sku}
                </td>
                <td className="py-3 px-6 text-right font-mono font-bold text-indigo-600 text-base">
                  {item.quantity} units
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleComplete}
        loading={completing}
        title="Complete Stock Transfer"
        message={`Are you sure you want to finalize transfer ${transfer.reference}? This will deduct inventory from "${transfer.sourceName}" and simultaneously credit "${transfer.destinationName}".`}
        confirmText="Confirm & Complete"
        variant="primary"
      />
    </div>
  );
}
