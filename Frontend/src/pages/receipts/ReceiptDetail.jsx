import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { receiptApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { LoadingState, ErrorState } from '../../components/common/States';

export default function ReceiptDetail() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchReceipt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await receiptApi.get(id);
      setReceipt(res.data);
    } catch (err) {
      setError('Failed to load receipt details from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    setError(null);
    try {
      const res = await receiptApi.validate(id);
      setReceipt(res.data);
      setSuccessMsg('Receipt successfully validated! Physical inventory has been credited and recorded in the Stock Ledger.');
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to validate receipt.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <LoadingState message="Loading receipt details..." />;
  if (error && !receipt) return <ErrorState message={error} onRetry={fetchReceipt} />;

  const isDraft = receipt.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Receipt ${receipt.reference}`}
        subtitle={`Inbound purchase validation • Status: ${receipt.status}`}
        breadcrumbs={[
          { label: 'Receipts', to: '/receipts' },
          { label: receipt.reference },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/receipts">
              <Button variant="secondary" size="sm">
                Back to List
              </Button>
            </Link>
            {isDraft && (
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setShowConfirm(true)}
              >
                Validate & Receive Stock
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

      {/* Overview Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Destination Location
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{receipt.destinationName}</span>
            </div>
            {receipt.warehouseName && (
              <span className="text-xs text-slate-500 pl-6 block">{receipt.warehouseName}</span>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Supplier / Source
            </span>
            <div className="text-slate-900 font-medium text-sm">
              {receipt.supplierName || 'Standard / Direct Vendor'}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lifecycle Status
            </span>
            <div>
              <Badge label={receipt.status} variant={receipt.status} />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Created:</span>{' '}
            {new Date(receipt.createdAt).toLocaleString()} by {receipt.createdByName || 'Staff'}
          </div>
          {receipt.validatedAt && (
            <div>
              <span className="font-semibold text-slate-700">Validated:</span>{' '}
              {new Date(receipt.validatedAt).toLocaleString()} by {receipt.validatedByName || 'System'}
            </div>
          )}
          {receipt.notes && (
            <div className="sm:col-span-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <span className="font-semibold text-slate-700">Notes:</span> {receipt.notes}
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Received Line Items
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Total {receipt.items?.length || 0} line items
          </span>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase">
            <tr>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6 text-right">Received Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipt.items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-medium text-slate-900">
                  <Link to={`/products/${item.productId}`} className="hover:text-indigo-600">
                    {item.productName}
                  </Link>
                </td>
                <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-700">
                  {item.sku}
                </td>
                <td className="py-3 px-6 text-right font-mono font-bold text-emerald-600 text-base">
                  +{item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleValidate}
        loading={validating}
        title="Validate Inbound Receipt"
        message={`Are you sure you want to validate receipt ${receipt.reference}? This will immediately credit ${receipt.items?.reduce((acc, i) => acc + i.quantity, 0)} units to "${receipt.destinationName}" and record immutable audit ledger entries.`}
        confirmText="Confirm & Credit Stock"
        variant="success"
      />
    </div>
  );
}
