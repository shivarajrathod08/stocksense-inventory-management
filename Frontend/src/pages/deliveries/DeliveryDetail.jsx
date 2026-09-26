import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Building2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { deliveryApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { LoadingState, ErrorState } from '../../components/common/States';

export default function DeliveryDetail() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchDelivery = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryApi.get(id);
      setDelivery(res.data);
    } catch (err) {
      setError('Failed to load delivery details from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    setError(null);
    try {
      const res = await deliveryApi.validate(id);
      setDelivery(res.data);
      setSuccessMsg('Delivery validated and dispatched! Physical inventory has been deducted and an audit trail recorded in the Stock Ledger.');
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch delivery.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <LoadingState message="Loading delivery details..." />;
  if (error && !delivery) return <ErrorState message={error} onRetry={fetchDelivery} />;

  const isDraft = delivery.status === 'DRAFT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Delivery ${delivery.reference}`}
        subtitle={`Outbound dispatch validation • Status: ${delivery.status}`}
        breadcrumbs={[
          { label: 'Deliveries', to: '/deliveries' },
          { label: delivery.reference },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/deliveries">
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
                Validate & Dispatch Stock
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Source Location
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{delivery.sourceName}</span>
            </div>
            {delivery.warehouseName && (
              <span className="text-xs text-slate-500 pl-6 block">{delivery.warehouseName}</span>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Customer / Destination Reference
            </span>
            <div className="text-slate-900 font-medium text-sm">
              {delivery.notes || 'Direct Customer Fulfillment'}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Fulfillment Status
            </span>
            <div>
              <Badge label={delivery.status} variant={delivery.status} />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Created:</span>{' '}
            {new Date(delivery.createdAt).toLocaleString()} by {delivery.createdByName || 'Staff'}
          </div>
          {delivery.validatedAt && (
            <div>
              <span className="font-semibold text-slate-700">Dispatched:</span>{' '}
              {new Date(delivery.validatedAt).toLocaleString()} by {delivery.validatedByName || 'System'}
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Dispatched Line Items
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Total {delivery.items?.length || 0} line items
          </span>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase">
            <tr>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6 text-right">Dispatch Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {delivery.items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-medium text-slate-900">
                  <Link to={`/products/${item.productId}`} className="hover:text-indigo-600">
                    {item.productName}
                  </Link>
                </td>
                <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-700">
                  {item.sku}
                </td>
                <td className="py-3 px-6 text-right font-mono font-bold text-rose-600 text-base">
                  -{item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleValidate}
        loading={validating}
        title="Dispatch Outbound Delivery"
        message={`Are you sure you want to dispatch delivery ${delivery.reference}? This will immediately reduce stock at "${delivery.sourceName}" and generate outbound audit entries.`}
        confirmText="Confirm & Dispatch"
        variant="primary"
      />
    </div>
  );
}
