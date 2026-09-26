import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, AlertCircle, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
import { adjustmentApi, productApi, referenceApi, inventoryApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';

export default function AdjustmentForm() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [countedQuantity, setCountedQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [autoApply, setAutoApply] = useState(true);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [prodRes, locRes, invRes] = await Promise.all([
          productApi.list({ size: 100 }),
          referenceApi.getLocations(),
          inventoryApi.list(),
        ]);
        setProducts(prodRes.data.content);
        setLocations(locRes.data);
        setInventoryList(invRes.data);

        if (prodRes.data.content.length > 0) {
          setProductId(prodRes.data.content[0].id.toString());
        }
        if (locRes.data.length > 0) {
          setLocationId(locRes.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load form references.');
      } finally {
        setInitLoading(false);
      }
    };
    loadReferences();
  }, []);

  // Compute recorded quantity dynamically
  const recordedQuantity = React.useMemo(() => {
    if (!productId || !locationId) return 0;
    const item = inventoryList.find(
      (i) => i.productId === Number(productId) && i.locationId === Number(locationId)
    );
    return item ? item.quantity : 0;
  }, [productId, locationId, inventoryList]);

  // When product/location changes, default countedQuantity to recorded
  useEffect(() => {
    setCountedQuantity(recordedQuantity);
  }, [recordedQuantity]);

  const difference = countedQuantity - recordedQuantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productId || !locationId) {
      setError('Please select both a product and warehouse location.');
      return;
    }

    if (countedQuantity < 0) {
      setError('Physical counted quantity cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: Number(productId),
        locationId: Number(locationId),
        countedQuantity: Number(countedQuantity),
        reason: reason.trim() || 'Annual physical inventory cycle count',
      };

      const res = await adjustmentApi.create(payload);
      const adjId = res.data.id;

      if (autoApply) {
        await adjustmentApi.apply(adjId);
      }

      navigate('/adjustments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create adjustment.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <LoadingState message="Loading adjustment form..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Record Stock Adjustment"
        subtitle="Reconcile discrepancy between warehouse physical counts and system balances"
        breadcrumbs={[
          { label: 'Adjustments', to: '/adjustments' },
          { label: 'New' },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product to Reconcile <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Physical Warehouse Bin / Location <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.warehouseName ? `${loc.warehouseName} — ` : ''}{loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mathematical Reconcile Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Count Discrepancy Calculation
            </span>

            <div className="grid grid-cols-3 gap-3 items-center text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">System Recorded</span>
                <span className="text-lg font-bold font-mono text-slate-800">{recordedQuantity}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Physical Counted</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={countedQuantity}
                  onChange={(e) => setCountedQuantity(parseInt(e.target.value) || 0)}
                  className="w-20 text-center font-bold font-mono text-lg text-indigo-700 border-b border-indigo-300 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Adjustment Delta</span>
                <span className={`text-lg font-bold font-mono ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {difference > 0 ? `+${difference}` : difference}
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 font-mono">
              Delta = Physical Count ({countedQuantity}) - Recorded ({recordedQuantity}) = {difference > 0 ? `+${difference}` : difference}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reason for Adjustment
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Broken package discarded / Annual physical count reconciliation"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoApply"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="autoApply" className="text-xs text-slate-700 font-medium">
              Immediately apply and commit adjustment to database upon saving
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/adjustments">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              loading={loading}
            >
              {autoApply ? 'Save & Apply Adjustment' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
